const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  date: { type: String, required: true },   // 'YYYY-MM-DD'
  time: { type: String, required: true },   // 'HH:MM'
  slotKey: { type: String },
  userSlotKey: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  notes: { type: String, maxlength: 500 },
  adminFeedback: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Enforces one active reservation per counselor/date/time even if two requests
// pass the availability check at the same time. Cancelled bookings release it.
bookingSchema.index({ slotKey: 1 }, { unique: true, sparse: true })
bookingSchema.index({ userSlotKey: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Booking', bookingSchema)
