import Patient from '../models/Patient.js';
import Otp from '../models/Otp.js';

// TEMP STORAGE FOR NFC
let latestNfc = null;

// 1. Receive NFC from Raspberry Pi
export const receiveNfc = async (req, res) => {
  const { nfcId } = req.body;

  if (!nfcId) {
    return res.status(400).json({ 
      success: false, 
      message: "nfcId is required" 
    });
  }

  latestNfc = nfcId;
  console.log("Real NFC Received from Hardware:", latestNfc);

  res.json({ 
    success: true, 
    message: "NFC received successfully",
    nfcId: latestNfc
  });
};

// 2. Fetch NFC for Frontend
export const getLatestNfc = async (req, res) => {
  const currentNfc = latestNfc;
  
  // Clear after use (Optional but requested)
  latestNfc = null;

  res.json({
    nfcId: currentNfc
  });
};

// 1️⃣ Handle NFC Card Tap (from Raspberry Pi)
export const handleNfcScan = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "NFC UID is required" });
    }

    console.log("NFC UID received:", uid);

    const patient = await Patient.findOne({ nfcUuid: uid })
      .populate('user', 'name username role');

    if (!patient) {
      return res.status(404).json({ message: "Patient not found for this NFC card" });
    }

    res.json({
      message: "Patient retrieved successfully",
      patient: {
        id: patient._id,
        name: patient.fullName,
        healthId: patient.user.username, // Using username as Smart Health ID
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup
      }
    });

  } catch (error) {
    console.error("Error during NFC scan:", error);
    res.status(500).json({ message: "NFC scan lookup failed" });
  }
};

// 2️⃣ Verify Fingerprint (from Raspberry Pi)
export const verifyFingerprint = async (req, res) => {
  try {
    const { finger_id } = req.body; // Sent by the hardware sensor

    if (finger_id === undefined) {
      return res.status(400).json({ message: "Fingerprint ID is required" });
    }

    // Backend searches for a patient with this exact fingerprint ID
    const patient = await Patient.findOne({ fingerprintId: finger_id });

    if (!patient) {
      return res.status(401).json({ message: "Fingerprint does not match any patient" });
    }

    res.json({
      message: "Fingerprint verified successfully",
      patientId: patient._id,
      patientName: patient.fullName
    });

  } catch (error) {
    console.error("Error verifying fingerprint:", error);
    res.status(500).json({ message: "Fingerprint verification failed" });
  }
};

// 3️⃣ Generate OTP for Raspberry Pi / SIM800L to send
export const generateHardwareOtp = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    // Save/Update in DB
    await Otp.findOneAndUpdate(
      { phone: patient.phone, purpose: 'hardware_auth' },
      { otp: otpCode, expiresAt: expires, attempts: 0, createdAt: new Date() },
      { upsert: true }
    );

    // Return the OTP and Phone number to the Raspberry Pi
    // The Pi will then interface with the SIM800L to physically send the SMS
    res.json({
      message: "OTP generated",
      phone: patient.phone,
      otp: otpCode 
    });

  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
};

// Keep original logic for direct GET requests if needed by frontend
export const getPatientByNfc = async (req, res) => {
  try {
    const { nfcId } = req.params;

    const patient = await Patient.findOne({ nfcUuid: nfcId })
      .populate('user', 'name username role');

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "NFC lookup failed" });
  }
};
