const mongoose = require('mongoose')

const activitySubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityId: { type: String, required: true },
  activityTitle: { type: String, required: true },
  activityType: { type: String },
  mediaUrl: { type: String },           // Cloudinary URL
  mediaPublicId: { type: String },      // Cloudinary public_id for deletion
  mediaType: { type: String, enum: ['image', 'video'] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminFeedback: { type: String, default: '' },
  pointsAwarded: { type: Number, default: 0 },
  mood: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('ActivitySubmission', activitySubmissionSchema)
