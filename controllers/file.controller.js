const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Image = require("../models/image.model");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// const maxSize = 200 * 1024;
// const allowedMimeTypes = ["image/jpg", "image/png", "image/jpeg", "image/webp"];

// const fileFilter = (req, file, cb) => {
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only .webp, .jpeg, .jpg & .png images are allowed"));
//   }
// };

const upload = multer({
  storage: storage,
  // fileFilter: fileFilter,
  // limits: { fileSize: maxSize },
}).array("image");

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
        images: imageExist,
      });
    }
  });
};

const getFiles = async (req, res) => {
  const { userId } = req.user;
  if (userId) {
    const images = await Image.find({ userId });
    if (images) {
      res.status(200).send({
        success: true,
        message: "Images found succesfully",
        images,
      });
    }
  } else {
    res.status(400).send({
      success: true,
      message: "No user found",
    });
  }
};

const deleteFile = async (req, res) => {
  const imgId = req.params.id;
  const { userId } = req.user;

  if (!mongoose.isValidObjectId(imgId)) {
    return res.status(400).send({
      success: false,
      message: "Invalid image ID",
    });
  }

  try {
    const deletedImage = await Image.findOneAndUpdate(
      { userId },
      { $pull: { images: { _id: imgId } } },
      { new: true }
    );

    if (deletedImage) {
      res.status(200).send({
        success: true,
        message: "Image deleted successfully",
        images: deletedImage,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Image not found for deletion",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error deleting image",
      error: err.message,
    });
  }
};

module.exports = {
  fileUpload,
  getFiles,
  deleteFile,
};
