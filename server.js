require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const flash = require("express-flash");
const session = require("express-session");
const { Server } = require("socket.io");
const cors = require("cors");

const uri = process.env.URI;
var sessionStore = new session.MemoryStore();

const app = express();
const server = http.createServer(app);

const authRoutes = require("./routes/authRouter");

const PORT = process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: `http://localhost:${process.env.PORT_CLIENT}`, // portul frontend-ului
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: `http://localhost:${process.env.PORT_CLIENT}`, // frontend-ul
  credentials: true
}));

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // scade timpul de așteptare
  })
  .then(() => console.log("✅ Conectat la MongoDB"))
  .catch((err) => console.log("❌ Eroare la conectare:", err));

let activeUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  activeUsers[socket.id] = true;

  // Trimite lista de useri la toți
  io.emit("activeUsers", Object.keys(activeUsers));

  socket.on("message", (message) => {
    io.emit("message", `${socket.id}: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete activeUsers[socket.id];
    io.emit("activeUsers", Object.keys(activeUsers)); // Trimite lista actualizată
  });
});

app.use(express.json()); // important pentru body parsing
// app.use('/api', authRoutes); // deci ai endpoint-ul POST /api/register


app.use(express.json());
app.use("/api", authRoutes);


server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
