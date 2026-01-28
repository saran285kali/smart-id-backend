const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    actorRole: {
      type: String,
      required: true
    },

    action: {
      type: String,
      required: true
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },

    resource: {
      type: String
    },

    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
