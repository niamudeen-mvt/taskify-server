const express = require("express");
const { registerUser, loginUser } = require("../controllers/user.controller");
const { validateUser } = require("../utils/validation");

const userRouter = express.Router();

userRouter.route("/register").post(validateUser, registerUser);
userRouter.route("/login").post(validateUser, loginUser);

module.exports = userRouter;
