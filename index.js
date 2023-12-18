const express = require("express");
const dotenv = require("dotenv");
const connectedToDb = require("./config/db");
const cors = require("cors");
const router = require("./routes/index");

// config env
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", router);

connectedToDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`);
  });
});
