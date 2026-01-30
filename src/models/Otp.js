const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['login', 'medical_access'],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Otp', otpSchema);
