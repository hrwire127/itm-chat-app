const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/authentificate");

router.post("/request", authenticate, async (req, res) => {
  const { fromUserName, toUsername } = req.body;

  const fromUser = await User.findOne({ username: fromUserName });
  const toUser = await User.findOne({ username: toUsername });

  // Dacă sunt deja prieteni
  if (fromUser.friends.includes(toUser._id)) {
    return res.status(400).json({ msg: "Already friends" });
  }

  // Dacă există deja o cerere trimisă de la fromUser către toUser
  if (toUser.friendRequests.includes(fromUser._id)) {
    return res.status(400).json({ msg: "Friend request already sent" });
  }

  // Dacă există deja o cerere în sens invers (toUser i-a trimis deja lui fromUser)
  if (fromUser.friendRequests.includes(toUser._id)) {
    return res
      .status(400)
      .json({ msg: "You already have a request from this user" });
  }

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

router.get("/list", authenticate, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("friends", "username");

    if (!user) return res.status(404).json({ msg: "User not found" });

    const formattedFriends = user.friends.map((friend) => ({
      _id: friend._id,
      username: friend.username,
    }));

    res.status(200).json(formattedFriends);
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/remove", authenticate, async (req, res) => {
  const userId = req.user.id;
  const { friendUsername } = req.body;

  if (!friendUsername) {
    return res.status(400).json({ msg: "Missing friendUsername" });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ msg: "User or friend not found" });
    }

    // Elimină friend din lista userului
    user.friends = user.friends.filter((id) => !id.equals(friend._id));

    // Elimină user din lista prietenilor friendului
    friend.friends = friend.friends.filter((id) => !id.equals(user._id));

    await user.save();
    await friend.save();

    res.status(200).json({ msg: "Friend removed" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
