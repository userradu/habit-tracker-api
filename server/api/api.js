const router = require('express').Router();

router.use('/auth', require('./auth/auth'));
router.use('/habits', require('./habit/habitRoutes'));
router.use('/history', require('./history/historyRoutes'));

module.exports = router;
