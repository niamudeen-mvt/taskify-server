require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");
const connectDb = require("./utils/db.js");
const colors = require("colors");
const path = require("path");
const app = express();

// app.use(express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("test-backend is working");
});

connectDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`server is running at port: ${process.env.PORT}`.bgMagenta);
  });
});
