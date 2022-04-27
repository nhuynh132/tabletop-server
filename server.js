var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

connections = [];

server.listen(process.env.PORT || 3001);
console.log("Server is running...");

io.sockets.on("connection", function (socket) {
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
    console.log(data);
    io.sockets.emit("iOS Client Port", { msg: "Hi iOS Client." });
  });
});
