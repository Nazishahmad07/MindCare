const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  date: { type: String, required: true },   // 'YYYY-MM-DD'
  time: { type: String, required: true },   // 'HH:MM'
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  notes: { type: String, maxlength: 500 },
  adminFeedback: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)
