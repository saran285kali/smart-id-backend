import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';

const router = express.Router();

// 🟢 Register
router.post('/register', registerUser);

// 🔵 Login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  // 🧪 Debug Hardcoded Login (as requested for testing)
  if (username === "hospital1" && password === "123456") {
    return res.json({ 
      success: true, 
      message: "Login successful (Debug mode)",
      user: { id: "debug-id", name: "Hospital Manager", role: "hospital", username: "hospital1" },
      token: "debug-token"
    });
  }
  
  // Natural Login Logic
  return loginUser(req, res, next);
});

export default router;
