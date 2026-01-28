const express = require('express');
const router = express.Router();

const { getMyAuditLogs } = require('../controllers/audit.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/my', protect, getMyAuditLogs);

module.exports = router;
