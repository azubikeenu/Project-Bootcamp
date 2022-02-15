const { StatusCodes } = require('http-status-codes');
const { Course, Bootcamp } = require('../models');
const { QueryBuilder } = require('../utils');
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
      .json({ status: 'Success', count: courses.length, data: courses });
  });
  /**
   * @description Get a single course
   * @route GET /api/v1/courses/:id
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description',
    });
    if (!course)
      return res.status(StatusCodes.NOT_FOUND).json({
        status: 'Fail',
        message: `No course found with that id : ${req.params.id}`,
      });

    return res.status(StatusCodes.OK).json({ status: 'Success', data: course });
  });

  /**
   * @description Add a single course
   * @route POST /api/v1/bootcamp/:bootcampId/courses
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp)
      return res.status(StatusCodes.NOT_FOUND).json({
        status: 'Fail',
        message: `No bootcamp found with id ${req.params.bootcampId}`,
      });

    const course = await Course.create(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json({ status: 'Success', data: course });
  });

  /**
   * @description Update a single course
   * @route PUT /api/v1/courses/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static updateCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators : true
    });
    if (!course)
      return res.status(StatusCodes.NOT_FOUND).json({
        status: 'Fail',
        message: `No course found with id ${req.params.id}`,
      });
    return res.status(StatusCodes.OK).json({ status: 'Success', data: course });
  });
  /**
   * @description Delete a single course
   * @route DELETE /api/v1/courses/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id, req.body);
    if (!course)
      return res.status(StatusCodes.NOT_FOUND).json({
        status: 'Fail',
        message: `No course found with id ${req.params.id}`,
      });

     course.remove();
    return res
      .status(StatusCodes.NO_CONTENT)
      .json({ status: 'Success', data: {} });
  });
};
