const mongoose = require('mongoose')

// Mood → numeric score mapping
// happy=5, tired=3, anxious=2, angry=2, sad=1
const MOOD_SCORES = { happy: 5, tired: 3, anxious: 2, angry: 2, sad: 1 }

const moodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, enum: ['happy', 'sad', 'angry', 'anxious', 'tired'], required: true },
  score: { type: Number, min: 1, max: 5 },   // 1–5 numeric score
  note: { type: String, maxlength: 500 },
  sentimentScore: { type: Number, default: 0 }, // -1 to 1 from text analysis
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  loggedAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Auto-set score from mood before save
moodLogSchema.pre('save', function (next) {
  if (!this.score) this.score = MOOD_SCORES[this.mood] || 3
  next()
})

moodLogSchema.statics.MOOD_SCORES = MOOD_SCORES

module.exports = mongoose.model('MoodLog', moodLogSchema)
