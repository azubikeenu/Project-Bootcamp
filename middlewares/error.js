const { ErrorResponse } = require('../utils');
const { StatusCodes } = require('http-status-codes');

const castErrorHandler = (err) => {
  const value =
    err.value instanceof Object
      ? `Invalid parameter ${Object.keys(err.value)[0]}`
      : err.value;

  const message =
    err.path === '_id'
      ? `No resource found with id ${value}`
      : `Invalid ${err.path} : ${value}`;
  return new ErrorResponse(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateKeys = (err) => {
  const value = Object.keys(err.keyValue).join(' ');
  const message = `Duplicate value for ${value}, please use another value`;
  return new ErrorResponse(message, StatusCodes.BAD_REQUEST);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join(` , `);
  const message = `Invalid inputs data: ${errors}`;
  return new ErrorResponse(message, StatusCodes.BAD_REQUEST);
};

const handleJWTError = () =>
  new ErrorResponse(
    'Invalid Token! Please log in again ',
    StatusCodes.UNAUTHORIZED
  );

const handleJWTExpiredError = () =>
  new ErrorResponse(
    'Your Token has expired ! Please log in again',
    StatusCodes.UNAUTHORIZED
  );

module.exports = (err, req, res, next) => {
  let error = { ...err };

  console.log(err.stack.red);

  if (err.name === 'CastError') {
    error = castErrorHandler(err);
  }
  if (err.code === 11000) {
    error = handleDuplicateKeys(err);
  }
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  res.status(err.statusCode || 500).json({
    status: 'Fail',
    message: err.message || 'Something went wrong',
  });
};
