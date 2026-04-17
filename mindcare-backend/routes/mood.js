const express = require('express')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')
const MoodLog = require('../models/Mood')
const {
  processMoodEntry,
  getUserMoodAnalytics,
  analyzeSentiment,
  MOOD_SCORES
} = require('../services/moodAlgorithm')

const router = express.Router()

// POST /api/mood/update — log a mood entry with full algorithm processing
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { mood, note } = req.body
    const validMoods = ['happy', 'sad', 'angry', 'anxious', 'tired']
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ message: 'Invalid mood' })
    }

    // Run algorithm: compute score, sentiment, risk
    const processed = await processMoodEntry(req.userId, mood, note || '')

    // Save mood log
    const log = await MoodLog.create({
      userId: req.userId,
      mood,
      score: processed.score,
      note: note || '',
      sentimentScore: processed.sentimentScore,
      riskLevel: processed.riskLevel
    })

    // Also push to user's moodHistory array
    await User.findByIdAndUpdate(req.userId, {
      $push: { moodHistory: { mood, timestamp: new Date() } }
    })

    res.json({
      success: true,
      score: processed.score,
      riskLevel: processed.riskLevel,
      riskReason: processed.riskReason,
      sentimentScore: processed.sentimentScore,
      logId: log._id
    })
  } catch (err) {
    console.error('Mood update error:', err)
    res.status(500).json({ message: 'Failed to update mood' })
  }
})

// GET /api/mood/analytics — full mood analytics for current user
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const analytics = await getUserMoodAnalytics(req.userId)
    res.json(analytics)
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ message: 'Failed to compute analytics' })
  }
})

// GET /api/mood/history — raw mood history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const logs = await MoodLog.find({ userId: req.userId })
      .sort({ loggedAt: -1 })
      .limit(30)
    res.json({ history: logs })
  } catch {
    res.status(500).json({ message: 'Failed to fetch mood history' })
  }
})

// POST /api/mood/analyze-text — sentiment analysis on journal/chat text
router.post('/analyze-text', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ message: 'Text is required' })
    const score = analyzeSentiment(text)
    const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'
    res.json({ score, label })
  } catch {
    res.status(500).json({ message: 'Analysis failed' })
  }
})

module.exports = router
