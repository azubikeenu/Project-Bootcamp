const { StatusCodes } = require('http-status-codes');
const { Review, Bootcamp } = require('../models');
const { QueryBuilder, ErrorResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

module.exports = class ReviewController {
  /**
   * @description Get all reviews
   * @route GET /api/v1/reviews  api/v1/bootcamps/:bootcampId/reviews
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static getReviews = asyncHandler(async (req, res, next) => {
    const filter = req.params.bootcampId
      ? { bootcamp: req.params.bootcampId }
      : {};
    const { query } = new QueryBuilder(
      Review.find(filter).populate({
        path: 'bootcamp',
        select: 'name description',
      }),
      req.query
    )
      .filter()
      .select()
      .paginate()
      .sort();
    const reviews = await query;
    return res
      .status(StatusCodes.OK)
      .json({ status: 'Success', count: reviews.length, data: reviews });
  });

  /**
   * @description Get a single review
   * @route GET /api/v1/reviews/:id
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description',
    });
    if (!review)
      return next(
        new ErrorResponse(
          `No review found with id : ${req.params.id}`,
          StatusCodes.NOT_FOUND
        )
      );
    return res.status(StatusCodes.OK).json({ status: 'Success', data: review });
  });

  /**
   * @description Add a review to a bootcamp
   * @route POST /api/v1/bootcamp/:bootcampId/reviews
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static createReview = asyncHandler(async (req, res, next) => {
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
    const review = await Review.create(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json({ status: 'Success', data: review });
  });

  /**
   * @description Update a single review
   * @route PUT /api/v1/reviews/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review)
      return next(
        new ErrorResponse(
          `No review found with id : ${req.params.id}`,
          StatusCodes.NOT_FOUND
        )
      );
    //make sure user is the review owner
    if (
      review.user.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          'Can only update reviews created by you',
          StatusCodes.FORBIDDEN
        )
      );
    }
    req.body.user = req.user.id;

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(StatusCodes.OK).json({ status: 'Success', data: review });
  });

  /**
   * @description Delete a single review
   * @route DELETE /api/v1/reviews/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review)
      return next(
        new ErrorResponse(
          `No review found with id : ${req.params.id}`,
          StatusCodes.NOT_FOUND
        )
      );
    //make sure user is the review owner
    if (
      review.user.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          'Can only delete reviews created by you',
          StatusCodes.FORBIDDEN
        )
      );
    }
    review.remove();
    return res
      .status(StatusCodes.NO_CONTENT)
      .json({ status: 'Success', data: {} });
  });
};
