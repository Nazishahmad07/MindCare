const express = require('express')
const path = require('path')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const { upload } = require('../middleware/upload')
const ActivitySubmission = require('../models/ActivitySubmission')
const Activity = require('../models/Activity')
const User = require('../models/User')
const AdminLog = require('../models/AdminLog')

const router = express.Router()

// GET all activities (admin-managed + defaults)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ isActive: true })
    res.json({ activities })
  } catch {
    res.status(500).json({ message: 'Failed to fetch activities' })
  }
})

// POST submit activity proof (camera upload)
router.post('/submit', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    const { activityId, activityTitle, activityType, mood } = req.body

    // Disk uploads are unavailable on Vercel. Cloudinary gives uploaded
    // files a permanent URL and must be configured for this feature.
    if (req.file?.buffer) {
      return res.status(503).json({
        message: 'Media uploads are not configured. Add Cloudinary credentials to the backend environment variables.'
      })
    }

    let mediaUrl = null
    let mediaPublicId = null
    let mediaType = null

    if (req.file) {
      // Cloudinary upload
      if (req.file.path && req.file.path.startsWith('http')) {
        mediaUrl = req.file.path
        mediaPublicId = req.file.filename
      } else {
        // Local storage fallback
        mediaUrl = `/uploads/${req.file.filename}`
      }
      mediaType = req.file.mimetype?.startsWith('video') ? 'video' : 'image'
    }

    const submission = await ActivitySubmission.create({
      userId: req.userId,
      activityId,
      activityTitle,
      activityType,
      mediaUrl,
      mediaPublicId,
      mediaType,
      mood,
      status: 'pending'
    })

    res.status(201).json({ submission })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Submission failed' })
  }
})

// GET user's submissions
router.get('/my-submissions', authMiddleware, async (req, res) => {
  try {
    const submissions = await ActivitySubmission.find({ userId: req.userId })
      .sort({ submittedAt: -1 })
    res.json({ submissions })
  } catch {
    res.status(500).json({ message: 'Failed to fetch submissions' })
  }
})

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// GET all submissions (admin)
router.get('/admin/submissions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const submissions = await ActivitySubmission.find()
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 })
    res.json({ submissions })
  } catch {
    res.status(500).json({ message: 'Failed to fetch submissions' })
  }
})

// PATCH approve/reject submission (admin)
router.patch('/admin/submissions/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, adminFeedback } = req.body
    const submission = await ActivitySubmission.findById(req.params.id).populate('userId', 'name email')
    if (!submission) return res.status(404).json({ message: 'Submission not found' })

    submission.status = status
    submission.adminFeedback = adminFeedback || ''

    if (status === 'approved') {
      const points = 10
      submission.pointsAwarded = points
      await User.findByIdAndUpdate(submission.userId._id, { $inc: { points } })

      // Badge logic
      const user = await User.findById(submission.userId._id)
      const totalApproved = await ActivitySubmission.countDocuments({ userId: submission.userId._id, status: 'approved' })
      const badges = []
      if (totalApproved >= 1 && !user.badges.includes('first_activity')) badges.push('first_activity')
      if (totalApproved >= 5 && !user.badges.includes('active_user')) badges.push('active_user')
      if (totalApproved >= 10 && !user.badges.includes('wellness_champion')) badges.push('wellness_champion')
      if (badges.length) await User.findByIdAndUpdate(submission.userId._id, { $push: { badges: { $each: badges } } })
    }

    await submission.save()

    await AdminLog.create({
      adminId: req.userId,
      action: `submission_${status}`,
      targetType: 'submission',
      targetId: submission._id,
      details: `Activity "${submission.activityTitle}" ${status} for ${submission.userId?.name}`
    })

    res.json({ submission })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Update failed' })
  }
})

// POST create activity (admin)
router.post('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const activity = await Activity.create({ ...req.body, createdBy: req.userId })
    res.status(201).json({ activity })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create activity' })
  }
})

// PATCH update activity (admin)
router.patch('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ activity })
  } catch {
    res.status(500).json({ message: 'Update failed' })
  }
})

// DELETE activity (admin)
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Activity.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Delete failed' })
  }
})

module.exports = router
