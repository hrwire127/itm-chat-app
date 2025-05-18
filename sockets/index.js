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

    // Trimite lista actualizată tuturor
    io.emit("activeUsers", Object.values(activeUsers));

    // Ascultă mesaje primite de la client
    socket.on("message", (message) => {
      // message ar trebui să fie ceva de forma { sender: 'username', text: 'mesaj' }

      console.log("Message received:", message);

      // Trimite mesajul către toți ceilalți clienți (fără emit către cel care a trimis)
      socket.broadcast.emit("message", message);
    });

    socket.on("disconnect", () => {
      delete activeUsers[socket.id];
      io.emit("activeUsers", Object.values(activeUsers));
      console.log("User disconnected:", username);
    });
  });
};
