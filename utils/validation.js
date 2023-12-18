
const { body } = require('express-validator');

exports.validateUser = [
  body('name', 'Name is requied').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('phone', 'Mobile number should contains 10 digits')
    .isLength({ min: 10, max: 10 }),
  body('password', 'Password must be 6 or more characters').isLength({ min: 3 }),
]
