const {
	getAllChatroomMessages,
	getSingleChatroomMessage,
	getRecentChatroomMessages,
	getChatroomMessages,
	deleteChatroomMessage,
	createChatroomMessage
} = require('./subQueries/chatroomMessageQueries');

const {
	createChatroom,
	addChatroomParticipant,
	getActiveChatrooms,
	updateChatroom,
	updateChatroomParticipant,
	deleteChatroomParticipant,
	deleteViewableMessages
} = require('./subQueries/chatroomQueries');

const {getUserInfo, getFriendInfo, deleteFriend, addFriend} = require('./subQueries/userQueries');

const {getUserByEmailDB, addUserDB} = require('./subQueries/authQueries');

module.exports = {
	getUserByEmailDB,
	addUserDB,
	getAllChatroomMessages,
	getSingleChatroomMessage,
	getRecentChatroomMessages,
	getChatroomMessages,
	deleteChatroomMessage,
	createChatroomMessage,
	createChatroom,
	addChatroomParticipant,
	getActiveChatrooms,
	updateChatroom,
	updateChatroomParticipant,
	deleteChatroomParticipant,
	getUserInfo,
	getFriendInfo,
	deleteFriend,
	addFriend,
	deleteViewableMessages
};
