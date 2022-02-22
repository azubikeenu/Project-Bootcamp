const router = require('express').Router();
const { registerUser } = require('../controllers').AuthController;

router.route('/register').post(registerUser);


module.exports = router;