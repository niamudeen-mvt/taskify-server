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
    let stories = await Story.find().populate("userId", { name: 1 });
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

const postStory = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.log(err);
      res.send({ message: err.message });
    }
    const { userId } = req.user;
    const { message } = req.body;
    if (!message)
      res.status(200).send({ message: "Message field is required" });

    let storyExist = await Story.findOne({ userId });

    if (!storyExist) {
      storyExist = new Story({ userId, stories: [] });
    }

    if (req.file) {
      const file = req.file;
      const filePath = path.join(__dirname, "../uploads/" + file.filename);
      console.log(filePath, "file path");
      const imageAsBase64 = fs.readFileSync(filePath, "base64");
      const image = `data:image/${file.mimetype};base64,${imageAsBase64}`;

      // fs.unlinkSync(filePath);

      storyExist.stories = [
        ...storyExist.stories,
        {
          message,
          image,
        },
      ];
      await storyExist.save();
      // posting story with image

      res.status(200).send({
        success: true,
        message: "Story posted succesfully",
      });
    } else {
      // posting story with only message

      const story = await Story.findOneAndUpdate(
        { userId },
        { $push: { stories: { message } } },
        {
          new: true,
        }
      );

      res.status(200).send({
        success: true,
        message: "Story posted succesfully",
        story,
      });
    }
  });
};

const deleteStory = async (req, res) => {
  const { userId } = req.user;
  const storyId = req.params.id;

  const story = await Story.findOneAndUpdate(
    { userId },
    { $pull: { stories: { _id: storyId } } },
    { new: true }
  );
  if (story) {
    res.status(200).send({
      success: true,
      message: "Story deleted succesfully",
      story: story,
    });
  } else {
    res.status(400).send({
      success: true,
      message: "Story not found",
    });
  }
};

module.exports = {
  postStory,
  getStories,
  deleteStory,
};
