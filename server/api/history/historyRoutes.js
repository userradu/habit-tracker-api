const router = require('express').Router();
const controller = require('./historyController');
const { requireAuthentication } = require('../../middleware/authMiddleware');

router.all('*', requireAuthentication);

router.route('/:habitId')
  .get(controller.getHistory)
  .post(controller.addDay)
  .delete(controller.removeDay);

module.exports = router;
