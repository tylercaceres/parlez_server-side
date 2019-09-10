const db = require("../../../../db/connection/db");

const createChatroom = (chatroom_type, name, user_id, users_arr, avatar = null) => {
  return db
    .query({
      text: `
			with new_chat_id as (INSERT INTO chatrooms (chatroom_type, name, avatar) VALUES ($1,$2,$3) returning id)
			insert into participants (user_id, chatroom_id, is_admin) 
				(select user_id, id, user_id = $4 from new_chat_id cross join unnest($5::integer[]) as user_id) returning *;
    `,
      values: [chatroom_type, name, avatar, user_id, users_arr],
      name: "create_chatroom"
    })
    .then(res => res.rows);
};

const addChatroomParticipant = (user_id, chatroom_id) => {
  return db
    .query({
      text: `
		INSERT INTO participants (user_id, chatroom_id) VALUES ($1,$2) RETURNING *`,
      values: [user_id, chatroom_id],
      name: "add_chatroom_participant"
    })
    .then(res => res.rows[0]);
};

const getActiveChatrooms = user_id => {
  return db
    .query({
      text: `SELECT *
		FROM participants
		WHERE user_id = $1
		;`,
      values: [user_id],
      name: "get_active_chatrooms"
    })
    .then(res => res.rows);
};

const updateChatroom = (chatroom_id, name = null, avatar = null) => {
  let queryString = "";
  let queryValues = [];
  if (!avatar && !name) {
    queryString = `UPDATE chatrooms
		SET name = $2, avatar = $3
		WHERE id = $1
    RETURNING *;
		`;
    queryValues = [chatroom_id, name, avatar];
  } else if (!name) {
    queryString = `UPDATE chatrooms
			SET name = $2
			WHERE id = $1
    RETURNING *;
		`;
    queryValues = [chatroom_id, name];
  } else {
    queryString = `UPDATE chatrooms
		SET avatar = $2
		WHERE id = $1
		RETURNING *;
		`;
    queryValues = [chatroom_id, avatar];
  }
  return db
    .query({
      text: queryString,
      values: queryValues,
      name: "update_chatroom"
    })
    .then(res => res.rows[0]);
};

// update --> this toggles the is_admin status
const updateChatroomParticipant = (user_id, chatroom_id) => {
  return db.query({
    text: `UPDATE participants
		SET is_admin = NOT is_admin
		WHERE user_id = $1 and chatroom_id = $2
		RETURNING *`,
    values: [user_id, chatroom_id],
    name: "update_chatroom_participant"
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
    name: "update_chatroom_participant"
  });
};

const deleteViewableMessages = (user_id, chatroom_id) => {
  return db
    .query({
      text: `
			DELETE FROM user_message_views WHERE user_id = $1 and message_id IN
			(SELECT id FROM messages where chatroom_id = $2) RETURNING *;
		`,
      values: [user_id, chatroom_id],
      name: "leave_chatroom_remove_messages"
    })
    .then(res => res.rows);
};

module.exports = {
  createChatroom,
  addChatroomParticipant,
  getActiveChatrooms,
  updateChatroom,
  updateChatroomParticipant,
  deleteChatroomParticipant,
  deleteViewableMessages
};
