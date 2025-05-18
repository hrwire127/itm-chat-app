const express = require("express");
const router = express.Router();
const { registerRouter, loginRouter } = require("../controllers/auth");

router.post("/register", registerRouter);
router.post("/login", loginRouter);

module.exports = router;
