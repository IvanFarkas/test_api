const express = require("express");
const ip = require("ip");
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
// const debug = require("debug"); // TODO: Did not display alongside winston logger

const config = require("./util/config");
const logger = require("./util/logger");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const testRoutes = require("./routes/test");
const test = require("./test/test");

// NodeJS Performance Optimization with Clustering - https://blog.bitsrc.io/nodejs-performance-optimization-with-clustering-b52915054cc2
// Clustering for multithreading (spawn workers)
if (cluster.isMaster) {
	logger.info(`Number of CPUs is ${totalCPUs}`);
	logger.info(`Master ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < totalCPUs; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		logger.info(`worker ${worker.process.pid} died`);
		logger.info("Let's fork another worker!");
		cluster.fork();
	});
} else {
	start();
}

function start() {
	const app = express();
	const router = express.Router();
	const swaggerDocument = YAML.load("api/openapi.yaml");
	const { PORT } = config;

	logger.info(`Worker ${process.pid} started`);

	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
	app.use(express.static("api"));

	/** initialize your `app` and routes */
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json()); // To parse the incoming requests with JSON payloads
	app.use((req, res, next) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		next();
	});
	app.use("/user", userRoutes);
	app.use("/post", postRoutes);
	app.use("/", testRoutes);
	app.use((error, req, res, next) => {
		const status = error.statusCode || 500;
		const message = error.message;
		const data = error.data;
		logger.error(error);
		res.status(status).json({
			message: message,
			data: data,
		});

		// TODO: define standard (best practices) error object
		// res.status(status).json({
		// 	error: {
		// 		type: "request_validation",
		// 		message: err.message,
		// 		errors: err.errors,
		// 	},
		// });
	});

	(async () => {
		app.listen(PORT, () => {
			logger.info(`Test API Process: ${process.pid} - URL: http://${ip.address()}:${PORT}`);
		});
	})();
}
