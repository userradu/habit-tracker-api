const router = require('express').Router();

router.use('/signup', require('./signup/signupRoutes'));
router.use('/login', require('./login/loginRoutes'));
router.use('/forgot-password', require('./forgotPassword/forgotPasswordRoutes'));

module.exports = router;
