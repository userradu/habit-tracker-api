var router = require('express').Router();
var controller = require('./userController');
const { verifyToken } = require('../../middleware/authMiddleware')

router.route('/')
  .get(verifyToken, controller.get)

module.exports = router;
