import app from "./src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

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
  }
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

  // Listen for direct WebSocket NFC scan events from Raspberry Pi
  socket.on("nfc_uid", (data) => {
    console.log("NFC UID received from Raspberry Pi:", data.uid);
    // Broadcast the scan event to all connected frontends
    io.emit("nfc_scanned", { uid: data.uid });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server (with WebSockets) running on ${PORT}`);
});
