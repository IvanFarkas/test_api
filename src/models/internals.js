class Internals {
	constructor(id, rid, self, etag, attachments, ts) {
		this.id = id;
		this.rid = rid;
		this.self = self;
		this.etag = etag;
		this.attachments = attachments;
		this.ts = ts;
	}

	toString() {
		return JSON.stringify(this);
	}
}

module.exports = Internals;
