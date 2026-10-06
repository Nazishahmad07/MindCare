require('dotenv').config()
if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 random bytes before starting the backend')
}
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs')

const authRoutes = require('./routes/auth')
const chatRoutes = require('./routes/chat')
const emergencyRoutes = require('./routes/emergency')
const moodRoutes = require('./routes/mood')
const counselorRoutes = require('./routes/counselors')
const activityRoutes = require('./routes/activities')
const adminRoutes = require('./routes/admin')
const resourceRoutes = require('./routes/resources')
const testRoutes = require('./routes/tests')

const app = express()

// Ensure uploads folder exists only in non-serverless environments
if (process.env.VERCEL !== '1') {
  if (!fs.existsSync('uploads')) fs.mkdirSync('uploads')
}

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// Browser Origin values never include a trailing slash, while deployment
// dashboards often save URLs with one. Normalize both before comparison.
const normalizeOrigin = (value) => value.replace(/\/+$/, '')

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://ai-mind-care.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean).map(normalizeOrigin)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(normalizeOrigin(origin))) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
app.use('/api/', limiter)

app.use(express.json({ limit: '10kb' }))

// Serve uploaded files (local only — use Cloudinary in production)
if (process.env.VERCEL !== '1') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/mood', moodRoutes)
app.use('/api/counselors', counselorRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/tests', testRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ service: 'MindCare API', health: '/api/health' })
})

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// ── Local dev: start server normally ──────────────────────────────────────────
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000

  const startServer = () =>
    app.listen(PORT, () => console.log(`🚀 MindCare API running on port ${PORT}`))

  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindcare')
    .then(() => { console.log('✅ MongoDB connected'); startServer() })
    .catch(err => {
      console.error('❌ MongoDB connection failed:', err.message)
      console.log('⚠️  Starting without DB (demo mode)...')
      startServer()
    })
}

// ── Vercel: export app + lazy DB connection ───────────────────────────────────
let dbConnected = false

const connectDB = async () => {
  if (dbConnected || mongoose.connection.readyState === 1) return
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured')
  }

  // A serverless request must not wait for MongoDB's default 30-second
  // connection timeout: Vercel will terminate the function first.
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  })
  dbConnected = true
}

// Wrap app to ensure DB is connected before handling requests on Vercel
const handler = async (req, res) => {
  try {
    await connectDB()
  } catch (err) {
    console.error('DB connect error:', err.message)
  }
  return app(req, res)
}

module.exports = handler
module.exports.app = app
