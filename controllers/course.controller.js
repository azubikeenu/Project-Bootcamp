const { StatusCodes } = require('http-status-codes');
const { Course } = require('../models');
const { ErrorResponse, QueryBuilder } = require('../utils');
const { asyncHandler } = require('../middlewares');

module.exports = class CourseController {
  /**
   * @description Get all courses
   * @route GET /api/v1/courses  api/v1/bootcamps/:bootcampId/courses
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static getCourses = asyncHandler(async (req, res, next) => {
    const filter = req.params.bootcampId
      ? { bootcamp: req.params.bootcampId }
      : {};
    const { query } = new QueryBuilder(
      Course.find(filter).populate({
        path: 'bootcamp',
        select: 'name description',
      }),
      req.query
    )
      .filter()
      .select()
      .paginate()
      .sort();
    const courses = await query;
    return res
      .status(StatusCodes.OK)
      .json({ status: 'Success', count: courses.length, courses });
  });
};
