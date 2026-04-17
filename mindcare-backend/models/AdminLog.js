const mongoose = require('mongoose')

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  targetType: { type: String, enum: ['user', 'booking', 'activity', 'submission', 'counselor'] },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('AdminLog', adminLogSchema)
