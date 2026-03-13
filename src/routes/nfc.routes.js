import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getPatientByNfc } from "../controllers/nfc.controller.js";

const router = express.Router();

// 🏥 Scan NFC (Simplified/Auth version for demo)
router.get("/patients/nfc/:id", protect, async (req, res) => {
    try {
        console.log(`Request from user: ${req.user.id}`);

        // Logic to fetch patient from DB... (Mocked for now)
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

// Primary lookup route
router.get("/patient/:nfcId", protect, getPatientByNfc);

export default router;
