const path = require("path");
const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");

const publicPath = path.join(__dirname, "../public");
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

io.on("connection", socket => {
  socket.on("join", (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback("Name and room name are required.");
    }

    params.room = params.room.toLowerCase();
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit("updateUserList", users.getUserList(params.room));
    socket.emit("newMessage", generateMessage("Ivan", "Thanks for checking out this demo app. To see Socket.io in action, open up a new tab and navigate to this room. Using different name may help."));

    socket.broadcast
      .to(params.room)
      .emit(
        "newMessage",
        generateMessage("Admin", `${params.name} has joined the chat.`)
      );
    callback();
  });

  socket.on("createMessage", (message, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io
        .to(user.room)
        .emit("newMessage", generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on("createLocationMessage", coords => {
    var user = users.getUser(socket.id);
    if (user) {
      io
        .to(user.room)
        .emit(
          "newLocationMessage",
          generateLocationMessage(user.name, coords.latitude, coords.longitude)
        );
    }
  });
  socket.on("disconnect", () => {
    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("updateUserList", users.getUserList(user.room));
      io
        .to(user.room)
        .emit("newMessage", generateMessage("Ivan", `${user.name} has left`));
    }
  });
});

app.use(express.static(publicPath));

var PORT = process.env.PORT || 3000;
server.listen(PORT);
