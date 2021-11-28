const Redis = require("ioredis");
const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = require("../util/config");
const logger = require("../util/logger");

class RedisService {
	constructor() {
		this.host = REDIS_HOST;
		this.port = REDIS_PORT;
		this.username = REDIS_USERNAME;
		this.password = REDIS_PASSWORD;
		this.redis = new Redis({
			host: this.host,
			port: this.port,
			username: this.username,
			password: this.password,
		});
	}

	async get(key) {
		const json = await this.redis.get(key);
		const obj = JSON.parse(json);

		return obj;
	}

	/* expirymode: - https://redis.io/commands/set
      EX seconds - Set the specified expire time, in seconds.
      PX milliseconds - Set the specified expire time, in milliseconds.
      EXAT timestamp-seconds - Set the specified Unix time at which the key will expire, in seconds.
      PXAT timestamp-milliseconds - Set the specified Unix time at which the key will expire, in milliseconds.
      NX - Only set the key if it does not already exist.
      XX - Only set the key if it already exist.
      KEEPTTL - Retain the time to live associated with the key.
      GET - Return the old string stored at key, or nil if key did not exist. An error is returned and SET aborted if the value stored at key is not a string.
    
    setmode: - https://redis.io/commands/expire
      NX -- Set expiry only when the key has no expiry
      XX -- Set expiry only when the key has an existing expiry
      GT -- Set expiry only when the new expiry is greater than current one
      LT -- Set expiry only when the new expiry is less than current one
  */
	async set(key, value, expirymode, time, setmode) {
		const obj = value;
		const json = JSON.stringify(obj);

		return await this.redis.set(key, json, expirymode, time, setmode);
	}
}

module.exports = { RedisService };
