var router = require('express').Router();
var controller = require('./controller');

router.post('/', controller.login);

module.exports = router;
