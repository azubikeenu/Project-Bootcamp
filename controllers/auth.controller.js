const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const { ErrorResponse, Email } = require('../utils');
const { asyncHandler } = require('../middlewares');
const crypto = require('crypto');

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
    return AuthController.sendTokenResponse(user, res);
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
    return res
      .status(StatusCodes.OK)
      .json({ status: 'Success', data: { user } });
  });

  /**
   * @description Generates token to reset password
   * @route GET /api/v1/auth/forgot-password
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static forgotPassword = asyncHandler(async (req, res, next) => {
    // get user based on supplied email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return next(
        new ErrorResponse(
          'No user with that email address',
          StatusCodes.NOT_FOUND
        )
      );

    const token = user.generateResetToken();

    await user.save({ validateBeforeSave: false });

    //send user an email with the random token
    try {
      const resetUrl = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/auth/reset-password/${token}`;
      const text = `Please click on the link to reset password\n ${resetUrl}\n
      NB: Token is only valid for 10 minutes

    `;
      await new Email(user, resetUrl).sendPasswordReset(text);
    } catch (err) {
      // rollback if an error occurs
      user.restPasswordToken = undefined;
      user.resetPasswordExpiration = undefined;
      await user.save({ validateBeforeSave: false });
      console.log(err);
      return next(
        new ErrorResponse(
          'There was a problem in sending the email',
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
    res.status(200).json({
      status: 'Success',
      message: 'Token sent to email',
    });
  });

  /**
   * @description Generates token to reset password
   * @route PUT /api/v1/auth/reset-password/:token
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static resetPassword = asyncHandler(async (req, res, next) => {
    let { token } = req.params;
    token = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiration: { $gt: Date.now() }, // this only returns of the reset token is still valid
    });
    if (!user)
      next(new ErrorResponse('Token has expired', StatusCodes.BAD_REQUEST));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiration = undefined;
    await user.save();
    AuthController.sendTokenResponse(user, res);
  });

  /**
   * @description Update user details
   * @route PUT /api/v1/auth/update_me
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static updateDetails = asyncHandler(async (req, res, next) => {
    // get the currently logged in user
    const user = await User.findById(req.user._id);
    if (!user)
      return next(
        ErrorResponse('User not found in the database', StatusCodes.NOT_FOUND)
      );
    req.body = AuthController.filteredBody(req.body, 'email', 'name');
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      runValidators: true,
      new: true,
    });

    return res.status(StatusCodes.OK).json({
      status: 'Success',
      data: {
        user: updatedUser,
      },
    });
  });

  /**
   * @description Update user password
   * @route PUT /api/v1/auth/update_password
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */

  static updatePassword = asyncHandler(async (req, res, next) => {
    // get the current user
    const user = await User.findById(req.user._id).select('+password');
    if (!user)
      return next(
        new ErrorResponse(
          `User does not exist in the database`,
          StatusCodes.NOT_FOUND
        )
      );
    if (!(await user.matchPassword(req.body.currentPassword, user.password))) {
      return next(
        new ErrorResponse(
          'The password supplied is incorrect',
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    user.password = req.body.newPassword;
    await user.save();
    AuthController.sendTokenResponse(user, res);
  });

  static sendTokenResponse(user, res) {
    const token = user.getSignedJWTToken();
    return res.status(StatusCodes.OK).json({ status: 'Success', token });
  }

  static filteredBody = (obj, ...allowedFields) => {
    const filteredObject = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) filteredObject[el] = obj[el];
    });
    return filteredObject;
  };
};
