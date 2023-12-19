const mongoose = require("mongoose");
const TOKEN_DETAILS = require("../config");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.generateAccessToken = function () {
  // 'this' refers to the current user document
  const payload = {
    userId: this._id.toString(),
    // Add any other data you want in the token payload
  };

  // Generate JWT token using the payload
  const token = jwt.sign(payload, TOKEN_DETAILS.JWT_SECRET_KEY, {
    expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
  });
  console.log(token, ";;;;;;;;;;;;;;");
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
