const Story = require("../models/story.model");
const User = require("../models/user.model");

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
  try {
    const { userId } = req.user;
    const { message, image } = req.body;
    if (!message) {
      res.status(200).send({ message: "Message field is required" });
      return;
    }

    let storyExist = await Story.findOne({ userId });

    if (!storyExist) {
      storyExist = new Story({ userId, stories: [] });
    }

    if (image) {
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
  } catch (error) {
    console.log(error, "error");
    res.status(500).send({ message: error.message });
  }
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

const storyLikes = async (req, res) => {
  const { userId } = req.user;
  const { storyId, storyUserId } = req.body;

  const story = await Story.findOne({ userId: storyUserId }).populate(
    "userId",
    { name: 1 }
  );
  if (story) {
    const { name } = await User.findById({ _id: userId });
    const storyToUpdate = story.stories.find((obj) => obj._id == storyId);
    storyToUpdate.likes = [
      ...storyToUpdate.likes,
      { userId: userId, name: name },
    ];

    const updatedStories = story.stories.map((story) => {
      if (story._id == storyId) return storyToUpdate;
      else return story;
    });

    story.stories = updatedStories;
    await story.save();
    let stories = await Story.find().populate("userId", { name: 1 });
    res.status(200).send({
      success: true,
      message: "Story liked successfully",
      stories,
    });
  } else {
    res.send({ message: "story not found" });
  }
};

const storyViews = async (req, res) => {
  const { userId } = req.user;
  const { storyId, storyUserId } = req.body;

  const story = await Story.findOne({ userId: storyUserId });
  if (story) {
    const storyToUpdate = story.stories.find((obj) => obj._id == storyId);

    console.log(storyToUpdate, "storyToUpdate");
    storyToUpdate.views = [...storyToUpdate.views, { userId }];

    const updatedStories = story.stories.map((story) => {
      if (story._id == storyId) return storyToUpdate;
      else return story;
    });

    story.stories = updatedStories;
    await story.save();

    res.status(200).send({
      success: true,
      message: "story viewed successfully",
      story: story,
    });
  } else {
    res.send({ message: "story not found" });
  }
};

module.exports = {
  postStory,
  getStories,
  deleteStory,
  storyLikes,
  storyViews,
};
