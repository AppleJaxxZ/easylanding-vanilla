const mongoose = require('mongoose');
const validator = require('validator');
const { validateDate } = require('./customValidation');
const Subscription = require('../models/subscription');
const { Schema } = mongoose;
const customDateValidator = [
  validateDate,
  'Please enter a validate date of birth in mm/dd/yyy format including the slashes.',
];

const userSchema = new Schema(
  {
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
      },
    ],

    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(
            'Email is invalid.  Please enter a valid email address.'
          );
        }
      },
    },
    dateOfBirth: {
      type: String,
      required: true,
      minlength: 10,
      maxLength: 10,
      validate: customDateValidator,
    },

    phoneNumber: {
      type: String,
      required: [true, 'User phone number required'],
      minLength: 11,
      maxLength: 11,
    },

    pinNumber: {
      type: String,
      required: true,
      minlength: 7,
      maxLength: 7,
    },

    password: {
      type: String,
      required: true,
      min: 6,
      max: 64,
    },
    stripe_customer_id: String,
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('User', userSchema);
