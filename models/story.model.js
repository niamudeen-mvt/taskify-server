const mongoose = require("mongoose");
// const User = require("../models/user.model");

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  stories: [
    {
      type: new mongoose.Schema(
        {
          message: String,
          image: String,
          likes: [{ userId: String, name: String }],
          views: [{ userId: String, name: String }],
        },
        {
          timestamps: true,
        }
      ),
    },
  ],
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
