const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🎯' },
  type: { type: String, enum: ['breathing', 'journal', 'physical', 'creative', 'grounding', 'rest', 'comfort', 'task'], default: 'task' },
  mood: { type: String, enum: ['happy', 'sad', 'angry', 'anxious', 'tired', 'all'], default: 'all' },
  points: { type: Number, default: 10 },
  requiresProof: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Activity', activitySchema)
