const mongoose = require('mongoose')

/**
 * Mental Health Test Results
 * Stores GAD-7 (Anxiety) and PHQ-9 (Depression) results
 */
const testResultSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testType: { type: String, enum: ['GAD-7', 'PHQ-9'], required: true },
  answers:  [{ question: String, score: Number }], // individual question scores
  totalScore: { type: Number, required: true },
  severity: {
    type: String,
    enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe'],
    required: true
  },
  recommendation: { type: String }, // auto-generated based on score
  takenAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('TestResult', testResultSchema)
