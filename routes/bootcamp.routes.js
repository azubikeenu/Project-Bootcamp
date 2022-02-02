const router = require('express').Router();
const {
  getBootCamp,
  getBootCamps,
  createBootcamp,
  deleteBootCamp,
  updateBootcamp,
} = require('../controllers').BootCampController;

router.route('/').get(getBootCamps).post(createBootcamp);

router
  .route('/:id')
  .get(getBootCamp)
  .put(updateBootcamp)
  .delete(deleteBootCamp);

module.exports = router;
