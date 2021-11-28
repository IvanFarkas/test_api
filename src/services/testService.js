const got = require("got");
const { MOCK_SERVER_URL } = require("../util/config");
const logger = require("../util/logger");
const { RedisService } = require("./redisService");

class TestService {
	constructor() {
		this.url = MOCK_SERVER_URL;
	}

	async get() {
		const key = "TestKey";
		const redisSvc = new RedisService();
		const cache = await redisSvc.get(key);

		if (cache) {
			logger.info(`Get data from cache.`);
			return cache;
		} else {
			const response = await got(this.url).json();
			redisSvc.set(key, response, "EX", 60 * 2, "NX");
			logger.info(`Get data from Mock Server.`);
			return { status: 200, payload: response };
		}
	}
}

module.exports = { TestService };
