const { StatusCodes } = require('http-status-codes');
const { Bootcamp } = require('../models');
const { findByIdAndDelete } = require('../models/Bootcamp');

module.exports = class BootCampController {
  /**
   * @description Get all bootcamps
   * @route GET /api/v1/bootcamps
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getBootCamps = async (req, res, next) => {
    try {
      const bootcamps = await Bootcamp.find();
      res.status(StatusCodes.OK).json({
        status: 'Success',
        data: { count: bootcamps.length, bootcamps },
      });
    } catch (ex) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ status: 'Error', message: ex.message });
    }
  };

  /**
   * @description Get a single bootcamp
   * @route GET /api/v1/bootcamps/:id
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getBootCamp = async (req, res, next) => {
    try {
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
    } catch (ex) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: 'Error', message: ex.message });
    }
  };

  /**
   * @description Create a new bootcamo
   * @route POST /api/v1/bootcamps
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static createBootcamp = async (req, res, next) => {
    try {
      const bootcamp = await Bootcamp.create(req.body);
      res
        .status(StatusCodes.CREATED)
        .json({ status: 'Success', data: bootcamp });
    } catch (ex) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: 'Error', message: ex.message });
    }
  };

  /**
   * @description Update existing bootcamp
   * @route PUT /api/v1/bootcamps/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static updateBootcamp = async (req, res, next) => {
    try {
      const bootcamp = await Bootcamp.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!bootcamp)
        return res.status(StatusCodes.NOT_FOUND).json({
          status: 'Fail',
          message: `No bootcamp found with id ${req.params.id}`,
        });

      res.status(StatusCodes.OK).json({
        status: 'Success',
        data: { bootcamp },
      });
    } catch (ex) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: 'Error', message: ex.message });
    }
  };

  /**
   * @description Delete existing bootcamp
   * @route PUT /api/v1/bootcamps/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static deleteBootCamp = async (req, res, next) => {
    try {
      const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
      if (!bootcamp)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            status: 'Fail',
            message: `No bootcamp found with id ${req.params.id}`,
          });
      res.status(StatusCodes.NO_CONTENT).json({ status: 'Success', data: {} });
    } catch (ex) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: 'Error', message: ex.message });
    }
  };
};
