const express = require('express')
const authMiddleware = require('../middleware/auth')
const ChatMessage = require('../models/ChatMessage')

const router = express.Router()

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die', 'self harm', 'hurt myself']

router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message, mood } = req.body
    const isCrisis = CRISIS_KEYWORDS.some(kw => message.toLowerCase().includes(kw))

    await ChatMessage.create({ userId: req.userId, message, mood, isCrisis })

    res.json({ saved: true, isCrisis })
  } catch {
    res.status(500).json({ message: 'Failed to save message' })
  }
})

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ userId: req.userId })
      .sort({ timestamp: -1 }).limit(50)
    res.json({ messages })
  } catch {
    res.status(500).json({ message: 'Failed to fetch history' })
  }
})

module.exports = router
