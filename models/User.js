const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'user must have an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Must provide a valid email',
    ],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'publisher'],
      message: 'Difficulty must be one of : user or publisher',
    },
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'user must provide a password'],
    minlength: [6, 'characters must be a minimum of length 6'],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpiration: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// this allows the hashing of the password when it is saved
userSchema.pre('save', async function (next) {
  //only run when the password is modified
  if (!this.isModified('password')) return next();
  // hash the password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.getSignedJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = model('User', userSchema);
