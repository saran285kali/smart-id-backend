import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import your custom auth routes (with the hardcoded login)
import authRoutes from "./routes/authRoutes.js";

// Original hardware/DB routes
import patientRoutes from "./src/routes/patient.routes.js";
import consentRoutes from "./src/routes/consent.routes.js";
import nfcRoutes from "./src/routes/nfc.routes.js";
import auditRoutes from "./src/routes/audit.routes.js";
import otpRoutes from "./src/routes/otpRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// RE-ESTABLISH DB (Wait for Mongo Atlas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log("Atlas Connection Error:", err));

/* ===================== */
/* ROUTES (EXACT SPEC)   */
/* ===================== */

// Primary Auth
app.use("/api/auth", authRoutes);

// Other API Endpoints
app.use('/api/patient', patientRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/nfc', nfcRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/otp', otpRoutes);

app.get("/", (req, res) => {
  res.send("Smart-ID Unified Backend Running 🚀");
});

/* CREATE SERVER */
const server = http.createServer(app);

/* SOCKET.IO SETUP (EXACT SPEC) */
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  transports: ["polling", "websocket"],
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected via Socket.io:", socket.id);
  
  // (NFC Hardware events logic)
  socket.on("nfc_uid", (data) => {
    io.emit("nfc_scanned", data);
  });
});

/* START SERVER */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server (with WebSockets) running on port ${PORT}`);
});
