const express = require("express");
const fileRouter = express.Router();
const Controller = require("../controllers/file.controller");
const { verifyToken } = require("../middleware/auth.middleware");

fileRouter.route("/upload").post(verifyToken, Controller.fileUpload);
fileRouter.route("/").get(verifyToken, Controller.getFiles);
fileRouter.route("/delete/:id").delete(verifyToken, Controller.deleteFile);

module.exports = fileRouter;
