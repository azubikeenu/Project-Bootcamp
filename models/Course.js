const { Schema, model } = require('mongoose');
const { ErrorResponse } = require('../utils');
const { StatusCodes } = require('http-status-codes');
const courseSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    trim: true,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    trim: true,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    trim: true,
    required: [true, 'Please add a minumum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarhipsAvailable: {
    type: Boolean,
    default: false,
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

courseSchema.statics.calculateAverageCost = async function (bootcampId) {
  const stats = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);
  // save to the database
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(stats[0].averageCost / 10) * 10,
    });
  } catch (err) {
    throw new ErrorResponse(err.message, 500);
  }
};

courseSchema.post('save', function () {
  this.constructor.calculateAverageCost(this.bootcamp);
});

courseSchema.pre('remove', function () {
  this.constructor.calculateAverageCost(this.bootcamp);
});

courseSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery());
  if (!this.r) {
    return next(
      new ErrorResponse(
        'No course found with that id in the db',
        StatusCodes.NOT_FOUND
      )
    );
  }
  next();
});

courseSchema.post(/^findOneAnd/, async function (doc, next) {
  //this.findOne(); doesnt work here because data has been updated
  await this.r.constructor.calculateAverageCost(this.r.bootcamp);
});

module.exports = model('Course', courseSchema);
