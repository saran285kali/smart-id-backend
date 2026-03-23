import express from "express";
const router = express.Router();

let hardwareStatus = {
  nfc: "offline",
  gsm: "offline",
  pi: "offline",
  lastUpdated: null
};

// 🔹 Pi updates this
router.post("/update-hardware", (req, res) => {
  const { nfc, gsm } = req.body;

  hardwareStatus = {
    nfc,
    gsm,
    pi: "online",
    lastUpdated: Date.now()
  };

  res.json({ success: true });
});

// 🔹 Frontend fetches this
router.get("/stats", async (req, res) => {
  const now = Date.now();

  // If Pi not updated for 10 sec → offline
  if (!hardwareStatus.lastUpdated || now - hardwareStatus.lastUpdated > 10000) {
    hardwareStatus.pi = "offline";
    hardwareStatus.nfc = "offline";
    hardwareStatus.gsm = "offline";
  }

  res.json({
    hardware: hardwareStatus,
    latency: {
      nfc: Math.floor(Math.random() * 20) + 5,
      db: Math.floor(Math.random() * 50) + 20,
      gsm: Math.floor(Math.random() * 30) + 10
    }
  });
});

export default router;
