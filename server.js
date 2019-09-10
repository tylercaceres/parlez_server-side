// load .env data into process.env
require("dotenv").config();
require("util").inspect.defaultOptions.depth = null;

// constant setup
const PORT = process.env.PORT || 3003;
const ENV = process.env.ENV || "development";

// server config
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// database connection
const db = require("./db/connection/db.js");
db.connect();

// additional server set up
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(express.json({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
const session = require("express-session");

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  session({
    secret: "lhl parlez",
    resave: true,
    saveUninitialized: true
  })
);

// ***** routes *****
const defaultRoutes = require("./routes/default");
app.use("/auth/", defaultRoutes);

// server initialize
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
server.listen(8080);

const dbQueries = require("./bin/db/helpers/helperQueries");

// global object to store the latest socket of a user
const participantSockets = {};

/**
 * !socket global object
 * participantSockets = {'1' : 'xyz1234___1234',
 * 											'2' : 'abcdefghijklmnopqrstuvwxyz'}
 */

// const

dbQueries.getFriendInfo(253).then(res => console.log("FRIENDS:", res));

// dbQueries.getFriendInfo(1).then((res) => console.log('THE FRIENDLIST FUNCTION:', res));
// ********** FUNCTIONS FOR SOCKETS **********

// ********************** SOCKETS
io.on("connect", socket => {
  // ********** FUNCTIONS FOR SOCKETS **********
  const initialLoad = async user_id => {
    try {
      const activeChatrooms = await dbQueries.getActiveChatrooms(user_id);
      activeChatrooms.forEach(chatroom => socket.join(chatroom.chatroom_id));
      const recentChatroomMessages = await dbQueries.getRecentChatroomMessages(
        user_id
      );
      const friendList = await dbQueries.getFriendInfo(user_id);
      socket.emit("initial message data", recentChatroomMessages);
      socket.emit("friendlist data", friendList);

      // io.to(chatroom.chatroom_id).emit('new chatroom joined', `${socket.id} joined room ${chatroom.id}`);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const createNewChatroom = async (
    type,
    name,
    creatorUserId,
    usersArr,
    avatar = ""
  ) => {
    try {
      const newParticipants = await dbQueries.createChatroom(
        type,
        name,
        creatorUserId,
        usersArr,
        avatar
      );
      const newChatroomId = newParticipants[0].chatroom_id;
      usersArr.forEach(user => {
        console.log(`${user} has joined the room`);
        io.sockets.sockets[participantSockets[user]].join(newChatroomId);
      });
      //bot creates message to the entire chatroom
      //bot emits message to the entire chatroom
      // io.to(newChatroomId).emit("new chatroom message",*insert bot's message here*)
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const createNewMessage = async (user_id, chatroom_id, content) => {
    try {
      const newChatroomMessage = await dbQueries.createChatroomMessage(
        user_id,
        chatroom_id,
        content
      );
      console.log("NEW CHATROOM MESSAGE:", newChatroomMessage);
      io.to(chatroom_id).emit("new chatroom message", newChatroomMessage);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const deleteMessage = async (user_id, message_id, creator_id) => {
    console.log("before try");
    try {
      const deletedChatroomMessage = await dbQueries.deleteChatroomMessage(
        user_id,
        message_id
      );
      await dbQueries.deleteChatroomMessageViews(user_id, message_id);
      const deletedMsg = await dbQueries.getSingleChatroomMessage(message_id);
      socket.emit("delete my message", deletedMsg);
      console.log(deletedMsg);
      if (user_id === creator_id) {
        const updatedDeletedContentMessage = await dbQueries.getSingleChatroomMessage(
          message_id
        );
        socket
          .to(updatedDeletedContentMessage.chatroom)
          .emit("delete owner message", updatedDeletedContentMessage);
      }
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const deleteViewableMessages = async (user_id, chatroom_id) => {
    try {
      const deleted = await dbQueries.deleteViewableMessages(
        user_id,
        chatroom_id
      );
      console.log("the messages that have been deleted from views", deleted);
      socket.emit("delete viewable messages", chatroom_id);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const leaveChatroom = async (user_id, chatroom_id) => {
    try {
      console.log("leave chatroom");
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const addFriend = async (friend_id, user_id) => {
    try {
      const friendlist = await dbQueries.addFriend(user_id, friend_id);
      console.log("SERVER SIDE CHECKING FIRNEDLIST", friendlist);
      socket.emit("friendlist data", friendlist);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const deleteFriend = async friend_id => {
    try {
      const friendlist = await dbQueries.deleteFriend(socket.userid, friend_id);
      socket.emit("friendlist data", friendlist);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  const searchNewFriend = async email => {
    console.log(
      "BEFOPRE TRY checking to see what the email is in the server",
      email
    );

    try {
      console.log("checking to see what the email is in the server", email);
      const friend = await dbQueries.getNewFriendInfo(email);
      if (!friend) {
        throw new Error();
      }
      socket.emit("found friend", friend);
      console.log("CHECKING WHAT FRIEND IS ", friend);
    } catch (error) {
      console.log("Error! :", error);
    }
  };

  socket.on("initialize", data => {
    console.log("user_id from client", data);
    socket.userid = data;
    let currentSocket = participantSockets[socket.userid];
    if (currentSocket && io.sockets.sockets[currentSocket]) {
      console.log(
        "currently logged in socket: ",
        participantSockets[currentSocket]
      );
      //send a message to the client about to be disconnected (pop up saying they got disconnected, etc)
      io.to(currentSocket).emit("to be disconnected");
      //potentially add in a timeout? (delay)
      io.sockets.sockets[currentSocket].disconnect();
    }
    participantSockets[socket.userid] = socket.id;
    console.log("new socket :", participantSockets[socket.userid]);
    console.log(participantSockets);

    initialLoad(socket.userid); //function to send initial data

    socket.on("create new chatroom", newChatroomData => {
      const { type, name, usersArr, avatar } = newChatroomData;
      createNewChatroom(type, name, socket.userid, usersArr, avatar);
    });

    socket.on("send message", newMessage => {
      console.log(newMessage);
      const { userId, chatroomId, content } = newMessage;
      createNewMessage(userId, chatroomId, content);
    });

    socket.on("delete msg", data => {
      console.log(data);
      deleteMessage(socket.userid, data.msg_id, data.creatorId);
    });

    socket.on("delete chatroom button", chatroom_id => {
      console.log("I AM HERE. DELETE CHATROOM BUTTON.", chatroom_id);
      deleteViewableMessages(socket.userid, chatroom_id);
    });

    socket.on("search friend", data => {
      console.log(data);
      searchNewFriend(data.email);
    });

    socket.on("add new friend", friendToAdd => {
      addFriend(friendToAdd.id, socket.userid);
    });
    // 	socket.on('create new message', newMessageData => {});
  });
});
