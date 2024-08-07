require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes/index.js");
const connectDb = require("./utils/db.js");
const colors = require("colors");
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("test-backend is working");
});

connectDb();
app.listen(PORT, () => {
  console.log(`server is running at port: ${PORT}`.bgMagenta);
});
