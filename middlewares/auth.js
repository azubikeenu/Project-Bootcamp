const { StatusCodes } = require('http-status-codes');
const { User } = require('../models');
const { ErrorResponse } = require('../utils');
const asyncHandler = require('./asynchandler');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

//protect routes
module.exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new ErrorResponse('Please login to continue', StatusCodes.UNAUTHORIZED)
    );
  }
  // verify the token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const returnedUser = await User.findById(decodedToken.id);
  // check if user still exists
  if (!returnedUser)
    return next(
      new ErrorResponse(`The user doesn't exist`, StatusCodes.UNAUTHORIZED)
    );
  // check if password is changed

  req.user = returnedUser;
  next();
});

// Authorization logic
module.exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          'You do not have permission to perform this action',
          StatusCodes.FORBIDDEN
        )
      );
    }
    next();
  };
