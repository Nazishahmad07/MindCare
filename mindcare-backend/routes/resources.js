const express = require('express')
const authMiddleware = require('../middleware/auth')
const adminMiddleware = require('../middleware/admin')
const Resource = require('../models/Resource')

const router = express.Router()

// ─── DEFAULT SEED DATA ────────────────────────────────────────────────────────
const DEFAULT_RESOURCES = [
  // SAD
  { title: 'Feeling Good: The New Mood Therapy', description: 'A classic CBT-based book to overcome depression and low mood.', type: 'book', mood: 'sad', author: 'Dr. David Burns', duration: '400 pages', tags: ['CBT', 'depression', 'self-help'] },
  { title: 'The Mindfulness & Acceptance Workbook for Depression', description: 'Practical exercises to break free from the depression cycle.', type: 'book', mood: 'sad', author: 'Kirk Strosahl', duration: '300 pages', tags: ['mindfulness', 'depression'] },
  { title: 'Guided Meditation for Sadness', description: 'A 15-minute guided meditation to process and release sadness.', type: 'video', mood: 'sad', url: 'https://www.youtube.com/watch?v=ZToicYcHIOU', duration: '15 min', tags: ['meditation', 'sadness'] },
  { title: 'The Story of the Sad Elephant', description: 'A short story about finding hope in the darkest moments.', type: 'story', mood: 'sad', duration: '5 min read', tags: ['hope', 'story'] },
  // ANXIOUS
  { title: 'The Anxiety and Worry Workbook', description: 'Evidence-based CBT strategies to manage anxiety and worry.', type: 'book', mood: 'anxious', author: 'Clark & Beck', duration: '350 pages', tags: ['CBT', 'anxiety', 'workbook'] },
  { title: '5-4-3-2-1 Grounding Technique', description: 'A quick grounding exercise to calm anxiety in minutes.', type: 'exercise', mood: 'anxious', duration: '5 min', tags: ['grounding', 'anxiety', 'quick'] },
  { title: 'Box Breathing for Anxiety Relief', description: 'Navy SEAL breathing technique to instantly calm your nervous system.', type: 'video', mood: 'anxious', url: 'https://www.youtube.com/watch?v=tEmt1Znux58', duration: '8 min', tags: ['breathing', 'anxiety'] },
  { title: 'Dare: The New Way to End Anxiety', description: 'A revolutionary approach to overcoming anxiety and panic attacks.', type: 'book', mood: 'anxious', author: 'Barry McDonagh', duration: '250 pages', tags: ['anxiety', 'panic'] },
  // ANGRY
  { title: 'The Dance of Anger', description: 'Learn to use anger as a tool for change rather than destruction.', type: 'book', mood: 'angry', author: 'Harriet Lerner', duration: '240 pages', tags: ['anger', 'relationships'] },
  { title: 'Progressive Muscle Relaxation', description: 'Release physical tension caused by anger through systematic relaxation.', type: 'exercise', mood: 'angry', duration: '10 min', tags: ['relaxation', 'anger', 'body'] },
  { title: 'Anger Management Techniques', description: 'Practical video guide on healthy ways to process and release anger.', type: 'video', mood: 'angry', url: 'https://www.youtube.com/watch?v=BsVq5R_F6RA', duration: '12 min', tags: ['anger', 'management'] },
  // TIRED
  { title: 'Why We Sleep', description: 'Groundbreaking science of sleep and its impact on mental health.', type: 'book', mood: 'tired', author: 'Matthew Walker', duration: '360 pages', tags: ['sleep', 'science', 'health'] },
  { title: 'Yoga Nidra for Deep Rest', description: 'A 20-minute yoga nidra session equivalent to 4 hours of sleep.', type: 'video', mood: 'tired', url: 'https://www.youtube.com/watch?v=M0u9GST_j3s', duration: '20 min', tags: ['yoga', 'rest', 'sleep'] },
  { title: 'The Power of Rest', description: 'How strategic rest can restore your energy and mental clarity.', type: 'article', mood: 'tired', duration: '8 min read', tags: ['rest', 'energy', 'productivity'] },
  // HAPPY
  { title: 'The Happiness Advantage', description: 'How positive psychology fuels success in work and life.', type: 'book', mood: 'happy', author: 'Shawn Achor', duration: '256 pages', tags: ['happiness', 'positive psychology'] },
  { title: 'Gratitude Journaling Guide', description: 'Amplify your happiness with a structured gratitude practice.', type: 'exercise', mood: 'happy', duration: '10 min', tags: ['gratitude', 'journaling', 'happiness'] },
  // ALL
  { title: 'Headspace: Basics of Meditation', description: 'A beginner-friendly introduction to mindfulness meditation.', type: 'video', mood: 'all', url: 'https://www.youtube.com/watch?v=o-kMJBWk9E0', duration: '10 min', tags: ['meditation', 'mindfulness', 'beginner'] },
  { title: 'The Body Keeps the Score', description: 'How trauma and stress live in the body and how to heal.', type: 'book', mood: 'all', author: 'Bessel van der Kolk', duration: '464 pages', tags: ['trauma', 'healing', 'body'] },
]

// Seed defaults if collection is empty
async function seedIfEmpty() {
  const count = await Resource.countDocuments()
  if (count === 0) {
    await Resource.insertMany(DEFAULT_RESOURCES)
    console.log('✅ Resource library seeded with defaults')
  }
}

// ─── USER ROUTES ──────────────────────────────────────────────────────────────

// GET resources filtered by mood
router.get('/', authMiddleware, async (req, res) => {
  try {
    await seedIfEmpty()
    const { mood, type } = req.query
    const filter = { isActive: true }

    if (mood && mood !== 'all') {
      filter.$or = [{ mood }, { mood: 'all' }]
    }
    if (type) filter.type = type

    const resources = await Resource.find(filter).sort({ createdAt: -1 })
    res.json({ resources })
  } catch (err) {
    console.error('Resources fetch error:', err)
    res.status(500).json({ message: 'Failed to fetch resources' })
  }
})

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// POST create resource
router.post('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const resource = await Resource.create({ ...req.body, createdBy: req.userId })
    res.status(201).json({ resource })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create resource' })
  }
})

// PATCH update resource
router.patch('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!resource) return res.status(404).json({ message: 'Resource not found' })
    res.json({ resource })
  } catch {
    res.status(500).json({ message: 'Update failed' })
  }
})

// DELETE resource (soft delete)
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Resource.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true })
  } catch {
    res.status(500).json({ message: 'Delete failed' })
  }
})

// GET all resources (admin, including inactive)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 })
    res.json({ resources })
  } catch {
    res.status(500).json({ message: 'Failed to fetch resources' })
  }
})

module.exports = router
