var express = require("express");
const { CLIENT_RENEG_LIMIT } = require("tls");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var PORT = 3001;

// List of socket connections
connections = [];
// Map of socket.id's to usernames
socketIDByUsername = new Map();

server.listen(PORT);
console.log("Server is running on..." + PORT);

io.sockets.on("connection", function (socket) {
  connections.push(socket);
  console.log("Connect: %s sockets are connected", connections.length);

  socket.on("disconnect", function (data) {
    let username = socketIDByUsername.get(socket.id);
    console.log(`Player ${username} is disconnecting...`);

    socket.broadcast.emit("disconnect", username)
    
    socketIDByUsername.delete(socket.id);
    connections.splice(connections.indexOf(socket), 1);

    console.log("Disconnect: %s sockets are connected", connections.length);
    console.log("List of current players: ");
    for (const [key, value] of socketIDByUsername) {
      console.log("> ", value);
    }
    console.log("End of list...");

    // Get array of usernames, pack into JSON, and emit to all connected clients
    let socketIDByUsernameArr = Array.from(socketIDByUsername.values());
    var data = JSON.stringify(socketIDByUsernameArr);
    io.emit("playerList-req", data);
  });

  socket.on("New player joined", function (data) {
    let incomingUserName = data.split(":");
    socketIDByUsername.set(socket.id, incomingUserName[1]);
    socket.broadcast.emit("New player joined", incomingUserName[1])

    console.log("New Player: %s sockets are connected", connections.length);
    console.log("List of current players: ");
    for (const [key, value] of socketIDByUsername) {
      console.log("> ", value);
    }
    console.log("End of list...");

    // Get array of usernames, pack into JSON, and emit to all connected clients

    let socketIDByUsernameArr = Array.from(socketIDByUsername.values());
    var data = JSON.stringify(socketIDByUsernameArr);
    io.emit("playerList-req", data);
  });

  socket.on("model-tapped", function (data) {
    socket.broadcast.emit("model-tapped", data);
  });

  socket.on("model-selected", function(data) {
    console.log(
      `DEBUG:: Client ${socketIDByUsername.get(
        socket.id
      )} selected! \n${JSON.stringify(data, null, 2)}`
    );
    socket.broadcast.emit("model-selected", data);
  });

  socket.on("model-placed", function (data) {
    console.log(
      `DEBUG:: Client ${socketIDByUsername.get(
        socket.id
      )} wants to place! \n${JSON.stringify(data, null, 2)}`
    );

    socket.broadcast.emit("model-placed", data);
  });

  socket.on("model-transformed", function (data) {
    console.log(
      `DEBUG:: Client ${socketIDByUsername.get(
        socket.id
      )} wants to move! \n${JSON.stringify(data, null, 2)}`
    );
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
    for (const [key, value] of socketIDByUsername) {
      console.log(">>> ", value);
    }

    let socketIDByUsernameArr = Array.from(socketIDByUsername.values());
    var data = JSON.stringify(socketIDByUsernameArr);

    console.log("THIS MY DATYA BRO: ", data);

    io.emit("playerList-req", data);
  });
});
