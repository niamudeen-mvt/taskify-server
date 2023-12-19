const express = require("express");
const router = express.Router();
const authRouter = require("./auth.routes");
const fileRouter = require("./files.routes");
const storyRouter = require("./story.routes");

router.use("/auth", authRouter);
router.use("/files", fileRouter);
router.use("/story", storyRouter);

module.exports = router;
