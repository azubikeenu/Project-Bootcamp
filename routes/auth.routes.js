const router = require('express').Router();
const { registerUser, loginUser, getMe } =
  require('../controllers').AuthController;
const { authMiddleWare } = require('../middlewares');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/me').get(authMiddleWare.protect, getMe);

module.exports = router;
