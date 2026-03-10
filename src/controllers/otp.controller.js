import Otp from '../models/Otp.js';
import { generateOTP } from '../utils/otp.js';

// SEND OTP
export const sendOtp = async (req, res) => {
  const { phone, purpose = 'login' } = req.body;

  const otp = generateOTP();

  try {
    await Otp.create({
      phone,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins
    });

    // 🚨 For prototype only (SMS will replace this)
    console.log(`OTP for ${phone} (${purpose}): ${otp}`);

    res.json({
      message: 'OTP sent successfully (check server log)'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create OTP record' });
  }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { phone, otp, purpose = 'login' } = req.body;

  try {
    const record = await Otp.findOne({
      phone,
      otp,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    record.verified = true;
    await record.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};
