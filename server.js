// load .env data into process.env
require('dotenv').config();
require('util').inspect.defaultOptions.depth = null;
// const cors = require('cors');

// constant setup
const PORT = process.env.PORT || 3003;
const ENV = process.env.ENV || 'development';

// server config
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// database connection
const db = require('./db/connection/db.js');
db.connect();

// additional server set up
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(express.json({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const session = require('express-session');

// additional set up
// app.use(
// 	cors({
// 		origin: 'http://localhost:3000'
// 	})
// );
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // update to match the domain you will make the request from
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Credentials', true);
	next();
});

app.use(
	session({
		secret: 'lhl parlez',
		resave: true,
		saveUninitialized: true
	})
);

// ***** routes *****
const defaultRoutes = require('./routes/default');
app.use('/auth/', defaultRoutes);

// server initialize
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
server.listen(8080);

const dbQueries = require('./bin/db/helpers/helperQueries');

// global object to store the latest socket of a user
const participantSockets = {};

/**
 * !socket global object
 * participantSockets = {'1' : 'xyz1234___1234',
 * 											'2' : 'abcdefghijklmnopqrstuvwxyz'}
 */

// ********** FUNCTIONS FOR SOCKETS **********
const initialLoad = async (user_id) => {
	try {
		const activeChatrooms = await dbQueries.getActiveChatrooms(user_id);
		activeChatrooms.forEach((chatroom) => socket.join(chatroom.chatroom_id));
		const recentChatroomMessages = await dbQueries.getRecentChatroomMessages(user_id);
		const friendList = await dbQueries.getFriendInfo(user_id);
		socket.emit('initial data', recentChatroomMessages, friendList);
		// io.to(chatroom.chatroom_id).emit('new chatroom joined', `${socket.id} joined room ${chatroom.id}`);
	} catch (error) {
		console.log('Error! :', error);
	}
};

const createNewChatroom = async (type, name, creatorUserId, usersArr, avatar = '') => {
	try {
		const newParticipants = await dbQueries.createChatroom(type, name, creatorUserId, usersArr, avatar);
		const newChatroomId = newParticipants[0].chatroom_id;
		usersArr.forEach((user) => {
			console.log(`${user} has joined the room`);
			io.sockets.sockets[participantSockets[user]].join(newChatroomId);
		});
	} catch (error) {
		console.log('Error! :', error);
	}
};

const createNewMessage = async (user_id, chatroom_id, content) => {
	try {
		const newChatroomMessageId = await dbQueries.createChatroomMessage(user_id, chatroom_id, content);
	} catch (error) {}
};

// dbQueries.getFriendInfo(1).then((res) => console.log('THE FRIENDLIST FUNCTION:', res));
// ********** FUNCTIONS FOR SOCKETS **********

// ********************** SOCKETS
io.on('connect', (socket) => {
	socket.on('initialize', (data) => {
		socket.userid = data.userid;
		let currentSocket = participantSockets[socket.userid];
		if (currentSocket && io.sockets.sockets[currentSocket]) {
			console.log('currently logged in socket: ', participantSockets[currentSocket]);
			//send a message to the client about to be disconnected (pop up saying they got disconnected, etc)
			io.to(currentSocket).emit('to be disconnected');
			//potentially add in a timeout? (delay)
			io.sockets.sockets[currentSocket].disconnect();
		}
		participantSockets[socket.userid] = socket.id;
		console.log('new socket :', participantSockets[socket.userid]);
		console.log(participantSockets);

		initialLoad(socket.userid); //function to send initial data

		socket.on('create new chatroom', (newChatroomData) => {
			const {type, name, usersArr, avatar} = newChatroomData;
			createNewChatroom(type, name, socket.userid, usersArr, avatar);
		});

		socket.on('create new message', (newMessageData) => {});
	});

	// socket.on("", =>{

	// })
	// socket.on("", =>{

	// })
	// socket.on("", =>{

	// })
	// socket.on("", =>{

	// })
});
