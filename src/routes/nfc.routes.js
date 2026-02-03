const express = require("express");
const router = express.Router();
const { getPatientByNfc } = require("../controllers/nfc.controller");
const { protect } = require("../middleware/auth.middleware");

// 🏥 Scan NFC (Simplified/Auth version for demo)
router.get("/patient/:nfcId", protect, getPatientByNfc);

module.exports = router;
