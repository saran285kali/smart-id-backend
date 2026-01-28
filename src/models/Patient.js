const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    // 🔗 Link to User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    // 🪪 NFC Card UUID (Phase 5)
    nfcUuid: {
      type: String,
      unique: true,
      sparse: true // allows patients without NFC initially
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      required: true
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },

    bloodGroup: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String
    },

    emergencyContact: {
      name: String,
      phone: String
    },

    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        notes: String
      }
    ],

    allergies: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Patient', patientSchema);
