const express = require("express");
const router = express.Router();
const authRouter = require("./auth.routes");
const fileRouter = require("./files.routes");

router.use("/auth", authRouter);
router.use("/files", fileRouter);

module.exports = router;
