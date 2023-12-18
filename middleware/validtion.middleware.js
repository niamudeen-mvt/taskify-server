const { body } = require("express-validator");

const validateRegisterSchema = [
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .trim()
    .isString()
    .withMessage("name should not contain numbers"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isNumeric()
    .withMessage("Phone number should contain only numbers")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number should be 10 digits long"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 3 })
    .withMessage("Password should be at least 3 characters long"),
];
const validateLoginSchema = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 3 })
    .withMessage("Password should be at least 3 characters long"),
];

module.exports = { validateRegisterSchema, validateLoginSchema };
