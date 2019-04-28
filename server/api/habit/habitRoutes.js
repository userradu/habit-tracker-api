const router = require('express').Router();
const controller = require('./habitController');
const { verifyToken } = require('../../middleware/authMiddleware')

router.route('/')
  .get(verifyToken, controller.getAllHabits)
  .post(verifyToken, controller.createHabit);

router.route('/:id')
  .get(verifyToken, controller.getHabit)
  .put(verifyToken, controller.updateHabit)
  .delete(verifyToken, controller.deleteHabit);

module.exports = router;
