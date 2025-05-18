// src/sockets/index.js
let activeUsers = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    const {
      username = "none",
      token = "none",
      role = "none",
    } = socket.handshake.auth;
    activeUsers[socket.id] = { username, token, role };

    console.log("User connected:", username);
    io.emit("activeUsers", Object.values(activeUsers));

    socket.on("message", (msg) => io.emit("message", `${username}: ${msg}`));
    socket.on("disconnect", () => {
      delete activeUsers[socket.id];
      io.emit("activeUsers", Object.values(activeUsers));
      console.log("User disconnected:", username);
    });
  });
};
