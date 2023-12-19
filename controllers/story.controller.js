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
  try {
    let stories = await Story.find();
    if (stories.length > 0) {
      res.status(200).send({
        success: true,
        message: "Stories found successfully",
        stories,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No stories found for other users",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error fetching stories",
      error: err.message,
    });
  }
};

const postStory = async (req, res, next) => {
  upload(req, res, async function (err) {
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

const deleteStory = async (req, res) => {
  const { userId } = req.user;

  const story = await Story.findOneAndDelete({ userId }, { new: true });
  if (story) {
    res.status(200).send({
      success: true,
      message: "story delete succesfully",
      story: story,
    });
  } else {
    res.status(400).send({
      success: true,
      message: "story not found",
    });
  }
};

module.exports = {
  postStory,
  getStories,
  deleteStory,
};
