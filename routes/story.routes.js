const express = require("express");
const storyRouter = express.Router();
const Controllers = require("../controllers/story.controller");
const { verifyToken } = require("../middleware/auth.middleware");

storyRouter.route("/post").post(verifyToken, Controllers.postStory);
storyRouter.route("/").get(verifyToken, Controllers.getStories);
storyRouter.route("/delete/:id").delete(verifyToken, Controllers.deleteStory);
storyRouter.route("/likes").patch(verifyToken, Controllers.storyLikes);
storyRouter.route("/views").patch(verifyToken, Controllers.storyViews);

module.exports = storyRouter;
