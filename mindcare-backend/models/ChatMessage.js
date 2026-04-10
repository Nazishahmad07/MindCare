const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  mood: String,
  isCrisis: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('ChatMessage', chatSchema)
