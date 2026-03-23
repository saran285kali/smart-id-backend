import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import original routes
import authRoutes from "./src/routes/auth.routes.js";
import patientRoutes from "./src/routes/patient.routes.js";
import consentRoutes from "./src/routes/consent.routes.js";
import nfcRoutes from "./src/routes/nfc.routes.js";
import auditRoutes from "./src/routes/audit.routes.js";
import otpRoutes from "./src/routes/otpRoutes.js";
import userRoutes from "./src/routes/user.routes.js";
import { getStats, getLogs } from "./src/controllers/user.controller.js";
import statusRoutes from "./routes/statusRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Main DB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log("DB Error:", err));

/* ===================== */
/* ROUTES                */
/* ===================== */

// Hardware & User Management Routes
app.use("/api/users", userRoutes);

// Stats & Logs
app.get("/api/stats", getStats);
app.get("/api/logs", getLogs);

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/nfc", nfcRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/status", statusRoutes);

app.get("/", (req, res) => {
  res.send("Backend running without WebSocket 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
