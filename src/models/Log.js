import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ['NFC_SCAN', 'FINGERPRINT_MATCH', 'LOGIN', 'REGISTRATION', 'HARDWARE_SCAN'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Some scans might fail or be unregistered
    },
    message: {
      type: String
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model('Log', logSchema);
