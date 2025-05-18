const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/authentificate");

router.post("/request", authenticate, async (req, res) => {
  const { fromUserName, toUsername } = req.body;

  const fromUser = await User.findOne({ username: fromUserName });
  const toUser = await User.findOne({ username: toUsername });

  //   console.log(fromUser);
  //   console.log(toUser);

  if (!fromUser || !toUser)
    return res.status(404).json({ msg: "User not found" });

  if (toUser.friendRequests.includes(fromUser._id)) {
    return res.status(400).json({ msg: "Request already sent" });
  }

  toUser.friendRequests.push(fromUser._id);
  fromUser.sentRequests.push(toUser._id);
  await toUser.save();
  await fromUser.save();

  res.status(200).json({ msg: "Request sent" });
});

// POST /api/friends/respond
router.post("/respond", authenticate, async (req, res) => {
  const { id, token, username, action } = req.body; // action: "accept" | "reject"

  //   console.log(req.body);
  const user = await User.findById(id);
  const fromUser = await User.findOne({ username });

  // console.log(user); artiom
  // console.log(fromUser); mihai

  if (!user || !fromUser)
    return res.status(404).json({ msg: "User not found" });

  user.sentRequests = user.sentRequests.filter(
    (id) => !id.equals(fromUser._id)
  );
  fromUser.friendRequests = fromUser.friendRequests.filter(
    (id) => !id.equals(user._id)
  );

  if (action === "accept") {
    user.friends.push(fromUser);
    fromUser.friends.push(user);
  }

  await user.save();
  await fromUser.save();

  res.status(200).json({ msg: `Friend request ${action}ed` });
});

router.get("/requests", authenticate, async (req, res) => {
  const id = req.user.id; // ← îl iei din token

  //   console.log(req.user)
  try {
    const user = await User.findById(id).populate("friendRequests", "username");

    if (!user) return res.status(404).json({ msg: "User not found" });

    const formattedRequests = user.friendRequests.map((sender) => ({
      _id: sender._id,
      senderName: sender.username,
    }));

    res.status(200).json(formattedRequests);
  } catch (err) {
    console.error("Error fetching friend requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
