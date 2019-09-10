const {
	getAllChatroomMessages,
	getSingleChatroomMessage,
	getRecentChatroomMessages,
	getChatroomMessages,
	deleteChatroomMessage,
	deleteChatroomMessageViews,
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

const {getUserInfo, getFriendInfo, deleteFriend, addFriend, getNewFriendInfo} = require('./subQueries/userQueries');

const {getUserByEmailDB, getUserByUserIdDB, addUserDB, createFriendlistDB} = require('./subQueries/authQueries');

module.exports = {
	getUserByEmailDB,
	getUserByUserIdDB,
	createFriendlistDB,
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
	deleteViewableMessages,
	deleteChatroomMessageViews,
	getNewFriendInfo
};
