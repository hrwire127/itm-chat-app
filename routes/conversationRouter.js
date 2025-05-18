const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authentificate");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// Creează / găsește conversația dintre 2 useri (dacă sunt prieteni)
router.post("/conversation", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { friendUsername } = req.body;
  const { conversationId } = req.body;

  console.log(req.body);

  const user = await User.findById(userId);
  try {
    if (friendUsername) {
      // Verifică dacă sunt prieteni
      const friend = await User.findOne({ username: friendUsername });

      if (!user.friends.includes(friend._id)) {
        return res.status(403).json({ msg: "Not friends" });
      }

      // Caută conversația cu acești 2 participanți (indiferent de ordine)
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, friend._id] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, friend._id],
          messages: [],
        });
        await conversation.save();
      }

      console.log("YESS");

      res.status(200).json({ conversation, friend });

      //   res.status(200).json(conversation);
    } else if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation.participants.includes(userId)) {
        return res.status(403).json({ msg: "Not friends" });
      }

      //   if (!conversation) {
      //     conversation = new Conversation({
      //       participants: [userId, friend._id],
      //       messages: [],
      //     });
      //     await conversation.save();
      //   }
      const friendParticipant = conversation.participants.find(
        (c) => c._id.toString() !== userId.toString()
      );
      const friend = await User.findById(friendParticipant._id);

      console.log("YESS2");

      res.status(200).json({ conversation, friend });
      //   res.status(200).json(conversation);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/message", authenticate, async (req, res) => {
  console.log("!!");
  const userId = req.user.id;
  const { conversationId, text } = req.body;

  if (!text || !conversationId)
    return res.status(400).json({ msg: "Missing text or conversationId" });

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ msg: "Conversation not found" });

    // Verifică dacă userul e participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ msg: "Not a participant" });
    }

    conversation.messages.push({
      sender: userId,
      text,
      createdAt: new Date(),
    });

    conversation.updatedAt = new Date();

    await conversation.save();

    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/conversations", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "username")
      .lean();

    // Formatează răspunsul pentru frontend: listă cu prieten + ultimul mesaj
    const formatted = conversations.map((conv) => {
      // Celălalt user este cel care nu e userId
      const friend = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      const lastMessage = conv.messages.length
        ? conv.messages[conv.messages.length - 1]
        : null;

      return {
        conversationId: conv._id,
        friendUsername: friend.username,
        lastMessage: lastMessage ? lastMessage.text : "",
        lastMessageAt: lastMessage ? lastMessage.createdAt : null,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
