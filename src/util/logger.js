const { createLogger, format, transports } = require("winston");
const config = require("./config");

const { LOG_LEVEL, NODE_ENV } = config;

const level = LOG_LEVEL || "debug";
const silent = NODE_ENV === "test";
const transportList = [];
const isProduction = NODE_ENV === "production";

if (isProduction) {
	transportList.push(new transports.Console({ format: format.simple() }));
} else {
	// new transports.Console({ level: level })
	transportList.push(new transports.Console({ format: format.combine(format.colorize(), format.simple()) }));
}
transportList.push(new transports.File({ level: "error", filename: "logs/server.log" }));

const logConfiguration = {
	level: level,
	silent: silent,
	// format: format.combine(format.timestamp(), format.errors({ stack: true }), format.splat(), format.json()),
	format: format.combine(
		format.colorize(),
		format.timestamp(),
		format.align(),
		format.printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
	),
	// defaultMeta: { module: name },
	transports: transportList,
	exitOnError: false,
	meta: false,
	msg: "HTTP  ",
	expressFormat: true,
	colorize: false,
	ignoreRoute: (req, res) => {
		return false;
	},
};

module.exports = createLogger(logConfiguration);
