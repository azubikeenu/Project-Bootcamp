const { Schema, model } = require('mongoose');
const { ErrorResponse } = require('../utils');
const { StatusCodes } = require('http-status-codes');
const reviewSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
    maxlength: 100,
  },
  text: {
    type: String,
    trim: true,
    required: [true, 'Please add a text'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'rating must be between 1 and 10'],
    max: [10, 'rating must be between 1 and 10'],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverages = async function (bootcampId) {
  // returns an array
  const stats = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        avgRating: { $avg: '$rating' },
        nRatings: { $sum: 1 },
      },
    },
  ]);
  // find the current Bootcamp and Update
  if (stats.length > 0) {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      avgRating: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      avgRating: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.pre('remove', function () {
  this.constructor.calculateAverages(this.bootcamp);
});

reviewSchema.post('save', function () {
  this.constructor.calculateAverages(this.bootcamp);
});

// update number of ratings and average ratings on review update
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // get the doc before the query executes
  this.r = await this.model.findOne(this.getQuery());
  if (!this.r) {
    return next(
      new ErrorResponse(
        'The resource is not found in the database',
        StatusCodes.NOT_FOUND
      )
    );
  }
  next();
});
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  //this.findOne(); doesnt work here because data has been updated
  await this.r.constructor.calculateAverages(this.r.bootcamp);
  console.log(this.r.bootcamp);
});

module.exports = model('Review', reviewSchema);
