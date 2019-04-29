const router = require('express').Router();
const controller = require('./habitController');
const { requireAuthentication } = require('../../middleware/authMiddleware')

router.all('*', requireAuthentication);

router.route('/')
  .get(controller.getAllHabits)
  .post(controller.createHabit);

router.route('/:id')
  .get(controller.getHabit)
  .put(controller.updateHabit)
  .delete(controller.deleteHabit);

module.exports = router;
