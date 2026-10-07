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
  body('name')
    .isString().withMessage('Enter a valid name').bail()
    .trim().customSanitizer(value => value.replace(/\s+/gu, ' '))
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters')
    .matches(/^\p{L}[\p{L}\p{M} .'’-]*$/u).withMessage('Name can contain letters, spaces, apostrophes, periods, and hyphens'),
  body('email')
    .isString().withMessage('Enter a valid email address').bail()
    .trim().isLength({ max: 254 }).withMessage('Email address is too long')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('Enter a valid password').bail()
    .isLength({ min: 8, max: 12 }).withMessage('Password must be between 8 and 12 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S+$/)
      .withMessage('Password must include uppercase and lowercase letters, a number, and a symbol, with no spaces'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { name, password, phone, emergencyContact } = req.body
    const email = req.body.email
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, phone, emergencyContact })
    const token = signToken(user._id)
    res.status(201).json({ token, user: user.toSafeObject() })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already registered' })
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
