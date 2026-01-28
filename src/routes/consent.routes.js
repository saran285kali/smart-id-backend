const express = require('express');
const router = express.Router();

const {
  requestConsent,
  getMyConsentRequests,
  respondToConsent,
  revokeConsent
} = require('../controllers/consent.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// 🧑‍⚕️ / 🏥 Request consent (Doctor / Hospital)
router.post(
  '/request',
  protect,
  authorizeRoles('doctor', 'hospital'),
  requestConsent
);

// 👤 View my consent requests (Patient)
router.get(
  '/my',
  protect,
  authorizeRoles('patient'),
  getMyConsentRequests
);

// 👤 Approve / Reject consent (Patient)
router.post(
  '/respond',
  protect,
  authorizeRoles('patient'),
  respondToConsent
);

// 👤 Revoke consent (Patient)
router.post(
  '/revoke',
  protect,
  authorizeRoles('patient'),
  revokeConsent
);

module.exports = router;
