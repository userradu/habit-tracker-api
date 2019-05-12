const router = require('express').Router();
const controller = require('./userController');

router.post('/checkEmailExists', controller.checkEmailExists);

module.exports = router;
