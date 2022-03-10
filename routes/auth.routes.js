const router = require('express').Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
} = require('../controllers').AuthController;

const { authMiddleWare } = require('../middlewares');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/me').get(authMiddleWare.protect, getMe);
router.route('/logout').get(authMiddleWare.protect, logout);
router.route('/update_me').put(authMiddleWare.protect, updateDetails);
router.route('/update_password').put(authMiddleWare.protect, updatePassword);
router.route('/forgot-password').get(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);

module.exports = router;
