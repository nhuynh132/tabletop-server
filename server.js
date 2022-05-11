var express = require("express");
const { CLIENT_RENEG_LIMIT } = require("tls");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = 3001;

connections = [];
currPlayerList = new Map();

server.listen(PORT);
console.log("Server is running on..." + PORT);

io.sockets.on("connection", function (socket) {
  console.log("DEBUG:: Connection established! serverTest!");

  connections.push(socket);
  console.log("Connect: %s sockets are connected", connections.length);

  // Disconnect
  socket.on("disconnect", function (data) {
    console.log(`Player ${currPlayerList.get(socket.id)} is disconnecting...`);
    currPlayerList.delete(socket.id);
    connections.splice(connections.indexOf(socket), 1);
    console.log(
      "[!!!!!]Device disconnected. Current connections: %s sockets are connected",
      connections.length
    );

    // DEBUG
    console.log("AFTER DC: Here is the list of current players:");
    for (const [key, value] of currPlayerList) {
      console.log(value);
    }
    console.log("END \n\n");

    //update client's player list
    socket.emit("playerbase-updated", Array.from(currPlayerList.values()));
  });

  // On new Connect
  socket.on("New player joined", function (data) {
    console.log("DEBUG:: received node js server port");
    let incomingUserName = data.split(":");

    currPlayerList.set(socket.id, incomingUserName[1]);

    // DEBUG
    console.log("AFTER C: Here is the list of current players:");
    for (const [key, value] of currPlayerList) {
      console.log(value);
    }
    console.log("END \n\n");
  });

  //on model tapped function
  // TODO: model-tapped
  socket.on("model-tapped", function (data) {
    socket.broadcast.emit("model-tapped", data);
  });

  //on model place function
  // TODO: model-placed
  socket.on("model-placed", function (data) {
    console.log(
      `DEBUG:: Client ${currPlayerList.get(
        socket.id
      )} wants to place! \n${JSON.stringify(data, null, 2)}`
    );

    socket.broadcast.emit("model-placed", data);
  });

  // TODO: model-transformed
  socket.on("model-transformed", function (data) {
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

  // TODO: update players
  socket.on("playerList-req", function (data) {
    //DEBUG
    console.log("player request::RECEIVED PLAYERUPDATE");
    for (const [key, value] of currPlayerList) {
      console.log(value);
    }

    io.emit("playerList-req", Array.from(currPlayerList.values()));
  });
});
