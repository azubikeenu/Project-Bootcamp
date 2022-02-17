const { StatusCodes } = require('http-status-codes');
const { Bootcamp } = require('../models');
const { ErrorResponse, geocoder, QueryBuilder } = require('../utils');
const { asyncHandler } = require('../middlewares');
const path = require('path');

module.exports = class BootCampController {
  /**
   * @description Get all bootcamps
   * @route GET /api/v1/bootcamps
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getBootCamps = asyncHandler(async (req, res, next) => {
    const { query } = new QueryBuilder(
      Bootcamp.find().populate('courses'),
      req.query
    )
      .filter()
      .select()
      .sort()
      .paginate();
    const bootcamps = await query;
    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { count: bootcamps.length, bootcamps },
    });
  });

  /**
   * @description Get a single bootcamp
   * @route GET /api/v1/bootcamps/:id
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getBootCamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp)
      return next(
        new ErrorResponse(
          `No bootcamp found with id ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { bootcamp },
    });
  });

  /**
   * @description Create a new bootcamo
   * @route POST /api/v1/bootcamps
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(StatusCodes.CREATED).json({ status: 'Success', data: bootcamp });
  });

  /**
   * @description Update existing bootcamp
   * @route PUT /api/v1/bootcamps/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bootcamp)
      return next(
        new ErrorResponse(
          `No bootcamp found with id ${req.params.id}`,
          StatusCodes.NOT_FOUND
        )
      );
    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { bootcamp },
    });
  });

  /**
   * @description Delete existing bootcamp
   * @route DELETE /api/v1/bootcamps/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static deleteBootCamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp)
      return next(
        new ErrorResponse(
          `No bootcamp found with id ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    bootcamp.remove();
    res.status(StatusCodes.NO_CONTENT).json({ status: 'Success', data: {} });
  });

  /**
   * @description Get bootcamp wihin a radius
   * @route PUT /api/v1/bootcamps/radius/:zipcode/:distance in miles
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getBootCampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;
    // get lat and long from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
    // calculate the radius in radians ==> divide distance by radius of the earth(in miles[3963.1676] or km[6378.09999805])
    const radius = distance / 3963.1676;

    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { count: bootcamps.length, bootcamps },
    });
  });

  /**
   * @description Upload photo for bootcamp
   * @route PUT /api/v1/bootcamps/:id/photo
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp)
      return next(
        new ErrorResponse(
          `No bootcamp found with id ${req.params.id}`,
          StatusCodes.BAD_REQUEST
        )
      );
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
        new ErrorResponse(
          'Please upload an image file',
          StatusCodes.BAD_REQUEST
        )
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

    //Create a unique file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // upload the file
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
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

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    return res
      .status(StatusCodes.OK)
      .json({ status: 'Success', data: file.name });
  });
};
