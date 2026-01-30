const Otp = require('../models/Otp');
const { generateOTP } = require('../utils/otp');

// SEND OTP
exports.sendOtp = async (req, res) => {
  const { phone, purpose } = req.body;

  const otp = generateOTP();

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
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  const { phone, otp, purpose } = req.body;

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
};
