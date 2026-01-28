const AuditLog = require('../models/AuditLog');

exports.getMyAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ actor: req.user._id })
      .populate('patient', 'fullName')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching audit logs'
    });
  }
};
