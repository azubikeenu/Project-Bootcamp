const { StatusCodes } = require('http-status-codes');
const { Bootcamp } = require('../models');
const { ErrorResponse, geocoder } = require('../utils');
const { asyncHandler } = require('../middlewares');

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
    const bootcamps = await Bootcamp.find();
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
      return res.status(StatusCodes.NOT_FOUND).json({
        status: 'Fail',
        message: `No bootcamp found with id ${req.params.id}`,
      });
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
   * @route PUT /api/v1/bootcamps/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static deleteBootCamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp)
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'Fail',
        message: `No bootcamp found with id ${req.params.id}`,
      });
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
    // calculate the radios in radians ==> divide distance by radius of the earth(in miles[3963.1676] or km[6378.09999805])
    const radius = distance / 3963.1676;

    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res
      .status(StatusCodes.OK)
      .json({
        status: 'Success',
        data: { count: bootcamps.length, bootcamps },
      });
  });
};
