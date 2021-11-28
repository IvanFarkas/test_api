// Connect and query data from Cosmos DB SQL API - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/create-sql-api-nodejs
// Database - https://docs.microsoft.com/en-us/rest/api/cosmos-db/databases
// Collection - https://docs.microsoft.com/en-us/rest/api/cosmos-db/collections
// App with the JavaScript SDK to manage Azure Cosmos DB SQL API data - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started
const cosmos = require("@azure/cosmos");
const config = require("../util/config");
const logger = require("../util/logger");

const cosmosClient = cosmos.CosmosClient;

const { COSMOS_ENDPOINT, COSMOS_KEY, PARTITION_KEY, DATABASE_ID, USERS_ID, POSTS_ID } = config;

class DbDao {
	/**
	 * Manages reading, adding, and updating Tasks in Cosmos DB
	 * @param {CosmosClient} cosmosClient
	 * @param {string} databaseId
	 * @param {string} containerId
	 */
	constructor() {
		this.client = cosmosClient;
		this.databaseId = DATABASE_ID;
		this.collectionIds = [USERS_ID, POSTS_ID];
		this.database = null;
		this.user = null;
		this.post = null;
	}

	async createDb() {
		return;

		// Create a database and a container - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#create-a-database-and-a-container
		const clientOptions = { endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY };

		this.client = new cosmosClient(clientOptions);

		// Create database if not exist
		const dbRequest = { id: this.databaseId, throughput: 400 };
		const dbOptions = { offerThroughput: 400 };
		const dbResult = await this.client.databases.createIfNotExists(dbRequest, dbOptions);
		this.database = dbResult.database;
		logger.info(`Created database: ${this.database.id}`);

		// Create containers if not exist
		for (const id of this.collectionIds) {
			const containerRequest = { id: id, partitionKey: PARTITION_KEY };
			const containerOptions = { offerThroughput: 400 };
			const containerResult = await this.database.containers.createIfNotExists(containerRequest, containerOptions);
			const container = containerResult.container;
			logger.info(`Created container: ${container.id}`);
			switch (id) {
				case "users":
					this.user = container;
					break;
				case "posts":
					this.post = container;
					break;
			}
		}

		return this;
	}

	async isDbReady() {
		try {
			const query = `SELECT * FROM root r WHERE r.id="${DATABASE_ID}"`;
			const querySpec = { query: query };
			const { resources: databaseList } = await this.client.databases.query(querySpec).fetchAll();
			const result = databaseList.length === 1;

			if (!result) {
				logger.info(`Datebase ready: ${result}`);
			}
			return { status: 200, payload: result };
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		}
	}
}

const dbDao = new DbDao().createDb();

module.exports = {
	dbDao,
	DbDao,
};
