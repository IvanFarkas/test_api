require("dotenv").config();

const config = {
	NODE_ENV: process.env.NODE_ENV,
	LOG_LEVEL: process.env.LOG_LEVEL,
	DEBUG: process.env.DEBUG,
	PORT: process.env.PORT || 5000,
	COSMOS_ENDPOINT: process.env.COSMOS_ENDPOINT,
	COSMOS_KEY: process.env.COSMOS_KEY,
	DATABASE_ID: process.env.DATABASE_ID,
	USERS_ID: process.env.USERS_ID,
	POSTS_ID: process.env.POSTS_ID,
	PARTITION_KEY: process.env.PARTITION_KEY,
	SECRET: process.env.SECRET,
	APPINSIGHTS_INSTRUMENTATIONKEY: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
	MOCK_SERVER_URL: process.env.MOCK_SERVER_URL,
	REDIS_HOST: process.env.REDIS_HOST,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_USERNAME: process.env.REDIS_USERNAME,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};

module.exports = config;
