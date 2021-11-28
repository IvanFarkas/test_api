function test(prefix) {
	var context = getContext();
	var collection = context.getCollection();
	var collectionLink = collection.getSelfLink();
	var response = context.getResponse();

	// Query documents and take 1st item.
	var isAccepted = collection.queryDocuments(collectionLink, "SELECT * FROM root r", (err, feed, options) => {
		if (err) {
			throw err;
		}

		// Check the feed and if empty, set the body to 'no docs found', else take 1st element from feed
		if (!feed || !feed.length) {
			response.setBody("no docs found");
		} else {
			var body = { prefix: prefix, feed: feed[0] };
			response.setBody(JSON.stringify(body));
		}
	});

	if (!isAccepted) {
		throw new Error("The query was not accepted by the server.");
	}
}
