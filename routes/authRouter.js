const express = require("express");
const router = express.Router();
const { registerRouter, loginRouter } = require("../controllers/auth");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const validate = require("../middleware/validate");

router.post("/register", validate(registerSchema), registerRouter);
router.post("/login", validate(loginSchema), loginRouter);

module.exports = router;
