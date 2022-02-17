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

router.route('/radius/:zipcode/:distance').get(getBootCampsInRadius);

router.route('/:id/photo').put(bootcampPhotoUpload);

router.route('/').get(getBootCamps).post(createBootcamp);

router.use('/:bootcampId/courses', courseRouter);

router
  .route('/:id')
  .get(getBootCamp)
  .put(updateBootcamp)
  .delete(deleteBootCamp);

module.exports = router;
