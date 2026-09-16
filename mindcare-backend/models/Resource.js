const mongoose = require('mongoose')

/**
 * Mood-Based Resource Library
 * Resources are tagged by mood so users get relevant content
 */
const resourceSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type:        { type: String, enum: ['book', 'video', 'article', 'story', 'exercise'], required: true },
  mood:        { type: String, enum: ['happy', 'sad', 'angry', 'anxious', 'tired', 'all'], default: 'all' },
  url:         { type: String, default: '' },
  thumbnail:   { type: String, default: '' },
  author:      { type: String, default: '' },
  duration:    { type: String, default: '' }, // e.g. "5 min read", "12 min video"
  tags:        [{ type: String }],
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = mongoose.model('Resource', resourceSchema)
