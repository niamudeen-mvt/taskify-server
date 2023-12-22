const mongoose = require("mongoose");
const User = require("../models/user.model");

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  stories: [
    {
      message: String,
      image: String,
    },
  ],
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
