const config = require("../util/config");
const logger = require("../util/logger");
const { dbDao } = require("./dbService");

const { DATABASE_ID, USERS_ID } = config;

// Manages reading, adding, and updating User in Cosmos DB
class UserDao {
	constructor() {
		this.databaseId = DATABASE_ID;
		this.collectionId = USERS_ID;
		this.database = null;
		this.container = null;
	}

	async create(entity) {
		//Create an item - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#CreateItem
		const db = await dbDao;
		const container = db.user;
		const { resource: createdItem, statusCode: status } = await container.items.upsert(entity);
		logger.info(`Created user: ${createdItem.id} - ${createdItem.name}`);
		return { status: status, payload: createdItem };
	}

	async getById(id) {
		const db = await dbDao;
		const container = db.user;
		const { resource: entity, statusCode: status } = await container.item(id).read();
		logger.info(`Get user: ${id} - ${entity.name}`); //
		return { status: status, payload: entity };
	}

	async getByName(name) {
		// Query items - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#QueryItem
		const db = await dbDao;
		const container = db.user;
		const querySpec = { query: `SELECT * from c where c.name='${name}'` };
		const { resources: entities } = await container.items.query(querySpec).fetchAll();
		logger.info(`Get users(${entities.length})`);
		return { status: 200, payload: entities };
	}

	async getByEmail(email) {
		// Query items - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#QueryItem
		const db = await dbDao;
		const container = db.user;
		const querySpec = { query: `SELECT * from c where c.email='${email}'` };
		const { resources: entities } = await container.items.query(querySpec).fetchAll();
		logger.info(`Get users(${entities.length})`);
		return { status: 200, payload: entities };
	}

	async getAll() {
		// Query items - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#QueryItem
		const db = await dbDao;
		const container = db.user;
		const querySpec = { query: "SELECT * from c" };
		const { resources: entities } = await container.items.query(querySpec).fetchAll();
		logger.info(`Get users(${entities.length})`);
		return { status: 200, payload: entities };
	}

	async update(payload) {
		// Update an item - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#ReplaceItem
		const db = await dbDao;
		const container = db.user;
		const id = payload.id;
		const { resource: updatedItem, statusCode: status } = await container.item(id).replace(payload);
		logger.info(`Updated user: ${id} - ${updatedItem.name}`);
		return { status: status, payload: updatedItem };
	}

	async delete(id) {
		// Delete an item - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#DeleteItem
		const db = await dbDao;
		const container = db.user;
		const { item: item, statusCode: status } = await container.item(id).delete();
		logger.info(`Deleted user(${item.id})`);
		return { status: status, payload: item.id };
	}
}

module.exports = UserDao;
