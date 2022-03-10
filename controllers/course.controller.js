const { StatusCodes } = require('http-status-codes');
const { Course, Bootcamp } = require('../models');
const { QueryBuilder, ErrorResponse } = require('../utils');
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
      return next(
        new ErrorResponse(`No course found with id : ${req.params.id}`)
      );
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
    req.body.user = req.user.id;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp)
      return next(
        new ErrorResponse(
          `No bootcamp found with id : ${req.params.bootcampId}`,
          StatusCodes.NOT_FOUND
        )
      );
    //make sure user is the bootcamp owner
    if (
      bootcamp.user.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          'You can only add courses to bootcamps created by you',
          StatusCodes.FORBIDDEN
        )
      );
    }
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
    let course = await Course.findById(req.params.id);
    //make sure user is the course owner
    if (
      course.user.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          'Can only update courses created by you',
          StatusCodes.FORBIDDEN
        )
      );
    }
    req.body.user = req.user.id;
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
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
    const course = await Course.findById(req.params.id);
    if (!course)
      return next(
        new ErrorResponse(
          `No course found with id : ${req.params.id}`,
          StatusCodes.NOT_FOUND
        )
      );

    //make sure user is the course owner
    if (
      course.user.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          'Can only delete courses created by you',
          StatusCodes.FORBIDDEN
        )
      );
    }
    course.remove();
    return res
      .status(StatusCodes.NO_CONTENT)
      .json({ status: 'Success', data: {} });
  });
};
