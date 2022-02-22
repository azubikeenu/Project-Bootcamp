const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const { ErrorResponse, QueryBuilder } = require('../utils');
const { asyncHandler } = require('../middlewares');

module.exports = class AuthController {
  /**
   * @description Register a user
   * @route GET /api/v1/auth/resgister
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
};
