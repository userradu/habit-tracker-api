const router = require('express').Router();
const controller = require('./userController');

router.post('/checkEmailNotTaken', controller.checkEmailNotTaken)

module.exports = router;
