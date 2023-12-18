require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");
const connectDb = require("./utils/db.js");
const colors = require("colors");
const fs = require("fs");
const path = require("path");
const Image = require("./models/image.model.js");

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

const upload = multer({ storage: storage });
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("test-backend is working");
});

app.post("/upload", upload.array("image", 5), async (req, res) => {
  console.log(req.files);

  let images = [];

  if (req.files) {
    for (const file of req.files) {
      const imageAsBase64 = fs.readFileSync(
        path.join(__dirname + "/uploads/" + file.filename),
        "base64"
      );

      images.push({
        image: `data:image/${file.mimetype};base64,${imageAsBase64}`,
      });
    }
  }

  const imageCreated = await Image.create({
    images: images,
  });
  if (imageCreated) {
    res.status(200).send({
      success: true,
      message: "image created succesfully",
    });
  }
});

app.get("/images", async (req, res) => {
  const images = await Image.find();
  if (images) {
    res.status(200).send({
      success: true,
      message: "image created succesfully",
      images,
    });
  }
});

connectDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`server is running at port: ${process.env.PORT}`.bgMagenta);
  });
});
