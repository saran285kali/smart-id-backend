import mongoose from "mongoose";

const loginAuditSchema = new mongoose.Schema({
    phone: String,
    ip: String,
    userAgent: String,
    status: {
        type: String,
        enum: ["OTP_SENT", "OTP_FAILED", "LOGIN_SUCCESS", "LOGIN_FAILED"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("LoginAudit", loginAuditSchema);
