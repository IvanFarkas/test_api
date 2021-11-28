const config = require("../util/config");
const logger = require("../util/logger");
const { dbDao } = require("./dbService");

const { DATABASE_ID, POSTS_ID, PARTITION_KEY } = config;

// Manages reading, adding, and updating Post in Cosmos DB
class PostDao {
	constructor() {
		this.databaseId = DATABASE_ID;
		this.collectionId = POSTS_ID;
		this.database = null;
		this.container = null;
	}

	async create(entity) {
		//Create an item - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#CreateItem
		const db = await dbDao;
		const container = db.post;
		const { resource: createdItem, statusCode: status } = await container.items.upsert(entity);
		logger.info(`Created post: ${createdItem.id} - ${createdItem.title}`);
		return { status: status, payload: createdItem };
	}

	//TODO: Create stored proc for post creation, add post id to user
	async createWithSP(userId, entity) {
		//Create an item - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#CreateItem
		const db = await dbDao;
		const container = db.post;
		const sprocId = "CreatePost";
		const { resource: createdItem, statusCode: status } = await container.scripts.storedProcedure(sprocId).execute(entity, { partitionKey: PARTITION_KEY });
		logger.info(`Created post: ${createdItem.id} - ${createdItem.title}`);
		return { status: status, payload: createdItem };
	}

	async getById(id) {
		const db = await dbDao;
		const container = db.post;
		const { resource: entity, statusCode: status } = await container.item(id).read();
		logger.info(`Get post: ${id} - ${entity ? entity.title : "Not Found!"}`);
		return { status: status, payload: entity };
	}

	async getByTitle(title) {
		// Query items - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#QueryItem
		const db = await dbDao;
		const container = db.post;
		const querySpec = { query: `SELECT * from c where c.title='${title}'` };
		const { resources: entities } = await container.items.query(querySpec).fetchAll();
		logger.info(`Get posts(${entities.length})`);
		return { status: 200, payload: entities };
	}

	async getAll() {
		// Query items - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#QueryItem
		const db = await dbDao;
		const container = db.post;
		const querySpec = { query: "SELECT * from c" };
		const { resources: entities } = await container.items.query(querySpec).fetchAll();
		logger.info(`Get posts(${entities.length})`);
		return { status: 200, payload: entities };
	}

	async count() {
		// Query items - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#QueryItem
		const db = await dbDao;
		const container = db.post;
		const querySpec = { query: "SELECT COUNT(1) FROM c" };
		const { resources: results } = await container.items.query(querySpec).fetchAll();
		const count = results ? results[0].$1 : 0;
		logger.info(`Post count: ${count}`);
		return { status: 200, payload: count };
	}

	async update(entity) {
		// Update an item - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#ReplaceItem
		const db = await dbDao;
		const container = db.post;
		const id = entity.id;
		const { resource: updatedItem, statusCode: status } = await container.item(id).replace(entity);
		logger.info(`Updated post: ${id} - ${updatedItem.title}`);
		return { status: status, payload: updatedItem };
	}

	async delete(id) {
		// Delete an item - https://docs.microsoft.com/en-us/azure/cosmos-db/sql/sql-api-nodejs-get-started#DeleteItem
		const db = await dbDao;
		const container = db.post;
		const { item: item, statusCode: status } = await container.item(id).delete();
		logger.info(`Deleted post(${item.id})`);
		return { status: status, payload: item.id };
	}
}

module.exports = PostDao;
