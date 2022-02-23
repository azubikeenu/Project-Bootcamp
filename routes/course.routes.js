const router = require('express').Router({ mergeParams: true });
const { authMiddleWare } = require('../middlewares');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } =
  require('../controllers').CourseController;

router.route('/').get(getCourses).post(authMiddleWare.protect, authMiddleWare.restrictTo('publisher','admin'),createCourse);
router
  .route('/:id')
  .get(getCourse)
  .put(authMiddleWare.protect,authMiddleWare.restrictTo('publisher','admin'), updateCourse)
  .delete(authMiddleWare.protect,authMiddleWare.restrictTo('publisher','admin'), deleteCourse);

module.exports = router;
