const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema, model, models } = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sentRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Hash the password before saving it to the database
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre("save", function (next) {
  // Asigură-te că toate listele sunt unice
  this.friends = [...new Set(this.friends.map((id) => id.toString()))];
  this.friendRequests = [
    ...new Set(this.friendRequests.map((id) => id.toString())),
  ];
  this.sentRequests = [
    ...new Set(this.sentRequests.map((id) => id.toString())),
  ];

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
