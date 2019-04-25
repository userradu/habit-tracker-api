var router = require('express').Router();
var forgotPasswordController = require('./forgotPasswordController');

router.post('/', forgotPasswordController.sendResetPasswordEmail);
router.post('/reset', forgotPasswordController.resetPassword);

module.exports = router;
