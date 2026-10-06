const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { name, password, phone, emergencyContact } = req.body
    const email = req.body.email.trim().toLowerCase()
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, phone, emergencyContact })
    const token = signToken(user._id)
    res.status(201).json({ token, user: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' })
  }
})

// Login
router.post('/login', [
  body('email').trim().isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { password } = req.body
    const email = req.body.email.trim().toLowerCase()
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const token = signToken(user._id)
    res.json({ token, user: user.toSafeObject() })
  } catch {
    res.status(500).json({ message: 'Login failed' })
  }
})

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, emergencyContact } = req.body
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, emergencyContact },
      { new: true }
    )
    res.json({ user: user.toSafeObject() })
  } catch {
    res.status(500).json({ message: 'Update failed' })
  }
})

// Get profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: user.toSafeObject() })
  } catch {
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

module.exports = router
