const Story = require("../models/story.model");
const fs = require("fs");
const path = require("path");
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

const upload = multer({
  storage: storage,
}).single("image");

const getStories = async (req, res) => {
  const stories = await Story.find({ userId: req.user.userId });
  if (stories) {
    res.status(200).send({
      success: true,
      message: "Stories found succesfully",
      stories,
    });
  }
};

const postStory = async (req, res, next) => {
  upload(req, res, async function (err) {
    console.log(req.body);
    if (err) {
      console.log(err);
      res.send({ message: err.message });
    }

    const { userId } = req.user;
    const { message } = req.body;

    if (!message) res.send({ message: "message field is required" });
    else {
      if (req.file) {
        const file = req.file;
        const filePath = path.join(__dirname, "../uploads/" + file.filename);

        const imageAsBase64 = fs.readFileSync(filePath, "base64");

        const image = `data:image/${file.mimetype};base64,${imageAsBase64}`;
        fs.unlinkSync(filePath);

        const story = await Story.create({
          userId,
          message,
          image,
        });

        res.status(200).send({
          success: true,
          message: "Story Posted",
          story,
        });
      } else {
        const story = await Story.create({
          userId,
          message,
        });

        res.status(200).send({
          success: true,
          message: "Story Posted",
          story,
        });
      }
    }
  });
};

module.exports = {
  postStory,
  getStories,
};
