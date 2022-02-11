const router = require('express').Router();
const {
  getBootCamp,
  getBootCamps,
  createBootcamp,
  deleteBootCamp,
  updateBootcamp,
  getBootCampsInRadius,
} = require('../controllers').BootCampController;

const courseRouter = require('./course.routes');

router.route('/').get(getBootCamps).post(createBootcamp);

router.use('/:bootcampId/courses', courseRouter);

router
  .route('/:id')
  .get(getBootCamp)
  .put(updateBootcamp)
  .delete(deleteBootCamp);

router.route('/radius/:zipcode/:distance').get(getBootCampsInRadius);

module.exports = router;
