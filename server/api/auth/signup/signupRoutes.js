var router = require('express').Router();
var signupController = require('./signupController');

router.post('/', signupController.signup);
router.post('/verify-account', signupController.verifyAccount);

module.exports = router;
