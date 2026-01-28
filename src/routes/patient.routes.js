const express = require('express');
const router = express.Router();
const { logAudit } = require('../utils/auditLogger');

const {
  createPatientProfile,
  getMyPatientProfile,
  updateMyPatientProfile
} = require('../controllers/patient.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { checkConsent } = require('../middleware/consent.middleware'); // ✅ NEW

const Patient = require('../models/Patient');

// ===============================
// PATIENT SELF-SERVICE ROUTES
// ===============================

// 🟢 Create patient profile (Patient only)
router.post(
  '/profile',
  protect,
  authorizeRoles('patient'),
  createPatientProfile
);

// 🔵 Get own patient profile (Patient only)
router.get(
  '/profile',
  protect,
  authorizeRoles('patient'),
  getMyPatientProfile
);

// 🟡 Update own patient profile (Patient only)
router.put(
  '/profile',
  protect,
  authorizeRoles('patient'),
  updateMyPatientProfile
);

// ===============================
// DOCTOR / HOSPITAL ACCESS (WITH CONSENT)
// ===============================

// 🧑‍⚕️ / 🏥 View patient profile with valid consent
router.get(
  '/:patientId/view',
  protect,
  authorizeRoles('doctor', 'hospital'),
  checkConsent,
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.patientId)
        .populate('user', 'name email role');

      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      await logAudit({
        actor: req.user._id,
        actorRole: req.user.role,
        action: 'VIEW_PATIENT_PROFILE',
        patient: patient._id,
        resource: 'PATIENT_PROFILE',
        ipAddress: req.ip
      });

      res.json(patient);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Server error while fetching patient profile'
      });
    }
  }
);

module.exports = router;
