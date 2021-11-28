const { dbDao } = require("../services/dbService");
const UserDao = require("../services/userService");
const PostDao = require("../services/postService");
const User = require("../models/user");
const Post = require("../models/post");

// DB
let db = null;

class Test {
	constructor() {}

	// User Test
	async user() {
		if (db !== null) {
			db = await dbDao;
		}

		const user1 = new User("Ivan", "ivan.domain.com", "password", "I am new!", []);
		const user2 = new User("Dave", "dave.domain.com", "password2", "I am new 2!", []);
		const userId = "8faef6f7-b25a-4ca2-ad4f-5a5fbe30fe15";
		const userId2 = "1bd0c47f-9ab6-4384-b7f8-7aebc9f43286";
		const userDao = new UserDao();
		// const result1 = await userDao.create(user1);
		// const result2 = await userDao.create(user2);
		const allUsers = await userDao.getAll();
		const users = await userDao.getByName(user1.name);
		const users2 = await userDao.getByEmail(user1.email);
		const userResult = await userDao.getById(userId);
		const user = userResult.payload;
		user1.id = userId;
		user1.status = "I am updated!";
		// const user3 = await userDao.update(user1);
		// const result = await userDao.delete(userId2);
	}

	// Post Test
	async post(user) {
		if (db !== null) {
			db = await dbDao;
		}

		const post1 = new Post("Title 1", "ImageUrl 1", "Content 1", [user.internals.id]);
		const post2 = new Post("Title 2", "ImageUrl 2", "Content 2", [user.internals.id]);
		const postId = "fadc2c33-91e2-4318-929e-facb3c066159";
		const postId2 = "a336c960-c4a8-4e15-9808-d43d5c12ba92";
		const postDao = new PostDao();
		// const result1 = await postDao.create(post1);
		// const result2 = await postDao.create(post2);
		const allPosts = await postDao.getAll();
		const posts = await postDao.getByTitle(post1.title);
		const post = await postDao.getById(postId);
		post1.id = postId;
		post1.content = "Content Updated!";
		// const post3 = await postDao.update(post1);
		// const result = await postDao.delete(postId2);
	}
}

module.exports = Test;
