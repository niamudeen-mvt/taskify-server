const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const TOKEN_DETAILS = require("../config/index");

const fs = require("fs");
const path = require("path");
const Image = require("../models/image.model");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const maxSize = 200 * 1024;
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only .avif .jpeg, .jpg & .png images are allowed"));
    }
  },
  limits: { fileSize: maxSize },
}).array("image", 5);

// *=================================================
//* user registration logic
// *================================================

const register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    } else {
      const { name, email, phone, password, isAdmin } = req.body;

      const userExist = await User.findOne({ email });

      if (userExist) {
        return res.status(400).send({ message: "email already exists" });
      }

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
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ msg: error });
  }
};

// *=================================================
//* user login logic
// *================================================

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
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        userExist.password
      );

      const payload = {
        userId: userExist._id.toString(),
      };

      // json web token
      // const token = jwt.sign(payload, TOKEN_DETAILS.JWT_SECRET_KEY, {
      //   expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
      // });

      // refresh token

      const refresh_token = jwt.sign(
        payload,
        TOKEN_DETAILS.REFRESH_SECRET_KEY,
        {
          expiresIn: TOKEN_DETAILS.REFRESH_TOKEN_EXPIRATION_TIME,
        }
      );

      // setting jwt token in cookie

      // if (res.cookie[userExist._id.toString()]) {
      //   res.cookie[userExist._id.toString()] = "";
      // }
      // res.cookie(userExist._id.toString(), token, {
      //   path: "/",
      //   expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      //   httpOnly: true,
      //   sameSite: "lax",
      // });

      if (isPasswordMatch) {
        res.status(200).send({
          success: true,
          access_token: await userExist.generateAccessToken(),
          refresh_token: refresh_token,
          message: "user login successfully",
          userId: userExist._id.toString(),
        });
      } else {
        return res.status(401).send({
          message: "Invalid email or passoword",
        });
      }
    }
  } catch (error) {
    res.status(500).send({ msg: error });
  }
};

// *=================================================
//* USER BY ID logic
// *================================================

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

// *=================================================
//* REFRESH_TOKEN
// *================================================

const refreshToken = async (req, res) => {
  const token = req.body.refresh_token;
  if (!token) {
    return res.status(200).send({
      success: false,
      message: "A token is required for authorization",
    });
  }
  try {
    const decodedUser = jwt.verify(token, TOKEN_DETAILS.REFRESH_SECRET_KEY);
    if (decodedUser) {
      const token = jwt.sign(
        {
          userId: decodedUser?.userId.toString(),
        },
        TOKEN_DETAILS.JWT_SECRET_KEY,
        {
          expiresIn: TOKEN_DETAILS.ACCESS_TOKEN_EXPIRATION_TIME,
        }
      );

      return res.status(200).send({
        access_token: token,
        message: "new token generated successfully",
      });
    } else {
      return res.send({ message: "invalid token" });
    }
  } catch (error) {
    return res.status(400).send({ message: "invalid token" });
  }
};

const fileUpload = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.log(err, "err");
      return res.status(400).send({ success: true, message: err.message });
    } else {
      const { userId } = req.user;
      const uploadedFiles = req.files;
      let imageExist = await Image.findOne({ userId });

      const images = [];
      if (!imageExist) {
        imageExist = new Image({ userId, images: [] });
      }

      if (uploadedFiles) {
        for (const file of uploadedFiles) {
          const filePath = path.join(__dirname, "../uploads/" + file.filename);

          const imageAsBase64 = fs.readFileSync(filePath, "base64");
          images.push({
            image: `data:image/${file.mimetype};base64,${imageAsBase64}`,
          });
          fs.unlinkSync(filePath);
        }
      }

      let tempImgList = [...imageExist.images, ...images];
      imageExist.images = tempImgList;
      await imageExist.save();

      res.status(200).send({
        success: true,
        message: "files uploaded successfully",
      });
    }
  });
};

const getFiles = async (req, res) => {
  const images = await Image.find();
  if (images) {
    res.status(200).send({
      success: true,
      message: "Images found succesfully",
      images,
    });
  }
};

const deleteFile = async (req, res) => {
  const imgId = req.params.id;
  const { userId } = req.user;

  const deltedImage = await Image.findOneAndUpdate(
    { userId },
    { $pull: { images: { _id: imgId } } },
    { new: true }
  );
  if (deltedImage) {
    res.status(200).send({
      success: true,
      message: "Images delete succesfully",
    });
  } else {
    res.status(400).send({
      success: true,
      message: "Images not found",
    });
  }
};

module.exports = {
  login,
  register,
  userDetails,
  refreshToken,
  fileUpload,
  getFiles,
  deleteFile,
};
