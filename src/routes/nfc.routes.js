const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

// 🏥 Scan NFC (Simplified/Auth version for demo)
// This matches the user's request for a protected NFC route
router.get("/patients/nfc/:id", authMiddleware, async (req, res) => {
    try {
        // The user ID/role from the token is now available in req.user
        // Note: the mock JWT I created earlier used 'userId'
        console.log(`Request from user: ${req.user.userId || req.user._id}`);

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

// Keep original for compatibility if needed, but updated to use new middleware
const { getPatientByNfc } = require("../controllers/nfc.controller");
router.get("/patient/:nfcId", authMiddleware.protect, getPatientByNfc);

module.exports = router;
