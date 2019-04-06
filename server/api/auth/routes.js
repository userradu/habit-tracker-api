var router = require('express').Router();
var controller = require('./controller');

router.post('/signup', controller.signup);
router.post('/verifyAccount', controller.verifyAccount);

module.exports = router;
