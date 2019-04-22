const router = require('express').Router();

router.use('/signup', require('./signup/routes'));
router.use('/login', require('./login/routes'));

module.exports = router;
