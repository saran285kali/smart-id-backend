const mongoose = require('mongoose');
const Consent = require('../models/Consent');
const Patient = require('../models/Patient');
const { logAudit } = require('../utils/auditLogger');

const checkConsent = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      // 🔴 Log invalid ID attempt
      await logAudit({
        actor: req.user._id,
        actorRole: req.user.role,
        action: 'VIEW_PATIENT_PROFILE_DENIED',
        patient: patientId,
        resource: 'PATIENT_PROFILE',
        ipAddress: req.ip,
        reason: 'Invalid patient ID format'
      });

      return res.status(400).json({
        message: 'Invalid patient ID format'
      });
    }

    // Find patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      // 🔴 Log patient not found attempt
      await logAudit({
        actor: req.user._id,
        actorRole: req.user.role,
        action: 'VIEW_PATIENT_PROFILE_DENIED',
        patient: patientId,
        resource: 'PATIENT_PROFILE',
        ipAddress: req.ip,
        reason: 'Patient not found'
      });

      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find valid consent
    const consent = await Consent.findOne({
      patient: patientId,
      requester: req.user._id,
      status: 'approved',
      validTill: { $gt: new Date() }
    });

    if (!consent) {
      // 🔴 Log access denied (no valid consent)
      await logAudit({
        actor: req.user._id,
        actorRole: req.user.role,
        action: 'VIEW_PATIENT_PROFILE_DENIED',
        patient: patientId,
        resource: 'PATIENT_PROFILE',
        ipAddress: req.ip,
        reason: 'No valid consent found'
      });

      return res.status(403).json({
        message: 'Access denied: valid consent not found'
      });
    }

    // 🟢 Log access allowed
    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'VIEW_PATIENT_PROFILE_ALLOWED',
      patient: patientId,
      resource: 'PATIENT_PROFILE',
      ipAddress: req.ip
    });

    // Consent valid → allow access
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error during consent verification'
    });
  }
};

module.exports = { checkConsent };
