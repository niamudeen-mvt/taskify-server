const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const TOKEN_DETAILS = require("../config/index");

const register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    } else {
      const { name, email, phone, password, isAdmin } = req.body;
      const userExist = await User.findOne({ email });

      const users = await User.find();

      const phoneNumberExist = users.some((user) => user.phone == phone);
      if (phoneNumberExist) {
        return res.status(400).send({ message: "Phone number already exists" });
      } else if (userExist) {
        return res.status(400).send({ message: "Email already exists" });
      } else {
        const userCreated = await User.create({
          name,
          email,
          phone,
          password,
          isAdmin,
        });

        res.status(201).send({
          success: true,
          data: userCreated,
          message: "user registred successfully",
        });
      }
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    } else {
      const { email, password } = req.body;
      const userExist = await User.findOne({ email });

      if (!userExist) {
        return res.status(400).send({
          message: "Invalid Credentials",
        });
      } else {
        const isPasswordMatch = await bcrypt.compare(
          password,
          userExist.password
        );

        if (isPasswordMatch) {
          res.status(200).send({
            success: true,
            access_token: await userExist.generateAccessToken(),
            message: "user login successfully",
            userId: userExist._id.toString(),
          });
        } else {
          return res.status(401).send({
            message: "Invalid email or passoword",
          });
        }
      }
    }
  } catch (error) {
    res.status(500).send({ msg: error });
  }
};

const userDetails = async (req, res) => {
  try {
    const userExist = await User.findById({ _id: req.user.userId });
    if (!userExist) {
      return res.status(400).send({
        message: "User not found",
      });
    } else {
      res.status(200).send({
        success: true,
        user: userExist,
        message: "user found successfully",
      });
    }
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

const refreshToken = async (req, res) => {
  const { userId } = req.params;

  const token = req?.headers?.authorization?.split(" ")[1];
  console.log("token: ", token);

  if (!token) {
    return res.status(200).send({
      success: false,
      message: "A token is required for authorization",
    });
  }
  // jwt.verify(token, secret key)

  jwt.verify(token, TOKEN_DETAILS.JWT_SECRET_KEY, function (error, result) {
    if (error && error.name == "TokenExpiredError") {
      const access_token = jwt.sign(
        {
          userId: userId,
        },
        TOKEN_DETAILS.JWT_SECRET_KEY,
        {
          expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
        }
      );

      return res.status(200).send({
        access_token,
        code: "SUCCESS",
      });
    }

    return res.status(200).send({
      access_token: token,
      code: "INVALID_TOKEN",
    });
  });
};

module.exports = {
  login,
  register,
  userDetails,
  refreshToken,
};
