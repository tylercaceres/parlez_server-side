const db = require('../../../../db/connection/db');

const getUserInfo = (user_id) => {
	return db
		.query({
			text: `SELECT email, username, avatar, status
			FROM users
			where id = $1
			;`,
			values: [user_id],
			name: 'get_user_info'
		})
		.then((res) => res.rows[0]);
};

const getFriendInfo = (user_id) => {
	return db
		.query({
			text: `SELECT f.friend_id as id, u.email as email, u.username as username, u.avatar as avatar, u.status as status
			FROM friendlists fl join friends f on fl.id = f.friendlist_id
			join users u on u.id = f.friend_id
			where fl.user_id = $1 and f.invitation_accepted_at IS NOT NULL and u.is_active = true
			;`,
			values: [user_id],
			name: 'get_friend_list'
		})
		.then((res) => res.rows);
};

const deleteFriend = (user_id, friend_id) => {
	return db
		.query({
			text: `
			DELETE FROM friends WHERE id IN
			(SELECT f.id
			FROM users u join friendlists fl on u.id = fl.user_id
			join friends f on f.friendlist_id = fl.id
			WHERE (u.id = $1 and f.friend_id = $2) or (u.id = $2 and f.friend_id = $1))
			RETURNING *;`,
			values: [user_id, friend_id],
			name: 'delete_friend'
		})
		.then((res) => res.rows);
};

const addFriend = (user_id, friend_id) => {
	db.query({
		text: `INSERT INTO friends (friend_id, friendlist_id)
		SELECT $2,
		id FROM friendlists
		WHERE user_id = $1 RETURNING *;`,
		values: [user_id, friend_id],
		name: 'add_friend'
	}).then((res) => res.rows);
};

module.exports = {getUserInfo, getFriendInfo, deleteFriend, addFriend};
