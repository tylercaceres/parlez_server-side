// load .env data into process.env
require('dotenv').config();
require('util').inspect.defaultOptions.depth = null;

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
// app.use(express.static(__dirname + '/public'));
const session = require('express-session');

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

// ********************** SOCKETS
io.on('connect', (socket) => {
	let currentSocket = participantSockets[socket.userid];
	if (currentSocket && io.sockets.sockets[currentSocket]) {
		console.log('currently logged in socket: ', participantSockets[socket.userid]);
		io.sockets.sockets[currentSocket].disconnect();
	}
	participantSockets[socket.userid] = socket.id;
	console.log('new socket :', participantSockets[socket.userid]);
	console.log(participantSockets);
	// // send most recent data to socket ********************
	// const initialLoad = async (user_id) => {
	// 	try {
	// 		const recentChatroomMessages = await getRecentChatroomMessages(user_id);
	// 		console.log(recentChatroomMessages);
	// 		socket.emit('initial data', recentChatroomMessages);
	// 		const activeChatrooms = await getActiveChatrooms(user_id);
	// 		// console.log(activeChatrooms);
	// 		activeChatrooms.forEach((chatroom) => {
	// 			socket.join(chatroom.chatroom_id);
	// 			io.to(chatroom.chatroom_id).emit('new chatroom joined', `${socket.id} joined room ${chatroom.id}`);
	// 		});
	// 	} catch (error) {
	// 		console.log('Error! :', error);
	// 	}
	// };
	// initialLoad(4);
	// // create chatroom request ********************
	// const createNewChatroom = async (type, name, creatorUserId, usersArr, avatar = '') => {
	// 	try {
	// 		const newParticipants = await createChatroom(type, name, creatorUserId, usersArr, avatar);
	// 		//loop through socket IDs, make them join the room **********
	// 		/**
	// 		 * TODO: make functionality work
	// 		 */
	// 		usersArr.forEach((user) => {
	// 			console.log(`${user} has joined the room`);
	// 		});
	// 		// newParticipants.forEach((chatroom) => {
	// 		// 	socket.join(chatroom);
	// 		// });
	// 	} catch (error) {
	// 		console.log('Error! :', error);
	// 	}
	// };
	// socket.on('create new room', (data) => {
	// 	console.log('NEW ROOM DATA:', data);
	// 	const {type, name, creatorUserId, usersArr, avatar} = data;
	// 	createNewChatroom(type, name, creatorUserId, usersArr, avatar);
	// });
	// .then((res) => socket.emit('initial data provided', res))
	// .then(
	// .catch((res) => sockt.emit('initial data provided', 'error'));
	// getRecentChatroomMessages(4)
	// 	.then((res) => socket.emit('initial data provided', res))
	// 	.then(
	// 	.catch((res) => sockt.emit('initial data provided', 'error'));
	// console.log(Object.keys(socket.request.headers));
	// console.log(socket.request.headers);
	// createChatroom('single', 'test chatroom single 1', 2, [1, 2, 3, 4, 5])
	// 	.then((res) => socket.emit('here is the msg', res))
	// 	.catch((err) => console.log('error msg:', err));
	// if (socket.handshake.session.email) {
	// 	socketIdToEmail[socket.id] = socket.handshake.session.email;
	// }
	// socket.on('join room', () => {
	// 	getMessages(1, 1).then((data) =>
	// 		socket.emit('sending new single message', data)
	// 	);
	// });
	// socket.on('poop', ({user, chatroom, content}) => {
	// 	appendMessage(user, chatroom, content).then((data) =>
	// 		socket.emit('poop2', data)
	// 	);
	// });
});
