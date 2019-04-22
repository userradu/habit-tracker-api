var router = require('express').Router();
var controller = require('./controller');

router.post('/', controller.signup);
router.post('/verify-account', controller.verifyAccount);

module.exports = router;
