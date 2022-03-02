const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

userSchema.methods.matchPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    // set the password expiration
  this.resetPasswordExpiration = Date.now() + 60 * 10 * 1000;

  return token;
};

module.exports = model('User', userSchema);
