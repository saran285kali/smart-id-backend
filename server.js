import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import otpRoutes from "./routes/otpRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";


dotenv.config();

console.log("FAST2SMS KEY LOADED:", process.env.FAST2SMS_API_KEY ? "YES" : "NO (Check Render Env Vars)");

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", otpRoutes);
app.use("/api/patient", patientRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
