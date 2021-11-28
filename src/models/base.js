const Internals = require("./internals");

class Base {
	constructor(internals) {
		this.internals = internals;
	}

	toString() {
		return JSON.stringify(this);
	}
}

module.exports = Base;
