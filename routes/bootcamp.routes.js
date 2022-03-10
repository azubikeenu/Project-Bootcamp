const { imageUploader, authMiddleWare } = require('../middlewares');
const router = require('express').Router();

const {
  getBootCamp,
  getBootCamps,
  createBootcamp,
  deleteBootCamp,
  updateBootcamp,
  getBootCampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers').BootCampController;

const courseRouter = require('./course.routes');

const reviewRouter = require('./review.routes');

router.route('/radius/:zipcode/:distance').get(getBootCampsInRadius);

router
  .route('/:id/photo')
  .put(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('publisher', 'admin'),
    imageUploader,
    bootcampPhotoUpload
  );

router
  .route('/')
  .get(getBootCamps)
  .post(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('publisher', 'admin'),
    createBootcamp
  );

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/:id')
  .get(getBootCamp)
  .put(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('publisher', 'admin'),
    updateBootcamp
  )
  .delete(
    authMiddleWare.protect,
    authMiddleWare.restrictTo('publisher', 'admin'),
    deleteBootCamp
  );

module.exports = router;
