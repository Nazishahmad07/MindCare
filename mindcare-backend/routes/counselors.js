const express = require('express')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const Counselor = require('../models/Counselor')
const Booking = require('../models/Booking')
const AdminLog = require('../models/AdminLog')

const router = express.Router()

// GET all counselors (public)
router.get('/', async (req, res) => {
  try {
    const counselors = await Counselor.find({ isAvailable: true }).select('-availableSlots')
    res.json({ counselors })
  } catch {
    res.status(500).json({ message: 'Failed to fetch counselors' })
  }
})

// GET single counselor with slots
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id)
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' })
    res.json({ counselor })
  } catch {
    res.status(500).json({ message: 'Failed to fetch counselor' })
  }
})

// GET available slots for a counselor on a date
router.get('/:id/slots', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query
    const counselor = await Counselor.findById(req.params.id)
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' })

    const slots = counselor.availableSlots.filter(s => s.date === date && !s.isBooked)
    res.json({ slots })
  } catch {
    res.status(500).json({ message: 'Failed to fetch slots' })
  }
})

// POST book a session
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { counselorId, date, time, notes } = req.body

    // Check for double booking
    const existing = await Booking.findOne({
      counselorId, date, time,
      status: { $in: ['pending', 'approved'] }
    })
    if (existing) return res.status(400).json({ message: 'This slot is already booked' })

    // Check user doesn't have another booking at same time
    const userConflict = await Booking.findOne({
      userId: req.userId, date, time,
      status: { $in: ['pending', 'approved'] }
    })
    if (userConflict) return res.status(400).json({ message: 'You already have a booking at this time' })

    const booking = await Booking.create({ userId: req.userId, counselorId, date, time, notes })

    // Mark slot as booked
    await Counselor.updateOne(
      { _id: counselorId, 'availableSlots.date': date, 'availableSlots.time': time },
      { $set: { 'availableSlots.$.isBooked': true } }
    )

    const populated = await Booking.findById(booking._id).populate('counselorId', 'name specialization')
    res.status(201).json({ booking: populated })
  } catch (err) {
    res.status(500).json({ message: 'Booking failed' })
  }
})

// GET user's bookings
router.get('/my/bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('counselorId', 'name specialization avatar')
      .sort({ createdAt: -1 })
    res.json({ bookings })
  } catch {
    res.status(500).json({ message: 'Failed to fetch bookings' })
  }
})

// PATCH cancel booking
router.patch('/:bookingId/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, userId: req.userId })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' })

    booking.status = 'cancelled'
    await booking.save()

    // Free up the slot
    await Counselor.updateOne(
      { _id: booking.counselorId, 'availableSlots.date': booking.date, 'availableSlots.time': booking.time },
      { $set: { 'availableSlots.$.isBooked': false } }
    )

    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Cancellation failed' })
  }
})

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// GET all bookings (admin)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('counselorId', 'name specialization')
      .sort({ createdAt: -1 })
    res.json({ bookings })
  } catch {
    res.status(500).json({ message: 'Failed to fetch bookings' })
  }
})

// PATCH approve/reject booking (admin)
router.patch('/admin/:bookingId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, adminFeedback } = req.body
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status, adminFeedback },
      { new: true }
    ).populate('userId', 'name email').populate('counselorId', 'name')

    await AdminLog.create({
      adminId: req.userId,
      action: `booking_${status}`,
      targetType: 'booking',
      targetId: booking._id,
      details: `Booking ${status} for ${booking.userId?.name}`
    })

    res.json({ booking })
  } catch {
    res.status(500).json({ message: 'Status update failed' })
  }
})

// POST add counselor (admin)
router.post('/admin/counselors', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const counselor = await Counselor.create(req.body)
    res.status(201).json({ counselor })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create counselor' })
  }
})

// PATCH update counselor (admin)
router.patch('/admin/counselors/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const counselor = await Counselor.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ counselor })
  } catch {
    res.status(500).json({ message: 'Update failed' })
  }
})

// POST add slots to counselor (admin)
router.post('/admin/counselors/:id/slots', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { slots } = req.body // [{ date, time }]
    const counselor = await Counselor.findById(req.params.id)
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' })

    counselor.availableSlots.push(...slots.map(s => ({ ...s, isBooked: false })))
    await counselor.save()
    res.json({ counselor })
  } catch {
    res.status(500).json({ message: 'Failed to add slots' })
  }
})

module.exports = router
