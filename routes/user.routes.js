const { authMiddleWare } = require('../middlewares');
const { getUsers, createUser, deleteUser, updateUser,getUser } =
  require('../controllers').UserController;

const router = require('express').Router();

router.use(authMiddleWare.protect, authMiddleWare.restrictTo('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
