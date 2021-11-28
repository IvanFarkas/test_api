const os = require("os");
const logger = require("../util/logger");
const { dbDao } = require("../services/dbService");
const { TestService } = require("../services/testService");

exports.root = async (req, res, next) => {
	const clientIP = req.headers["host"];
	const message = `Host ${os.hostname()}, IP: ${clientIP}!`;

	logger.info(message);
	res.status(200).json({ message: message });
};

exports.health = async (req, res, next) => {
	const data = {
		uptime: process.uptime(),
		message: "Ok",
		date: new Date(),
	};

	res.status(200).send(data);
};

exports.readyness = async (req, res, next) => {
	try {
		const db = await dbDao;
		const dbCount = await db.isDbReady();

		res.status(200).send(dbCount);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.cluster = async (req, res, next) => {
	try {
		const start = process.hrtime();
		const base = 8;
		let result = 0;

		for (let i = Math.pow(base, 7); i >= 0; i--) {
			result += i + Math.pow(i, 10);
		}
		const stop = process.hrtime(start);
		const elapsed = (stop[0] * 1e9 + stop[1]) / 1e9;

		logger.info(`Elapsed: ${elapsed} - Result: ${result} - ON PROCESS ${process.pid}`);
		res.status(200).send(`Result: ${result}`);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.redis = async (req, res, next) => {
	try {
		const start = process.hrtime();
		const svc = new TestService();
		const result = await svc.get();

		const stop = process.hrtime(start);
		const elapsed = (stop[0] * 1e9 + stop[1]) / 1e9;

		logger.info(`Elapsed: ${elapsed} - Result: ${result} - ON PROCESS ${process.pid}`);
		res.status(200).send(result);
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};
