import User from '../models/User.js';
import Log from '../models/Log.js';

import Patient from '../models/Patient.js';

// @desc Create new user (Hardware & Patient Registration)
// @route POST /api/users
export const registerUser = async (req, res) => {
  const { 
    name, 
    role, 
    nfcId, 
    fingerprintId, 
    phone, 
    age, 
    gender, 
    bloodGroup, 
    address, 
    emergencyContact,
    medicalHistory,
    allergies
  } = req.body;

  try {
    // ✅ 1. Mandatory Hardware Data (Reject if missing)
    if (!fingerprintId || !nfcId) {
      return res.status(400).json({
        message: "Fingerprint and NFC are required"
      });
    }

    // ✅ 2. Prevent Duplicate Fingerprint
    const existingFingerprint = await User.findOne({ fingerprintId });
    if (existingFingerprint) {
      return res.status(400).json({
        message: "Fingerprint already registered"
      });
    }

    // ✅ 3. Prevent Duplicate NFC Card
    const existingNfc = await User.findOne({ nfcId });
    if (existingNfc) {
      return res.status(400).json({
        message: "Card already used"
      });
    }

    // ✅ 6. Atomic Registration (ALL OR NOTHING)
    // Create the User account
    const user = await User.create({
      name,
      role: role || 'Patient',
      nfcId,
      fingerprintId,
      phone
    });

    // Create the linked Patient profile
    await Patient.create({
      user: user._id,
      nfcId,
      fingerprintId,
      fullName: name,
      age,
      gender,
      bloodGroup,
      phone,
      address,
      emergencyContact,
      medicalHistory,
      allergies
    });

    // Create log for registration
    await Log.create({
      eventType: 'REGISTRATION',
      userId: user._id,
      message: `Patient ${name} registered successfully with hardware.`
    });

    // ✅ 7. Return Clean Success Response
    res.status(201).json({
      message: "Patient registered successfully"
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server Error' 
    });
  }
};

// @desc Get all users
// @route GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc Get user by NFC ID (for NFC login)
// @route GET /api/users/nfc/:nfcId
export const getUserByNfc = async (req, res) => {
  const { nfcId } = req.params;
  try {
    const user = await User.findOne({ nfcId });
    if (!user) {
      // Log failed scan attempt?
      await Log.create({
        eventType: 'NFC_SCAN',
        message: `Unknown NFC scan attempt: ${nfcId}`,
        metadata: { nfcId }
      });
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create log for successful scan
    await Log.create({
      eventType: 'NFC_SCAN',
      userId: user._id,
      message: `User ${user.name} scanned NFC card.`
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc Get Stats
// @route GET /api/stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'Patient' });
    const totalScans = await Log.countDocuments({ eventType: 'NFC_SCAN' });

    res.json({
      success: true,
      totalUsers,
      totalPatients,
      totalScans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc Get Logs
// @route GET /api/logs
export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find({}).populate('userId', 'name role').sort({ createdAt: -1 }).limit(100);
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
