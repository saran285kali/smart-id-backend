const express = require('express');
const router = express.Router();

const {
  linkNfcToPatient,
  getPatientByNfc
} = require('../controllers/nfc.controller');

const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// 🪪 Patient links NFC card to self
router.post(
  '/link',
  protect,
  authorizeRoles('patient'),
  linkNfcToPatient
);

// 🏥 Doctor / Hospital scans NFC (consent enforced)
router.get(
  '/scan/:nfcUuid',
  protect,
  authorizeRoles('doctor', 'hospital'),
  getPatientByNfc
);

module.exports = router;
