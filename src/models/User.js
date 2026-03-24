import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true // Allow users without usernames (hardware-only patients)
    },

    email: {
      type: String,
      required: false,
      default: null,
      sparse: true
    },

    password: {
      type: String,
      required: false // Optional for hardware-only patients
    },

    role: {
      type: String,
      default: 'Patient',
      required: true
    },

    nfcId: {
      type: String,
      required: true,
      unique: true
    },

    fingerprintId: {
      type: Number,
      required: true,
      unique: true
    },

    phone: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

// 🔐 Hash password
userSchema.pre('save', async function () {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
