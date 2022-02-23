const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const { ErrorResponse } = require('../utils');
const { asyncHandler } = require('../middlewares');

module.exports = class AuthController {
  /**
   * @description Register a user
   * @route POST /api/v1/auth/resgister
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    const token = user.getSignedJWTToken();
    return res
      .status(StatusCodes.CREATED)
      .json({ status: 'Success', token, data: { user } });
  });

  /**
   * @description login user
   * @route POST /api/v1/auth/login
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // check if email and password are present
    if (!email || !password)
      return next(
        new ErrorResponse(
          'Please provide an email or password',
          StatusCodes.BAD_REQUEST
        )
      );
    //check for user
    const user = await User.findOne({ email }).select('+password');

    // validate email and password
    if (!user || !(await user.matchPassword(password, user.password))) {
      return next(
        new ErrorResponse(
          'Incorrect email or password',
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    const token = user.getSignedJWTToken();
    return res.status(StatusCodes.CREATED).json({ status: 'Success', token });
  });

  /**
   * @description Get the current loggedin  user
   * @route GET /api/v1/auth/me
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user);
    return res.status(StatusCodes.OK).json({ status: 'Success', data: { user } });
  });
};
