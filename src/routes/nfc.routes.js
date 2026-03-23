import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import Patient from "../models/Patient.js";
import { 
    receiveNfc,
    getLatestNfc,
    verifyFingerprint, 
    generateHardwareOtp,
    getPatientByNfc 
} from "../controllers/nfc.controller.js";

const router = express.Router();

// ==========================================
// 🔴 REAL HARDWARE INTEGRATION (Raspberry Pi)
// ==========================================

// 1. RECEIVE NFC FROM HARDWARE (POST /api/nfc)
router.post("/", receiveNfc);

// 2. FETCH NFC FOR FRONTEND (GET /api/nfc)
router.get("/", getLatestNfc);

// 3. FINGERPRINT VERIFICATION
router.post("/fingerprint", verifyFingerprint);

// 4. GENERATE OTP FOR SIM800L
router.post("/generate-otp", generateHardwareOtp);

// ==========================================
// 🔵 OTHER PATIENT LOOKUP ROUTES
// ==========================================

// Dashboard Auth Scan
router.get("/patients/nfc/:id", protect, async (req, res) => {
    try {
        const patient = await Patient.findOne({ nfcUuid: req.params.id })
            .populate('user', 'name username');
            
        if (!patient) return res.status(404).json({ message: "Patient not found" });

        res.json({
            id: req.params.id,
            name: patient.fullName || "Unknown",
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            condition: "Cardiology Consultation",
            time: new Date().toLocaleString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/patient/:nfcId", protect, getPatientByNfc);

export default router;
