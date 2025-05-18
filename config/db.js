const uri = process.env.URI;

const mongoose = require("mongoose");
module.exports = (uri) =>
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log("✅ Conectat la MongoDB"))
    .catch((err) => console.log("❌ Eroare la conectare:", err));
