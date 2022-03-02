const router = require('express').Router();
const { registerUser, loginUser, getMe , forgotPassword} =
  require('../controllers').AuthController;

const { authMiddleWare } = require('../middlewares');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/me').get(authMiddleWare.protect, getMe);
router.route('/forgot-password').get( forgotPassword);


module.exports = router;
