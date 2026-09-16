const express = require('express')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const TestResult = require('../models/TestResult')
const User = require('../models/User')

const router = express.Router()

// ─── SCORING LOGIC ────────────────────────────────────────────────────────────

/**
 * GAD-7: Generalized Anxiety Disorder (7 questions, 0-3 each, max 21)
 * 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-21: Severe
 */
function scoreGAD7(total) {
  if (total <= 4)  return { severity: 'minimal',  recommendation: 'Your anxiety levels appear minimal. Keep practicing self-care and mindfulness.' }
  if (total <= 9)  return { severity: 'mild',      recommendation: 'Mild anxiety detected. Try breathing exercises, journaling, and regular sleep.' }
  if (total <= 14) return { severity: 'moderate',  recommendation: 'Moderate anxiety. Consider speaking with a counselor. Therapy can be very effective.' }
  return             { severity: 'severe',     recommendation: 'Severe anxiety detected. Please book a session with a counselor or contact a helpline immediately.' }
}

/**
 * PHQ-9: Patient Health Questionnaire (9 questions, 0-3 each, max 27)
 * 0-4: Minimal, 5-9: Mild, 10-14: Moderate, 15-19: Moderately Severe, 20-27: Severe
 */
function scorePHQ9(total) {
  if (total <= 4)  return { severity: 'minimal',           recommendation: 'Minimal depression symptoms. Maintain healthy habits and social connections.' }
  if (total <= 9)  return { severity: 'mild',              recommendation: 'Mild depression. Regular exercise, sleep, and social support can help significantly.' }
  if (total <= 14) return { severity: 'moderate',          recommendation: 'Moderate depression. Counseling is recommended. You don\'t have to face this alone.' }
  if (total <= 19) return { severity: 'moderately_severe', recommendation: 'Moderately severe depression. Please book a counselor session as soon as possible.' }
  return             { severity: 'severe',             recommendation: 'Severe depression detected. Please seek professional help immediately. You matter.' }
}

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

// POST submit test result
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { testType, answers } = req.body

    if (!['GAD-7', 'PHQ-9'].includes(testType)) {
      return res.status(400).json({ message: 'Invalid test type. Must be GAD-7 or PHQ-9' })
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' })
    }

    const totalScore = answers.reduce((sum, a) => sum + (Number(a.score) || 0), 0)
    const { severity, recommendation } = testType === 'GAD-7'
      ? scoreGAD7(totalScore)
      : scorePHQ9(totalScore)

    const result = await TestResult.create({
      userId: req.userId,
      testType,
      answers,
      totalScore,
      severity,
      recommendation
    })

    // Update user risk level based on test result
    if (['severe', 'moderately_severe'].includes(severity)) {
      await User.findByIdAndUpdate(req.userId, { riskLevel: 'high' })
    } else if (severity === 'moderate') {
      await User.findByIdAndUpdate(req.userId, { riskLevel: 'medium' })
    }

    res.status(201).json({ result })
  } catch (err) {
    console.error('Test submit error:', err)
    res.status(500).json({ message: err.message || 'Failed to save test result' })
  }
})

// GET user's test history
router.get('/my-results', authMiddleware, async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.userId })
      .sort({ takenAt: -1 })
      .limit(20)
    res.json({ results })
  } catch {
    res.status(500).json({ message: 'Failed to fetch results' })
  }
})

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET all test results (admin)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { testType, severity } = req.query
    const filter = {}
    if (testType) filter.testType = testType
    if (severity) filter.severity = severity

    const results = await TestResult.find(filter)
      .populate('userId', 'name email')
      .sort({ takenAt: -1 })
      .limit(100)
    res.json({ results })
  } catch {
    res.status(500).json({ message: 'Failed to fetch test results' })
  }
})

// GET test analytics (admin)
router.get('/admin/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [gad7Stats, phq9Stats, recentSevere] = await Promise.all([
      TestResult.aggregate([
        { $match: { testType: 'GAD-7' } },
        { $group: { _id: '$severity', count: { $sum: 1 }, avgScore: { $avg: '$totalScore' } } }
      ]),
      TestResult.aggregate([
        { $match: { testType: 'PHQ-9' } },
        { $group: { _id: '$severity', count: { $sum: 1 }, avgScore: { $avg: '$totalScore' } } }
      ]),
      TestResult.find({ severity: { $in: ['severe', 'moderately_severe'] } })
        .populate('userId', 'name email')
        .sort({ takenAt: -1 })
        .limit(10)
    ])
    res.json({ gad7Stats, phq9Stats, recentSevere })
  } catch {
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
})

module.exports = router
