const express = require("express");
const userRouter = express.Router();
const authControllers = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const {
  validateRegisterSchema,
  validateLoginSchema,
} = require("../middleware/validtion.middleware");

userRouter
  .route("/register")
  .post(validateRegisterSchema, authControllers.register);
userRouter.route("/login").post(validateLoginSchema, authControllers.login);
userRouter.route("/refresh-token").post(authControllers.refreshToken);
userRouter.route("/user").get(verifyToken, authControllers.userDetails);

module.exports = userRouter;
