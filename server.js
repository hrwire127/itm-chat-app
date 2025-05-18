// src/server.js
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const createApp = require("./app");
const connectDB = require("./config/db");
const socketHandler = require("./sockets");

const PORT = process.env.PORT;
const CLIENT_PORT = process.env.PORT_CLIENT;

const app = createApp(CLIENT_PORT);
connectDB(process.env.URI);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: `http://localhost:${CLIENT_PORT}`, methods: ["GET", "POST"] },
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
