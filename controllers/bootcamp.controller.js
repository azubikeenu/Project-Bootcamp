const { StatusCodes } = require('http-status-codes');

module.exports = class BootCampController {
  /**
   * @description Get all bootcamps
   * @route GET /api/v1/bootcamps
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getBootCamps = (req, res, next) => {
    res
      .status(StatusCodes.OK)
      .json({ status: 'Success', data: { message: 'Showing all bootcamps' } });
  };

  /**
   * @description Get a single bootcamp
   * @route GET /api/v1/bootcamps/:id
   * @access public
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static getBootCamp = (req, res, next) => {
    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { message: `Retreiving bootcamp ${req.params.id}` },
    });
  };

  /**
   * @description Create a new bootcamo
   * @route POST /api/v1/bootcamps
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static createBootcamp = (req, res, next) => {
    res
      .status(StatusCodes.CREATED)
      .json({ status: 'Success', data: { message: 'Successfully created' } });
  };

  /**
   * @description Update existing bootcamp
   * @route PUT /api/v1/bootcamps/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static updateBootcamp = (req, res, next) => {
    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { message: `Updating bootcamp ${req.params.id}` },
    });
  };

  /**
   * @description Delete existing bootcamp
   * @route PUT /api/v1/bootcamps/:id
   * @access private
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  static deleteBootCamp = (req, res, next) => {
    res.status(StatusCodes.OK).json({
      status: 'Success',
      data: { message: `Deleted bootcamp ${req.params.id}` },
    });
  };
};
