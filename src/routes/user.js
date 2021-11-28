const express = require("express");
const { body } = require("express-validator");
// TODO: Integrate Ajv (Another JSON Schema Validator) - https://simonplend.com/how-to-handle-request-validation-in-your-express-api/
// const { Validator } = require("express-json-validator-middleware");
// const { validate } = new Validator();

const UserDao = require("../services/userService");
const User = require("../models/user");

const controller = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.put(
	"/",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter a valid email.")
			.custom(async (value, { req }) => {
				const userDao = new UserDao();
				const users = await userDao.getByEmail(value);
				return users.payload.length === 0 ? Promise.resolve() : Promise.reject("E-Mail address already exists!");
			})
			.normalizeEmail(),
		body("password").trim().isLength({ min: 5 }),
		body("name").trim().not().isEmpty(),
	],
	controller.signup
);

router.post("/login", controller.login);

router.get("/", isAuth, controller.get);

router.get("/status", isAuth, controller.getStatus);

router.patch("/status", isAuth, [body("status").trim().not().isEmpty()], controller.updateStatus);

module.exports = router;
