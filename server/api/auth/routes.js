var router = require('express').Router();
var controller = require('./controller');

router.post('/signup', controller.signup);

module.exports = router;
