const Base = require("./base");
const Internals = require("./internals");

class Post extends Base {
	constructor(title, content, imageUrl, creator, internals) {
		// Call 'Base' base class before reference 'this'
		super(internals);

		this.title = title;
		this.content = content;
		this.imageUrl = imageUrl;
		this.creator = creator;
	}

	toEntity(entity) {
		return new Post(entity.title, entity.content, entity.imageUrl, entity.creator, new Internals(entity.id, entity._rid, entity._self, entity._etag, entity._attachments, entity._ts));
	}

	toEntities(entities) {
		const list = [];
		entities.forEach((entity) => {
			const post = new Post(entity.title, entity.content, entity.imageUrl, entity.creator, new Internals(entity.id, entity._rid, entity._self, entity._etag, entity._attachments, entity._ts));
			list.push(post);
		});
		return list;
	}

	toString() {
		return JSON.stringify(this);
	}
}

module.exports = Post;
