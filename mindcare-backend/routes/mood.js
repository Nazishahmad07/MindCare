const express = require('express')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { mood } = req.body
    const validMoods = ['happy', 'sad', 'angry', 'anxious', 'tired']
    if (!validMoods.includes(mood)) return res.status(400).json({ message: 'Invalid mood' })

    await User.findByIdAndUpdate(req.userId, {
      currentMood: mood,
      $push: { moodHistory: { mood, timestamp: new Date() } }
    })
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Failed to update mood' })
  }
})

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('moodHistory')
    res.json({ history: user?.moodHistory || [] })
  } catch {
    res.status(500).json({ message: 'Failed to fetch mood history' })
  }
})

module.exports = router
