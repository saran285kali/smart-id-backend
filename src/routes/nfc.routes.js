import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { 
    handleNfcScan, 
    verifyFingerprint, 
    generateHardwareOtp,
    getPatientByNfc 
} from "../controllers/nfc.controller.js";

const router = express.Router();

// ==========================================
// 🔴 HARDWARE INTEGRATION ROUTES (Raspberry Pi)
// ==========================================

// 1️⃣ Raspberry Pi posts NFC UID
router.post("/scan", handleNfcScan);

// 2️⃣ Raspberry Pi posts Fingerprint matches
router.post("/fingerprint", verifyFingerprint);

// 3️⃣ Raspberry Pi requests OTP to send via SIM800L
router.post("/generate-otp", generateHardwareOtp);


// ==========================================
// 🔵 FRONTEND ROUTES (User/Doctor interactions)
// ==========================================

// 🏥 Scan NFC (Simplified/Auth version for demo dashboards)
router.get("/patients/nfc/:id", protect, async (req, res) => {
    try {
        console.log(`Request from user: ${req.user.id}`);

        res.json({
            id: req.params.id,
            name: "John Doe",
            age: 42,
            gender: "Male",
            condition: "Cardiology Consultation",
            time: new Date().toLocaleString()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Primary lookup route via GET
router.get("/patient/:nfcId", protect, getPatientByNfc);

export default router;
