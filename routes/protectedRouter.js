const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authentificate");

router.get("/me", authenticate, (req, res) => {
  res.json({
    message: "User is authenticated",
    user: req.user,
  });
});

module.exports = router;
