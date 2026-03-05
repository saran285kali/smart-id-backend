import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
import { otpLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
