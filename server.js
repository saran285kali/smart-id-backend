import app from "./src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import Patient from "./src/models/Patient.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["polling", "websocket"]
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected via WebSocket:", socket.id);
  
  // Optional: broadcast device status immediately upon connection if needed.
  socket.emit("device_status", {
    nfc: "connected",
    fingerprint: "ready",
    gsm: "online"
  });

  socket.emit("hardware_status", {
    nfc: "connected",
    fingerprint: "ready",
    gsm: "online",
    raspberrypi: "online"
  });

  // Listen for direct WebSocket NFC scan events from Raspberry Pi
  socket.on("nfc_uid", async (data) => {
    console.log("NFC UID received from Raspberry Pi:", data.uid);
    // Broadcast the raw scan event
    io.emit("nfc_scanned", { uid: data.uid });

    try {
      // Fetch real patient from MongoDB Atlas
      const patient = await Patient.findOne({ nfcUuid: data.uid })
        .populate('user', 'name username role');
        
      if (patient) {
        const patientData = patient.toObject();
        // Fallback prescriptions
        if (!patientData.prescriptions) {
           patientData.prescriptions = [
             { name: "Paracetamol 500mg" },
             { name: "Amoxicillin 250mg" }
           ];
        }
        
        io.emit("patient_data", patientData);
        console.log("Emitted real patient data from Atlas:", patient.fullName || patient.name);
      } else {
         console.log("Patient not found for UID:", data.uid);
      }
    } catch (err) {
      console.error("Error fetching patient from DB via WebSocket:", err);
    }
  });

  // Listen for fingerprint verification from Raspberry Pi
  socket.on("fingerprint_verified", async (data) => {
    console.log("Biometric verification received:", data);
    
    try {
      // Find patient matching both hardware hardware identifiers
      const patient = await Patient.findOne({
        nfcUuid: data.uid,
        fingerprintId: data.finger_id // Raspberry Pi sends 'finger_id'
      }).populate('user', 'name username role');

      if (!patient) {
        console.log("Access Denied: Biometric or NFC mismatch");
        io.emit("access_denied", { message: "Biometric or NFC mismatch" });
        return;
      }

      const patientData = patient.toObject();
      io.emit("patient_data", patientData);
      console.log("Multifactor Auth Success: Emitted data for", patient.fullName);
    } catch (err) {
      console.error("Biometric DB Lookup Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server (with WebSockets) running on ${process.env.PORT || 5000}`);
});
