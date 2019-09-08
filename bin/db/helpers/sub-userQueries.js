const db = require('../../../db/connection/db');

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
			text: `SELECT *
			FROM friendlists fl join friends f on fl.id = f.friendlist_id
			join users u on u.id = f.friend_id
			where fl.user_id = $1 and f.invitation_accepted_at IS NOT NULL
			;`,
			values: [user_id],
			name: 'get_friend_list'
		})
		.then((res) => res.rows);
};
