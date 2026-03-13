import Otp from "../models/Otp.js";
import { sendSMS } from "../utils/sendSMS.js";
import jwt from "jsonwebtoken";
import LoginAudit from "../models/LoginAudit.js";

// SEND OTP
export const sendOtp = async (req, res) => {
    try {
        const { phone, purpose = 'login' } = req.body;

        // Additional Phone-Level Protection (Security)
        const recentRequests = await LoginAudit.countDocuments({
            phone,
            status: "OTP_SENT",
            createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }
        });

        if (recentRequests >= 3) {
            return res.status(429).json({
                error: "Too many OTP requests for this number. Try again in 10 minutes."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        // Save to Database
        await Otp.findOneAndUpdate(
            { phone, purpose },
            { otp, expiresAt: expires, attempts: 0, createdAt: new Date() },
            { upsert: true }
        );

        // Send SMS via Fast2SMS
        await sendSMS(phone, otp);

        // Record Audit Event
        await LoginAudit.create({
            phone,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            status: "OTP_SENT"
        });

        // Response
        res.json({
            success: true,
            message: "OTP sent",
            otp // remove in production
        });

    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({
            error: "SMS sending failed"
        });
    }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
    const { phone, otp, purpose = 'login' } = req.body;

    try {
        const record = await Otp.findOne({ phone, purpose });

        if (!record) {
            return res.status(400).json({ error: "OTP not found" });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ error: "OTP expired" });
        }

        // Limit Wrong OTP Attempts
        if (record.otp !== otp) {
            record.attempts += 1;
            await record.save();

            if (record.attempts > 3) {
                await Otp.deleteOne({ phone, purpose });

                await LoginAudit.create({
                    phone,
                    ip: req.ip,
                    userAgent: req.headers["user-agent"],
                    status: "LOGIN_FAILED"
                });

                return res.status(403).json({
                    error: "Too many incorrect attempts. Token cleared."
                });
            }

            return res.status(400).json({ error: "Invalid OTP" });
        }

        await Otp.deleteOne({ phone, purpose });

        // Record Audit Event on Success
        await LoginAudit.create({
            phone,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            status: "LOGIN_SUCCESS"
        });

        const token = jwt.sign(
            { phone },
            process.env.JWT_SECRET,
            { expiresIn: "10d" } // Increased for convenience
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
