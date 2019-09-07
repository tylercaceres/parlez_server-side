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
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// additional set up
const session = require('express-session')({
	secret: 'lhl parlez',
	resave: true,
	saveUninitialized: true
});
app.use(session);
const sharedsession = require('express-socket.io-session');
io.use(
	sharedsession(session, {
		autoSave: true
	})
);

// DB functions
const {
	createChatroom,
	getAllChatroomMessages,
	getRecentChatroomMessages,
	getActiveChatrooms
} = require('./bin/db/helpers/helperQueries');

// server initialize
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
server.listen(8080);

app.use((req, res, next) => {
	res.locals.user = req.session.user_id;
	next();
});

// getAllChatroomMessages(4).then((res) => console.log(res));
// getRecentChatroomMessages(4)
// 	.then((res) => console.log(res))
// 	.catch((err) => console.log(err));

// createChatroom('single', 'test chatroom single 1', 2, [1, 2, 3, 4, 5])
// 	.then((res) => console.log('output data:', res))
// 	.catch((err) => console.log('error msg:', err));

app.get('/', (req, res) => {
	res.render('index');
});

// ********************** SOCKETS
io.on('connect', (socket) => {
	//send most recent data to socket ********************
	const initialLoad = async (user_id) => {
		try {
			const recentChatroomMessages = await getRecentChatroomMessages(user_id);
			console.log(recentChatroomMessages);
			socket.emit('initial data', recentChatroomMessages);
			const activeChatrooms = await getActiveChatrooms(user_id);
			// console.log(activeChatrooms);
			activeChatrooms.forEach((chatroom) => {
				socket.join(chatroom.chatroom_id);
				io.to(chatroom.chatroom_id).emit('joined room', chatroom.id);
			});
		} catch (error) {
			console.log('Error! :', error);
		}
	};
	initialLoad(1);

	//create chatroom request ********************
	// const createNewChatroom = async (type, name, creatorUserId, usersArr, avatar) => {
	// 	try {
	// 		const newParticipants = await createChatroom('single', 'testEmitNewChatroom', 1, [1, 2, 3, 4, 5]);
	// 		// const newParticipants = await createChatroom(type, name, creatorUserId, usersArr, avatar);
	// 		socket.emit('initial data', newParticipants);
	// 		newParticipants.forEach((chatroom) => {
	// 			socket.join(chatroom);
	// 		});
	// 	} catch (error) {
	// 		console.log('Error! :', error);
	// 	}
	// };
	// createNewChatroom('single', 'testChatRoom', 7, [7, 2, 3, 4, 5]);

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
