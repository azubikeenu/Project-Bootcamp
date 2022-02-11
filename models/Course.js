const { Schema, model } = require('mongoose');
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
});

module.exports = model('Course', courseSchema);
