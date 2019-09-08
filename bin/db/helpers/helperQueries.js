// const db = require('../../../db/connection/db');
const {
	getAllChatroomMessages,
	getSingleChatroomMessage,
	getRecentChatroomMessages,
	getChatroomMessages,
	deleteChatroomMessage,
	createChatroomMessage
} = require('./sub-chatroomMessageQueries');

const {
	createChatroom,
	addChatroomParticipant,
	getActiveChatrooms,
	updateChatroom,
	updateChatroomParticipant,
	deleteChatroomParticipant
} = require('./sub-chatroomQueries');

const {getUserInfo, getFriendInfo, deleteFriend, addFriend} = require('./sub-userQueries');

module.exports = {
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
	addFriend
};
