var router = require('express').Router();
var loginController = require('./loginController');

router.post('/', loginController.login);

module.exports = router;
