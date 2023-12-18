const express = require("express");
const router = express.Router();
const authRouter = require("./auth.routes");

router.use("/auth", authRouter);

module.exports = router;
