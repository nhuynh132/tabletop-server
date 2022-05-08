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

    console.log("Here is the list of remaining players:")
    for (var username in currPlayerList) {
      console.log(username);
    }
  });

  //test data emission
  socket.on("New player joined", function (data) {
    console.log("DEBUG:: received node js server port");
    // connections.forEach((connectedDevice) => {
    //   console.log(
    //     `DEBUG:: <><> ${data} is connected with a socket id of ${connectedDevice.id}!\n`
    //   );
    // });
    currPlayerList.set(socket.id, data);
  });

  //on model tapped function
  // TODO: model-tapped
  socket.on("model-tapped", function (data) {
    // console.log(
    //   `DEBUG:: Client ${
    //     connections[connections.length - 1].id
    //   } wants to tap a model! \n${data} \n${JSON.stringify(data, null, 2)}`
    // );
    socket.broadcast.emit("model-tapped", data);
  });

  //on model place function
  // TODO: model-placed
  socket.on("model-placed", function (data) {
    // console.log(
    //   `DEBUG:: Client ${
    //     connections[connections.length - 1].id
    //   } wants to place! \n${JSON.stringify(data, null, 2)}`
    // );

    socket.broadcast.emit("model-placed", data);
  });

  // TODO: model-transformed
  socket.on("model-transformed", function (data) {
    // console.log(
    //   `DEBUG:: Client ${
    //     connections[connections.length - 1].id
    //   } wants to move! \n${data} \n${JSON.stringify(data, null, 2)}`
    // );
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
