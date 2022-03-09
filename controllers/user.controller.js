const { StatusCodes } = require('http-status-codes');
const { ErrorResponse, QueryBuilder } = require('../utils');
const { asyncHandler } = require('../middlewares');
const { User } = require('../models');

module.exports = class UserController {
  /**
   * @description Get all users
   * @route GET /api/v1/users
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static getUsers = asyncHandler(async (req, res, next) => {
    const { query } = new QueryBuilder(User.find(), req.query)
      .filter()
      .select()
      .sort()
      .paginate();
    const users = await query;
    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { count: users.length, users },
    });
  });

  /**
   * @description Get single user
   * @route GET /api/v1/users/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user)
      return next(new ErrorResponse('User does not exist in the database'));

    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { user },
    });
  });

  /**
   * @description Create single user
   * @route POST /api/v1/users/
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    res.status(StatusCodes.CREATED).json({
      status: 'Success',
      data: { user },
    });
  });

  /**
   * @description Update single user
   * @route PUT /api/v1/users/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!user)
      return next(new ErrorResponse('User does not exist in the database'));

    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { user },
    });
  });
  /**
   * @description Delete single user
   * @route DELETE /api/v1/users/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return next(new ErrorResponse('User does not exist in the database'));

    res.status(StatusCodes.NO_CONTENT).json({
      status: 'Success',
      data: {},
    });
  });
};
