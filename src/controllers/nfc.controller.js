const Patient = require('../models/Patient');
const Consent = require('../models/Consent');
const { logAudit } = require('../utils/auditLogger');


//
// 🔗 LINK NFC UUID TO PATIENT (Patient only)
//
exports.linkNfcToPatient = async (req, res) => {
  try {
    const { nfcUuid } = req.body;

    if (!nfcUuid) {
      return res.status(400).json({ message: 'NFC UUID is required' });
    }

    // Check if NFC already linked
    const existing = await Patient.findOne({ nfcUuid });
    if (existing) {
      return res.status(400).json({
        message: 'NFC card already linked to another patient'
      });
    }

    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      { nfcUuid },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found'
      });
    }

    res.json({
      message: 'NFC card linked successfully',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while linking NFC'
    });
  }
};

//
// 📡 SCAN NFC CARD WITH CONSENT CHECK (Doctor / Hospital)
//
exports.getPatientByNfc = async (req, res) => {
  try {
    const { nfcUuid } = req.params;

    // Find patient
    const patient = await Patient.findOne({ nfcUuid })
      .populate('user', 'name username role');

    if (!patient) {
      return res.status(404).json({
        message: 'Patient not found for this NFC card'
      });
    }

    // Check valid consent
    const consent = await Consent.findOne({
      patient: patient._id,
      requester: req.user._id,
      status: 'approved',
      validTill: { $gt: new Date() }
    });

    if (!consent) {
      return res.status(403).json({
        message: 'Access denied: valid consent not found'
      });
    }

    await logAudit({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'NFC_SCAN_PATIENT',
      patient: patient._id,
      resource: 'NFC_SCAN',
      ipAddress: req.ip
    });

    res.json({
      message: 'Access granted via NFC scan',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error during NFC scan'
    });
  }
};
