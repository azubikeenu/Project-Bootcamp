const catchAsync = require('./asynchandler');
const uuid = require('uuid').v4;
const { ErrorResponse } = require('../utils');
const path = require('path');
const { StatusCodes } = require('http-status-codes');
module.exports = catchAsync((req, res, next) => {
  if (!req.files)
    return next(
      new ErrorResponse(
        `Please choose a file to upload`,
        StatusCodes.BAD_REQUEST
      )
    );

  const { file } = req.files;
  if (!file.mimetype.startsWith('image')) {
    return next(
      new ErrorResponse('Please upload an image file', StatusCodes.BAD_REQUEST)
    );
  }
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(
      new ErrorResponse(
        `File size must be less than 1MB`,
        StatusCodes.BAD_REQUEST
      )
    );
  }


 req.fileName = `photo_${uuid()}${path.parse(file.name).ext}`;
  // upload the file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${req.fileName}`, async (err) => {
    if (err) {
      console.log(err);
      return next(
        new ErrorResponse(
          `Something went wrong in uploading your file`,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  });
  next();
});
