const db = require('../../../db/connection/db');

// create

// update
// delete
const deleteFriend = (user_id, friend_id) => {
	return db
		.query({
			text: `
			DELETE
			FORM friends
			WHERE friendlist_id IN
			(SELECT fl.id
			FROM friendlists fl
			WHERE fl.user_id IN (3,4)) and friend_id IN (3,4)
			RETURNING *;`,
			values: [user_id, friend_id],
			name: 'add_friend'
		})
		.then((res) => res.rows);
};

// blocks********************
// index
// create
// delete

// chatroom / participants********************
// create
const addChatroomParticipant = (user_id, chatroom_id) => {
	return db
		.query({
			text: `
		INSERT INTO participants (user_id, chatroom_id) VALUES ($1,$2) RETURNING *`,
			values: [user_id, chatroom_id],
			name: 'add_chatroom_participant'
		})
		.then((res) => res.rows[0]);
};

// update --> this toggles the is_admin status
const updateChatroomParticipant = (user_id, chatroom_id) => {
	return db.query({
		text: `UPDATE participants
		SET is_admin = NOT is_admin
		WHERE user_id = $1 and chatroom_id = $2
		RETURNING *`,
		values: [user_id, chatroom_id],
		name: 'update_chatroom_participant'
	});
};
// delete
const deleteChatroomParticipant = (user_id, chatroom_id) => {
	return db.query({
		text: `DELETE
		FROM participants
		WHERE user_id = $1 and chatroom_id = $2
		RETURNING *`,
		values: [user_id, chatroom_id],
		name: 'update_chatroom_participant'
	});
};

const getMessages = (user_id, chatroom_id) => {
	return db
		.query({
			text: `SELECT *
      FROM chatrooms c join messages m on c.id = m.chatroom_id
      JOIN user_message_views umv on umv.message_id = m.id
      WHERE umv.user_id = $1 and c.id = $2
    `,
			values: [user_id, chatroom_id],
			name: 'get_message_query'
		})
		.then((res) => res.rows);
};

module.exports = {
	createChatroom,
	getAllChatroomMessages,
	getRecentChatroomMessages,
	getActiveChatrooms
};
