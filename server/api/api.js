const router = require('express').Router();

router.use('/auth', require('./auth/auth'));
router.use('/habits', require('./habit/habitRoutes'));
router.use('/history', require('./history/historyRoutes'));
router.use('/users', require('./user/userRoutes'));

module.exports = router;
