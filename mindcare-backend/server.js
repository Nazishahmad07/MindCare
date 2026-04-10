require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth')
const chatRoutes = require('./routes/chat')
const emergencyRoutes = require('./routes/emergency')
const moodRoutes = require('./routes/mood')

const app = express()

// Security
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api/', limiter)

app.use(express.json({ limit: '10kb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/mood', moodRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// Connect DB and start
const PORT = process.env.PORT || 5000
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindcare')
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 MindCare API running on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    console.log('⚠️  Starting without DB (demo mode)...')
    app.listen(PORT, () => console.log(`🚀 MindCare API running on port ${PORT} (no DB)`))
  })
