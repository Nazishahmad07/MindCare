const express = require('express')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const User = require('../models/User')
const MoodLog = require('../models/Mood')
const Booking = require('../models/Booking')
const ActivitySubmission = require('../models/ActivitySubmission')
const AdminLog = require('../models/AdminLog')
const ChatMessage = require('../models/ChatMessage')

const router = express.Router()

// GET dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalUsers, totalBookings, pendingBookings, totalSubmissions, pendingSubmissions, crisisMessages] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      ActivitySubmission.countDocuments(),
      ActivitySubmission.countDocuments({ status: 'pending' }),
      ChatMessage.countDocuments({ isCrisis: true }),
    ])

    res.json({ totalUsers, totalBookings, pendingBookings, totalSubmissions, pendingSubmissions, crisisMessages })
  } catch {
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// GET all users with filters
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { mood, riskLevel, search } = req.query
    const filter = { role: 'user' }
    if (mood) filter.currentMood = mood
    if (riskLevel) filter.riskLevel = riskLevel
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({ users })
  } catch {
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// GET user activity history
router.get('/users/:id/history', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [user, moodLogs, submissions, bookings] = await Promise.all([
      User.findById(req.params.id).select('-password'),
      MoodLog.find({ userId: req.params.id }).sort({ loggedAt: -1 }).limit(30),
      ActivitySubmission.find({ userId: req.params.id }).sort({ submittedAt: -1 }).limit(20),
      Booking.find({ userId: req.params.id }).populate('counselorId', 'name').sort({ createdAt: -1 }).limit(10),
    ])
    res.json({ user, moodLogs, submissions, bookings })
  } catch {
    res.status(500).json({ message: 'Failed to fetch user history' })
  }
})

// GET mood analytics
router.get('/analytics/moods', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Mood distribution
    const distribution = await MoodLog.aggregate([
      { $group: { _id: '$mood', count: { $sum: 1 } } }
    ])

    // Weekly trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weeklyTrend = await MoodLog.aggregate([
      { $match: { loggedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
            mood: '$mood'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])

    // High risk users
    const highRiskUsers = await User.find({ riskLevel: 'high' })
      .select('name email currentMood createdAt')
      .limit(10)

    // Mood frequency per user (top negative moods)
    const negativeMoodUsers = await MoodLog.aggregate([
      { $match: { mood: { $in: ['sad', 'angry', 'anxious'] } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, moods: { $push: '$mood' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { 'user.name': 1, 'user.email': 1, count: 1, moods: 1 } }
    ])

    res.json({ distribution, weeklyTrend, highRiskUsers, negativeMoodUsers })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
})

// GET admin logs
router.get('/logs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .populate('adminId', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ logs })
  } catch {
    res.status(500).json({ message: 'Failed to fetch logs' })
  }
})

// PATCH update user risk level (admin)
router.patch('/users/:id/risk', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { riskLevel } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { riskLevel }, { new: true }).select('-password')

    await AdminLog.create({
      adminId: req.userId,
      action: 'risk_level_updated',
      targetType: 'user',
      targetId: user._id,
      details: `Risk level set to ${riskLevel} for ${user.name}`
    })

    res.json({ user })
  } catch {
    res.status(500).json({ message: 'Update failed' })
  }
})

module.exports = router
