var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = 3001;

connections = [];

server.listen(PORT);
console.log("Server is running on..." + PORT);

io.sockets.on("connection", function (socket) {
  console.log("DEBUG:: Connection established! serverTest!");

  connections.push(socket);
  console.log("Connect: %s sockets are connected", connections.length);

  // Disconnect
  socket.on("disconnect", function (data) {
    connections.splice(connections.indexOf(socket), 1);
    console.log(
      "Device disconneced. Current connections: %s sockets are connected",
      connections.length
    );
  });

  //test data emission
  socket.on("NodeJS Server Port", function (data) {
    console.log("DEBUG:: received node js server port");
    connections.forEach((connectedDevice) => {
      console.log(
        `DEBUG:: <><> ${data} is connected with a socket id of ${connectedDevice.id}!\n`
      );
    });
    console.log(data);
    io.sockets.emit("iOS Client Port", { msg: "Hi iOS Client." });
  });

  //on model place function
  socket.on("model-placed", function (data) {
    console.log(`DEBUG:: Client ${connectedDevice.id} wants to place!`);
    socket.broadcast.emit("model-placed", data);
  });

  // TODO: model-transformed
  socket.on("model-transformed", function (data) {
    console.log(`DEBUG:: Client ${connectedDevice.id} wants to move!`);
    socket.broadcast.emit("model-transformed", data);
  });

  // Delay test
  socket.on("time-check", function (data) {
    var today = new Date();
    let ms = today.getUTCMilliseconds();

    console.log(
      `DEBUG:: Device sent at: ${data} || Server received at: ${Date.now()} (diff: ${
        data - Date.now()
      }).`
    );
  });
});
