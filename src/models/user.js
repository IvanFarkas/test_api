const Base = require("./base");
const Internals = require("./internals");

class User extends Base {
	constructor(name, email, password, role, status, posts, internals) {
		// Call 'Base' base class before reference 'this'
		super(internals);

		this.name = name;
		this.email = email;
		this.password = password;
		this.role = role;
		this.status = status;
		this.posts = posts;
	}

	toEntity(entity) {
		return new User(entity.name, entity.email, entity.password, entity.role, entity.status, entity.posts, new Internals(entity.id, entity._rid, entity._self, entity._etag, entity._attachments, entity._ts));
	}

	toString() {
		return JSON.stringify(this);
	}
}

module.exports = User;
