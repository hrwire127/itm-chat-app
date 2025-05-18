const express = require("express");
const router = express.Router();
const { registerRouter, loginRouter } = require("../controllers/auth");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const validate = require("../middleware/validate");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 3, // maxim 3 cereri per IP în acest interval
  message: {
    error:
      "Prea multe încercări de autentificare. Încearcă din nou după 15 minute.",
  },
  standardHeaders: true, // Trimite header-ele rate limit în răspuns
  legacyHeaders: false,
});
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 3, // maxim 3 cereri per IP în acest interval
  message: {
    error:
      "Prea multe încercări de autentificare. Încearcă din nou după 15 minute.",
  },
  standardHeaders: true, // Trimite header-ele rate limit în răspuns
  legacyHeaders: false,
});

router.post("/register", registerLimiter, validate(registerSchema), registerRouter);
router.post("/login", loginLimiter, validate(loginSchema), loginRouter);

module.exports = router;
