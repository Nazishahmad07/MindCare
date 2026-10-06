const express = require('express')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const Counselor = require('../models/Counselor')
const Booking = require('../models/Booking')
const AdminLog = require('../models/AdminLog')

const router = express.Router()

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// GET all counselors
router.get('/', async (req, res) => {
  try {
    const counselors = await Counselor.find({ isAvailable: true }).select('-availableSlots')
    res.json({ counselors })
  } catch {
    res.status(500).json({ message: 'Failed to fetch counselors' })
  }
})

// ─── USER ROUTES (specific paths BEFORE /:id) ────────────────────────────────

// POST book a session
// MUST be before /:id to avoid Express matching 'book' as an ObjectId
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { counselorId, date, time, notes } = req.body

    if (!counselorId || !date || !time) {
      return res.status(400).json({ message: 'counselorId, date and time are required' })
    }

    // Validate counselorId is a real ObjectId (not a demo string like 'c1')
    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(counselorId)) {
      return res.status(400).json({ message: 'Invalid counselor. Please select a real counselor from the database.' })
    }
    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    const dateIsValid = /^\d{4}-\d{2}-\d{2}$/.test(date)
      && !Number.isNaN(parsedDate.valueOf())
      && parsedDate.toISOString().slice(0, 10) === date
    if (!dateIsValid || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      return res.status(400).json({ message: 'Date or time is invalid' })
    }

    await Booking.init()

    // Check counselor exists
    const counselor = await Counselor.findById(counselorId)
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' })
    if (!counselor.isAvailable) return res.status(409).json({ message: 'This counselor is not accepting bookings' })

    // Check for double booking on this slot
    const slotTaken = await Booking.findOne({
      counselorId, date, time,
      status: { $in: ['pending', 'approved'] }
    })
    if (slotTaken) return res.status(400).json({ message: 'This slot is already booked. Please choose another time.' })

    // Check user doesn't have a conflicting booking
    const userConflict = await Booking.findOne({
      userId: req.userId, date, time,
      status: { $in: ['pending', 'approved'] }
    })
    if (userConflict) return res.status(400).json({ message: 'You already have a booking at this time.' })

    const slotKey = `${counselorId}:${date}:${time}`
    const userSlotKey = `${req.userId}:${date}:${time}`
    let booking
    try {
      booking = await Booking.create({ userId: req.userId, counselorId, date, time, slotKey, userSlotKey, notes: notes || '' })
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'This slot was just booked. Please choose another time.' })
      }
      throw err
    }

    // Mark slot as booked if it exists in counselor's availableSlots
    await Counselor.updateOne(
      { _id: counselorId, 'availableSlots.date': date, 'availableSlots.time': time },
      { $set: { 'availableSlots.$.isBooked': true } }
    )

    const populated = await Booking.findById(booking._id)
      .populate('counselorId', 'name specialization avatar')
    res.status(201).json({ booking: populated })
  } catch (err) {
    console.error('Booking error:', err)
    res.status(500).json({ message: err.message || 'Booking failed' })
  }
})

// GET current user's bookings
// MUST be before /:id
router.get('/my/bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
      .populate('counselorId', 'name specialization avatar')
      .sort({ createdAt: -1 })
    res.json({ bookings })
  } catch (err) {
    console.error('My bookings error:', err)
    res.status(500).json({ message: 'Failed to fetch bookings' })
  }
})

// PATCH cancel a booking
// MUST be before /:id
router.patch('/cancel/:bookingId', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, userId: req.userId })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' })

    booking.status = 'cancelled'
    booking.slotKey = undefined
    booking.userSlotKey = undefined
    await booking.save()

    await Counselor.updateOne(
      { _id: booking.counselorId, 'availableSlots.date': booking.date, 'availableSlots.time': booking.time },
      { $set: { 'availableSlots.$.isBooked': false } }
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Cancel error:', err)
    res.status(500).json({ message: 'Cancellation failed' })
  }
})

// ─── ADMIN ROUTES (before /:id) ───────────────────────────────────────────────

// GET all bookings (admin)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('counselorId', 'name specialization')
      .sort({ createdAt: -1 })
    res.json({ bookings })
  } catch (err) {
    console.error('Admin bookings error:', err)
    res.status(500).json({ message: 'Failed to fetch bookings' })
  }
})

// PATCH approve/reject booking (admin)
router.patch('/admin/:bookingId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Booking.init()
    const { status, adminFeedback } = req.body
    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' })
    }
    const existingBooking = await Booking.findById(req.params.bookingId)
    if (!existingBooking) return res.status(404).json({ message: 'Booking not found' })

    const update = { $set: { status, adminFeedback: adminFeedback || '' } }
    if (status === 'approved') {
      update.$set.slotKey = `${existingBooking.counselorId}:${existingBooking.date}:${existingBooking.time}`
      update.$set.userSlotKey = `${existingBooking.userId}:${existingBooking.date}:${existingBooking.time}`
    } else if (status === 'rejected') {
      update.$unset = { slotKey: 1, userSlotKey: 1 }
    }
    let booking
    try {
      booking = await Booking.findByIdAndUpdate(req.params.bookingId, update, { new: true })
        .populate('userId', 'name email').populate('counselorId', 'name')
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'This booking conflicts with another active reservation' })
      throw err
    }

    if (status === 'rejected') {
      await Counselor.updateOne(
        { _id: existingBooking.counselorId, 'availableSlots.date': existingBooking.date, 'availableSlots.time': existingBooking.time },
        { $set: { 'availableSlots.$.isBooked': false } }
      )
    }

    await AdminLog.create({
      adminId: req.userId,
      action: `booking_${status}`,
      targetType: 'booking',
      targetId: booking._id,
      details: `Booking ${status} for ${booking.userId?.name}`
    })

    res.json({ booking })
  } catch (err) {
    console.error('Status update error:', err)
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
    const { slots } = req.body
    const counselor = await Counselor.findById(req.params.id)
    if (!counselor) return res.status(404).json({ message: 'Counselor not found' })
    counselor.availableSlots.push(...slots.map(s => ({ ...s, isBooked: false })))
    await counselor.save()
    res.json({ counselor })
  } catch {
    res.status(500).json({ message: 'Failed to add slots' })
  }
})

// ─── DYNAMIC /:id LAST ────────────────────────────────────────────────────────

// GET single counselor with slots
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid counselor ID' })
    }
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

// PATCH cancel booking (old URL kept for compatibility)
router.patch('/:bookingId/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, userId: req.userId })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' })
    booking.status = 'cancelled'
    booking.slotKey = undefined
    booking.userSlotKey = undefined
    await booking.save()
    await Counselor.updateOne(
      { _id: booking.counselorId, 'availableSlots.date': booking.date, 'availableSlots.time': booking.time },
      { $set: { 'availableSlots.$.isBooked': false } }
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Cancellation failed' })
  }
})

module.exports = router
