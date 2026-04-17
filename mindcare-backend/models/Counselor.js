const mongoose = require('mongoose')

const counselorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  specialization: { type: String, enum: ['Anxiety', 'Depression', 'Stress', 'Trauma', 'Relationships', 'General'], default: 'General' },
  bio: { type: String, maxlength: 500 },
  avatar: { type: String, default: '' },
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  availableSlots: [{
    date: String,       // 'YYYY-MM-DD'
    time: String,       // 'HH:MM'
    isBooked: { type: Boolean, default: false }
  }],
  sessionDuration: { type: Number, default: 50 }, // minutes
  sessionFee: { type: Number, default: 0 },
  languages: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Counselor', counselorSchema)
