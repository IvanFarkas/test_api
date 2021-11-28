const jwt = require("jsonwebtoken");
const logger = require("../util/logger");
const config = require("../util/config");

const { SECRET } = config;

// logger.info(`SECRET: ${config.SECRET}`);

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		const error = new Error("Not authenticated.");
		error.statusCode = 401; // Unauthorized
		throw error;
	}
	const token = authHeader.split(" ")[1];
	jwt.verify(token, SECRET, (err, user) => {
		if (err) {
			const error = new Error("Forbidden.");
			error.statusCode = 403; // Forbidden
			throw error;
		}
		req.user = user;
		req.userId = user.sub;
		next();
	});
};
