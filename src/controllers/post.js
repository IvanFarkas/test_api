const { validationResult } = require("express-validator");
const logger = require("../util/logger");
const UserDao = require("../services/userService");
const PostDao = require("../services/postService");
const User = require("../models/user");
const Post = require("../models/post");

class PostCtrl {
	constructor() {}

	async create(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const error = new Error("Validation failed, entered data is incorrect.");
				error.statusCode = 422;
				throw error;
			}

			const { role } = req.user;
			if (role !== "admin") {
				const error = new Error("Unauthorized to add posts.");
				error.statusCode = 403;
				throw error;
			}

			const title = req.body.title;
			const content = req.body.content;
			const imageUrl = req.body.imageUrl;
			const creator = req.userId;

			let post = new Post(title, content, imageUrl, creator);
			const postDao = new PostDao();
			const postResult = await postDao.create(post);
			const status = postResult.status;
			const postDb = postResult.payload;
			post = post.toEntity(postDb);

			// Update user with post
			let user = new User();
			const userDao = new UserDao();
			const userResult = await userDao.getById(req.userId);
			let userDb = userResult.payload;
			userDb.posts.push(postDb.id);
			const userUpdateResult = await userDao.update(userDb);
			userDb = userUpdateResult.payload;
			user = user.toEntity(userDb);
			logger.info(`post: ${post}`);
			res.status(status).json(post);
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	//TODO: Create stored proc for post creation, add post id to user
	async createWithSP(req, res, next) {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const error = new Error("Validation failed, entered data is incorrect.");
				error.statusCode = 422;
				throw error;
			}

			const { role } = req.user;
			if (role !== "admin") {
				const error = new Error("Unauthorized to add posts.");
				error.statusCode = 403;
				throw error;
			}

			const title = req.body.title;
			const content = req.body.content;
			const imageUrl = req.body.imageUrl;
			const creator = req.userId;

			// Cal sp

			//logger.info(`post: ${post}`);
			res.status(200).json("post");
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	async get(req, res, next) {
		try {
			const id = req.params.id;
			const post = new Post();
			const postDao = new PostDao();
			const result = await postDao.getById(id);
			const status = result.status;
			const payload = result.payload;

			if (!payload) {
				const error = new Error("Could not find post.");
				error.statusCode = 404;
				throw error;
			}

			const entity = post.toEntity(payload);

			logger.info(`post: ${entity}`);
			res.status(status).json(entity);
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	async getAll(req, res, next) {
		try {
			const currentPage = req.query.page || 1;
			const perPage = 2;
			const post = new Post();
			const postDao = new PostDao();
			const countResult = await postDao.count();
			const countStatus = countResult.status;
			const totalItems = countResult.payload;
			const result = await postDao.getAll();
			const status = result.status;
			const payload = result.payload;
			const entities = post.toEntities(payload);

			//TODO: Pagination in Azure Cosmos DB - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-query-pagination

			logger.info(`post: ${entities.length}`);
			res.status(status).json({ message: "Fetched posts successfully.", posts: entities, totalItems: totalItems });
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	async update(req, res, next) {
		try {
			const id = req.params.id;
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				const error = new Error("Validation failed, entered data is incorrect.");
				error.statusCode = 422;
				throw error;
			}
			const title = req.body.title;
			const content = req.body.content;
			const imageUrl = req.body.imageUrl;
			const creator = req.userId;
			if (!imageUrl) {
				const error = new Error("No file picked.");
				error.statusCode = 422;
				throw error;
			}

			let post = new Post();
			const postDao = new PostDao();
			let result = await postDao.getById(id);
			let status = result.status;
			let postDb = result.payload;

			if (!postDb) {
				const error = new Error("Could not find post.");
				error.statusCode = 404;
				throw error;
			}
			if (postDb.creator !== creator) {
				const error = new Error("Not authorized!");
				error.statusCode = 403;
				throw error;
			}

			postDb.title = title;
			postDb.content = content;
			postDb.imageUrl = imageUrl;
			result = await postDao.update(postDb);
			status = result.status;
			const payload = result.payload;
			const entity = post.toEntity(payload);

			logger.info(`post: ${entity}`);
			res.status(status).json({ message: "Post updated!", post: entity });
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}

	//TODO: Create stored proc for post deletion, remove post id from user
	async delete(req, res, next) {
		try {
			const id = req.params.id;
			const creator = req.userId;
			let post = new Post();
			const postDao = new PostDao();
			let result = await postDao.getById(id);
			let status = result.status;
			let postDb = result.payload;
			post = post.toEntity(postDb);

			if (!postDb) {
				const error = new Error("Could not find post.");
				error.statusCode = 404;
				throw error;
			}
			if (postDb.creator !== creator) {
				const error = new Error("Not authorized!");
				error.statusCode = 403;
				throw error;
			}

			result = await postDao.delete(id);
			status = result.status;
			const deletedId = result.payload;

			// Remove post from user
			let user = new User();
			const userDao = new UserDao();
			const userResult = await userDao.getById(creator);
			let userDb = userResult.payload;
			userDb.posts = userDb.posts.filter((value) => {
				return value !== id;
			});
			const userUpdateResult = await userDao.update(userDb);
			userDb = userUpdateResult.payload;
			user = user.toEntity(userDb);

			logger.info(`Deleted post: ${deletedId}`);
			res.status(200).json({ message: "Deleted post.", postId: deletedId });
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}
}

module.exports = new PostCtrl();
