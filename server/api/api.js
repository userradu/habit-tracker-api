const router = require('express').Router();

router.use('/auth', require('./auth/auth'));
router.use('/users', require('./user/userRoutes'));

module.exports = router;
