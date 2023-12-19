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
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only .webp .jpeg, .jpg & .png images are allowed"));
    }
  },
  limits: { fileSize: maxSize },
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
  const images = await Image.findOne({ userId: req.user.userId });
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
      images: deltedImage,
    });
  } else {
    res.status(400).send({
      success: true,
      message: "Images not found",
    });
  }
};

module.exports = {
  fileUpload,
  getFiles,
  deleteFile,
};
