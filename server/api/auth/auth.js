const router = require('express').Router();

router.use('/signup', require('./signup/signupRoutes'));
router.use('/login', require('./login/loginRoutes'));

module.exports = router;
