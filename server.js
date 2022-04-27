var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = 3001;

connections = [];

server.listen(PORT);
console.log("Server is running on..." + PORT);

io.sockets.on("connection", function (socket) {
  console.log("DEBUG:: connection!!!");

  connections.push(socket);
  console.log("Connect: %s sockets are connected", connections.length);

  // TODO: model-place
  socket.on("model-placed", function (data) {
    io.emit("model-placed", data);
    console.log("Model has been placed: \n", data);
  });

  // TODO: model-transformed
  socket.on("model-transformed", function (data) {
    io.emit("model-transformed", data);
    console.log("Model has transformed: \n", data);
  });

  // Disconnect
  socket.on("disconnect", function (data) {
    connections.splice(connections.indexOf(socket), 1);
    console.log("Connect: %s sockets are connected", connections.length);
  });

  socket.on("NodeJS Server Port", function (data) {
    console.log("DEBUG:: received node js server port");
    console.log(data);
    io.sockets.emit("iOS Client Port", { msg: "Hi iOS Client." });
  });
});
