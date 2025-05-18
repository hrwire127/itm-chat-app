// src/app.js
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const flash = require("express-flash");

module.exports = (clientPort) => {
  const app = express();

  app.use(
    cors({ origin: `http://localhost:${clientPort}`, credentials: true })
  );
  app.use(express.json());
  app.use(
    session({
      store: new session.MemoryStore(),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(flash());

  // mount routes
  app.use("/api", require("./routes/protectedRouter"));
  app.use("/api", require("./routes/authRouter"));

  return app;
};
