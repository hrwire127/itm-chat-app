const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }], // 2 useri
  messages: [messageSchema],
  updatedAt: { type: Date, default: Date.now },
});

conversationSchema.index({ participants: 1 }); // index pentru căutări

const Conversation = model("Conversation", conversationSchema);

module.exports = Conversation;