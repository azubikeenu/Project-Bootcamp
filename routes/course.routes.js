const router = require('express').Router({ mergeParams: true });
const { getCourses } = require('../controllers').CourseController;

router.route('/').get(getCourses);

module.exports = router;
