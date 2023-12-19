const mongoose = require("mongoose");
const User = require("../models/user.model");

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
