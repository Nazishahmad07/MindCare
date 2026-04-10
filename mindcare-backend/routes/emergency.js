const express = require('express')
const nodemailer = require('nodemailer')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

// Email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  })
}

const sendEmailAlert = async (to, data) => {
  const transporter = createTransporter()
  if (!transporter) {
    console.log('📧 Email not configured - skipping (demo mode)')
    return false
  }
  const mapLink = data.location
    ? `https://maps.google.com/?q=${data.location.lat},${data.location.lng}`
    : 'Location not available'

  await transporter.sendMail({
    from: `"MindCare AI 🧠" <${process.env.EMAIL_USER}>`,
    to,
    subject: '⚠️ MindCare AI Emergency Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e2e8f0; padding: 30px; border-radius: 12px;">
        <h1 style="color: #ef4444; text-align: center;">🚨 Emergency Alert</h1>
        <div style="background: #2d1515; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
          <p><strong>Student:</strong> ${data.userName}</p>
          <p><strong>Email:</strong> ${data.userEmail}</p>
          <p><strong>Mood:</strong> ${data.mood || 'Unknown'}</p>
          <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
          <p><strong>Location:</strong> <a href="${mapLink}" style="color: #6366f1;">${mapLink}</a></p>
        </div>
        <p style="color: #fca5a5; text-align: center;">Please check on this student immediately.</p>
        <p style="text-align: center; opacity: 0.5; font-size: 12px;">Kiran Mental Health Helpline: 1800-599-0019</p>
      </div>
    `
  })
  return true
}

router.post('/alert', authMiddleware, async (req, res) => {
  try {
    const { mood, location, timestamp, userName, userEmail } = req.body
    const user = await User.findById(req.userId)

    const alertData = { mood, location, timestamp, userName, userEmail }
    let emailSent = false

    // Send to emergency contact
    if (user?.emergencyContact) {
      emailSent = await sendEmailAlert(user.emergencyContact, alertData)
    }

    // Twilio SMS (optional)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && user?.phone) {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
        const mapLink = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : 'N/A'
        await twilio.messages.create({
          body: `⚠️ MindCare Emergency Alert: ${userName} may need help. Mood: ${mood}. Location: ${mapLink}`,
          from: process.env.TWILIO_PHONE,
          to: user.phone
        })
      } catch (twilioErr) {
        console.log('Twilio not configured:', twilioErr.message)
      }
    }

    res.json({
      success: true,
      emailSent,
      message: emailSent ? 'Alert sent to emergency contact' : 'Alert logged (configure email for real alerts)'
    })
  } catch (err) {
    console.error('Emergency alert error:', err)
    res.status(500).json({ message: 'Failed to send alert' })
  }
})

module.exports = router
