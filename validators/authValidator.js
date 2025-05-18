const Joi = require("joi");

const allowedDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "protonmail.com",
  "tuiasi.ro",
  "student.tuiasi.ro",
];

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(usernameRegex)
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.pattern.base":
        "Username-ul poate conține doar litere, cifre, _ și -, între 3 și 30 caractere.",
    }),
  email: Joi.string()
    .pattern(emailRegex)
    .email({ tlds: { allow: false } }) // validare strictă RFC pentru email
    .required()
    .custom((value, helpers) => {
      const domain = value.split("@")[1];
      if (!allowedDomains.includes(domain)) {
        return helpers.message(
          `Email domain must be one of: ${allowedDomains.join(", ")}`
        );
      }
      return value;
    }),
  password: Joi.string()
    .pattern(passwordRegex)
    .min(8)
    .max(30)
    .required()
    .messages({
      "string.pattern.base":
        "(Parole trebuie sa contina min un caracter mare, un caracter mic, cel puțin o cifră, cel puțin un caracter special și să aibă lungimea de minim 8 caractere",
    }),
  role: Joi.string().valid("user", "admin").optional(), // dacă ai roluri
  acceptTerms: Joi.boolean().valid(true).required(),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
