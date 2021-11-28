/**
 * A CosmosDB stored procedure to add post and update user.<br/>
 *
 * @function
 * @param {string} userId - User Id
 * @param {object} post
 */
function createPost(userId, post) {
	var context = getContext();
	var collection = context.getCollection();
	var collectionLink = collection.getSelfLink();
	var response = context.getResponse();
	var userDocument;
	var postDocument;

	if (!userId) {
		throw new Error("The user id is undefined or null.");
	}
	if (!post) {
		throw new Error("The post is undefined or null.");
	}

	var isPostAccepted = collection.createDocument(collectionLink, post, (postError, postDoc) => {
		if (postError) {
			throw new Error(`Error: ${postError.message}`);
		}
		var isUserAccepted = collection.createDocument(collectionLink, secondDocument, (userError, userDoc) => {
			if (userError) {
				throw new Error(`Error: ${userError.message}`);
			}
			response.setBody({
				ststus: 201,
				resource: postDoc,
			});
		});
		if (!isUserAccepted) {
			return;
		}
	});
	if (!isPostAccepted) {
		return;
	}
}

// var options = { disableAutomaticIdGeneration: false };
// var isAccepted = collection.createDocument(collectionLink, item, options, callback);
// if (!isAccepted) {
//   response.setBody(count);
// }

// // query for user
// var filterQuery = {
//   query: "SELECT * FROM Players p where p.id = @playerId1",
//   parameters: [{ name: "@playerId1", value: playerId1 }],
// };

// var accept = collection.queryDocuments(collectionLink, filterQuery, {}, function (err, items, responseOptions) {
//   if (err) throw new Error("Error" + err.message);

//   if (items.length != 1) throw "Unable to find both names";
//   player1Item = items[0];

//   var filterQuery2 = {
//     query: "SELECT * FROM Players p where p.id = @playerId2",
//     parameters: [{ name: "@playerId2", value: playerId2 }],
//   };
//   var accept2 = collection.queryDocuments(collectionLink, filterQuery2, {}, function (err2, items2, responseOptions2) {
//     if (err2) throw new Error("Error" + err2.message);
//     if (items2.length != 1) throw "Unable to find both names";
//     player2Item = items2[0];
//     swapTeams(player1Item, player2Item);
//     return;
//   });
//   if (!accept2) throw "Unable to read player details, abort ";
// });

// if (!accept) throw "Unable to read player details, abort ";

// // swap the two players’ teams
// function swapTeams(player1, player2) {
//   var player2NewTeam = player1.team;
//   player1.team = player2.team;
//   player2.team = player2NewTeam;

//   var accept = collection.replaceDocument(player1._self, player1, function (err, itemReplaced) {
//     if (err) throw "Unable to update player 1, abort ";

//     var accept2 = collection.replaceDocument(player2._self, player2, function (err2, itemReplaced2) {
//       if (err) throw "Unable to update player 2, abort";
//     });

//     if (!accept2) throw "Unable to update player 2, abort";
//   });

//   if (!accept) throw "Unable to update player 1, abort";
// }
