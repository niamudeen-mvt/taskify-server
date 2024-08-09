const jwt = require("jsonwebtoken");
const TOKEN_DETAILS = require("../config/index");

const verifyToken = (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(200).send({
      success: false,
      message: "A token is required for authorization",
    });
  }
  try {
    const decodedUser = jwt.verify(token, TOKEN_DETAILS.JWT_SECRET_KEY);
    req.user = decodedUser;
  } catch (error) {
    console.log("error: ", error);
    return res.status(401).send({ message: "Token has expired" });
  }
  return next();
};

module.exports = { verifyToken };
