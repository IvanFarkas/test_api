const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../util/logger");
const config = require("../util/config");
const UserDao = require("../services/userService");
const User = require("../models/user");

const { SECRET } = config;

class UserCtrl {
	constructor() {}

	async signup(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const error = new Error("Validation failed.");
				error.statusCode = 422;
				error.data = errors.array();
				throw error;
			}
			const name = req.body.name;
			const email = req.body.email;
			const password = req.body.password;
			const role = req.body.role;

			// Simulate invalid login
			if (name === "invalid") {
				const error = new Error(`invalid uid/pw! - ${name}/${password}`);
				error.statusCode = 422;
				error.data = errors.array();
				throw error;
			} else {
				const hashedPw = await bcrypt.hash(password, 12);
				const user = new User(name, email, hashedPw, role, "I am new!", []);
				const userDao = new UserDao();
				const result = await userDao.create(user);
				const status = result.status;
				const entity = user.toEntity(result.payload);

				logger.info(`user: ${user}`);
				res.status(status).json(entity);
			}
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	/*
  https://jwt.io/
  {
    "sub": "616be64e7aed00e914a0a25b",
    "email": "test@domain.com",
    "role": "admin",
    "iat": 1516239022
  }
  */
	async login(req, res, next) {
		const email = req.body.email;
		const password = req.body.password;
		let loadedUser;
		let loadedUserId;
		try {
			let user = new User();
			const userDao = new UserDao();
			const result = await userDao.getByEmail(email);
			const status = result.status;
			user = result.payload.length > 0 ? user.toEntity(result.payload[0]) : null;

			if (!user) {
				const error = new Error("A user with this email could not be found.");
				error.statusCode = 404; // Not Found
				throw error;
			}

			loadedUser = user;
			loadedUserId = loadedUser.internals.id;

			const isEqual = await bcrypt.compare(password, user.password);
			if (!isEqual) {
				const error = new Error("Wrong password!");
				error.statusCode = 401; // Unauthorized
				throw error;
			}

			//TODO: Add JWT refresh token - https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
			const signOptions = {
				algorithm: "HS256",
				expiresIn: "1d",
			};
			const payload = {
				// JWT (JSON Web Tokens) - https://jwt.io
				sub: loadedUserId,
				email: loadedUser.email,
				name: loadedUser.name,
				role: loadedUser.role,
			};
			const token = jwt.sign(payload, SECRET, signOptions);
			logger.info(`token: ${token}`);
			res.status(200).json({ userId: loadedUserId, token: token });
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	async get(req, res, next) {
		try {
			const user = new User();
			const userDao = new UserDao();
			const result = await userDao.getById(req.userId);
			const status = result.status;
			const payload = result.payload;

			if (!payload) {
				const error = new Error("User not found.");
				error.statusCode = 404;
				throw error;
			}

			const entity = user.toEntity(result.payload);

			res.status(status).json(entity);
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	async getStatus(req, res, next) {
		try {
			let user = new User();
			const userDao = new UserDao();
			const result = await userDao.getById(req.userId);
			const status = result.status;
			const entity = user.toEntity(result.payload);

			if (!user) {
				const error = new Error("User not found.");
				error.statusCode = 404;
				throw error;
			}
			logger.info(`user: ${entity}`);
			res.status(status).json({ status: entity.status });
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	async updateStatus(req, res, next) {
		const newStatus = req.body.status;
		try {
			let user = new User();
			const userDao = new UserDao();
			let result = await userDao.getById(req.userId);
			let status = result.status;
			let payload = result.payload;

			if (!payload) {
				const error = new Error("User not found.");
				error.statusCode = 404;
				throw error;
			}

			payload.status = newStatus;
			result = await userDao.update(payload);
			status = result.status;
			payload = result.payload;
			const entity = user.toEntity(payload);

			logger.info(`user: ${entity}`);
			res.status(status).json({ message: "User updated." });
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	//TODO: Add delete
}

module.exports = new UserCtrl();
