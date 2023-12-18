const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    // hashing password
    let hashPassword = await bcrypt.hash(password, 10);

    let existUser = await User.findOne({ email });
    if (existUser) {
      res.status(200).send({
        success: true,
        message: "User already registered",
      });
    } else {
      // creating user
      let user = await User.create({
        name,
        email,
        phone,
        password: hashPassword,
      });

      if (!user) {
        res.status(404).send({
          success: true,
          message: "Something is wrong",
          user,
        });
      } else {
        res.status(201).send({
          success: true,
          message: "User registered successfully",
          user,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: "false",
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      let isPasswordMatch = await bcrypt.compare(password, user.password);
      if (email === user.email && isPasswordMatch) {
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          process.env.SECRET_KEY,
          {
            expiresIn: "30d",
          }
        );

        if (token) {
          res.status(200).send({
            success: true,
            message: "User Login succesfully",
            token,
          });
        }
      } else {
        res.status(200).send({
          success: true,
          message: "Check your credentials please",
        });
      }
    } else {
      res.status(404).send({
        success: true,
        message: "User doesnt exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: "false",
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
