const mongoose = require("mongoose");

const imgSchema = new mongoose.Schema({
  images: [
    {
      image: String,
    },
  ],
});

const Image = mongoose.model("Image", imgSchema);

module.exports = Image;
