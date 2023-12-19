const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  images: [
    {
      image: String,
    },
  ],
});

const Image = mongoose.model("Image", imgSchema);

module.exports = Image;
