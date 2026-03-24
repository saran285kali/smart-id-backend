import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    // 🔗 Link to User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    // 🪪 NFC Card ID (Hardware Integration)
    nfcId: {
      type: String,
      required: true,
      unique: true
    },

    // 👆 Fingerprint Template ID (Hardware Integration)
    fingerprintId: {
      type: Number,
      required: true,
      unique: true
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

export default mongoose.model('Patient', patientSchema);
