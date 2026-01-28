// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const consentRoutes = require('./routes/consent.routes'); // ✅ Phase 4
const nfcRoutes = require('./routes/nfc.routes');         // ✅ Phase 5
const auditRoutes = require('./routes/audit.routes');

// Middleware
const { protect } = require('./middleware/auth.middleware');
const { authorizeRoles } = require('./middleware/role.middleware');

const app = express();

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json());

// =====================
// ROUTES
// =====================

// Auth Routes
app.use('/api/auth', authRoutes);

// Patient Profile Routes (Phase 3)
app.use('/api/patient', patientRoutes);

// Consent Management Routes (Phase 4)
app.use('/api/consent', consentRoutes);

// NFC Routes (Phase 5)
app.use('/api/nfc', nfcRoutes);

// Audit Routes
app.use('/api/audit', auditRoutes);

// =====================
// TEST & RBAC ROUTES
// =====================

// 🔐 JWT Protected Test Route
app.get('/api/protected', protect, (req, res) => {
  res.json({
    message: 'JWT working',
    user: req.user
  });
});

// 👤 Patient-only route
app.get(
  '/api/patient-only',
  protect,
  authorizeRoles('patient'),
  (req, res) => {
    res.json({
      message: 'Patient access granted',
      user: req.user
    });
  }
);

// 👨‍⚕️ Doctor-only route
app.get(
  '/api/doctor-only',
  protect,
  authorizeRoles('doctor'),
  (req, res) => {
    res.json({
      message: 'Doctor access granted',
      user: req.user
    });
  }
);

// 🏥 Hospital-only route
app.get(
  '/api/hospital-only',
  protect,
  authorizeRoles('hospital'),
  (req, res) => {
    res.json({
      message: 'Hospital access granted',
      user: req.user
    });
  }
);

// 🏪 Medical Shop-only route
app.get(
  '/api/medical-shop-only',
  protect,
  authorizeRoles('medical_shop'),
  (req, res) => {
    res.json({
      message: 'Medical shop access granted',
      user: req.user
    });
  }
);

// Root Test Route
app.get('/', (req, res) => {
  res.send('Unified Smart ID Backend is running 🚀');
});

module.exports = app;
