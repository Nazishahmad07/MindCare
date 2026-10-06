const express = require('express')
const nodemailer = require('nodemailer')
const authMiddleware = require('../middleware/auth')
const User = require('../models/User')
const AdminLog = require('../models/AdminLog')

const router = express.Router()

// ─── EMAIL ────────────────────────────────────────────────────────────────────

function buildTransporter() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  if (!user || !pass) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  })
}

async function sendEmail(to, subject, html) {
  const transporter = buildTransporter()
  if (!transporter) {
    console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — skipping email')
    return { sent: false, reason: 'Email credentials not configured' }
  }
  try {
    const info = await transporter.sendMail({
      from: `"MindCare AI 🧠" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
    console.log('✅ Email sent:', info.messageId)
    return { sent: true, messageId: info.messageId }
  } catch (err) {
    console.error('❌ Email error:', err.message)
    return { sent: false, reason: err.message }
  }
}

function buildEmailHtml(data) {
  const mapLink = data.lat && data.lng
    ? `https://maps.google.com/?q=${data.lat},${data.lng}`
    : null

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:30px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🚨</div>
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Emergency Alert</h1>
            <p style="color:#fecaca;margin:6px 0 0;font-size:14px;">Immediate Attention Required</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:30px;">
            <div style="background:#2d1515;border-left:4px solid #ef4444;border-radius:8px;padding:20px;margin-bottom:20px;">
              <table width="100%" cellpadding="6">
                <tr>
                  <td style="color:#9ca3af;font-size:13px;width:130px;">👤 Student</td>
                  <td style="color:#f1f5f9;font-size:14px;font-weight:bold;">${data.userName}</td>
                </tr>
                <tr>
                  <td style="color:#9ca3af;font-size:13px;">📧 Email</td>
                  <td style="color:#f1f5f9;font-size:14px;">${data.userEmail}</td>
                </tr>
                <tr>
                  <td style="color:#9ca3af;font-size:13px;">😔 Mood</td>
                  <td style="color:#fca5a5;font-size:14px;font-weight:bold;text-transform:capitalize;">${data.mood || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="color:#9ca3af;font-size:13px;">🕐 Time</td>
                  <td style="color:#f1f5f9;font-size:14px;">${new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                </tr>
                ${mapLink ? `
                <tr>
                  <td style="color:#9ca3af;font-size:13px;">📍 Location</td>
                  <td style="font-size:14px;">
                    <a href="${mapLink}" style="color:#6366f1;text-decoration:none;">
                      View on Google Maps →
                    </a>
                    <br><span style="color:#6b7280;font-size:12px;">${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}</span>
                  </td>
                </tr>` : ''}
              </table>
            </div>

            <div style="background:#1e1b4b;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
              <p style="color:#a5b4fc;margin:0;font-size:14px;">
                ⚠️ Please check on this student <strong>immediately</strong>.
              </p>
            </div>

            ${mapLink ? `
            <div style="text-align:center;margin-bottom:20px;">
              <a href="${mapLink}"
                style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:bold;font-size:14px;">
                📍 Open Location in Maps
              </a>
            </div>` : ''}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#0f0f1a;padding:16px;text-align:center;">
            <p style="color:#4b5563;font-size:12px;margin:0;">
              Kiran Mental Health Helpline: <strong style="color:#6366f1;">1800-599-0019</strong> (Free, 24/7)
            </p>
            <p style="color:#374151;font-size:11px;margin:6px 0 0;">
              This alert was sent automatically by MindCare AI
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── SMS via TWILIO ───────────────────────────────────────────────────────────

async function sendSMS(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE

  if (!sid || !token || !from) {
    console.warn('⚠️  Twilio credentials not set — skipping SMS')
    return { sent: false, reason: 'Twilio credentials not configured' }
  }
  try {
    const twilio = require('twilio')(sid, token)
    const msg = await twilio.messages.create({ body, from, to })
    console.log('✅ SMS sent:', msg.sid)
    return { sent: true, sid: msg.sid }
  } catch (err) {
    console.error('❌ SMS error:', err.message)
    return { sent: false, reason: err.message }
  }
}

// ─── ROUTE ────────────────────────────────────────────────────────────────────

router.post('/alert', authMiddleware, async (req, res) => {
  const { mood, location, timestamp, userName, userEmail } = req.body

  // Validate
  if (!userName || !userEmail) {
    return res.status(400).json({ message: 'User info required' })
  }

  let user = null
  try {
    user = await User.findById(req.userId)
  } catch {
    // DB might be down — continue in demo mode
  }

  const lat = location?.lat || null
  const lng = location?.lng || null
  const mapLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : null

  const alertData = { userName, userEmail, mood, timestamp: timestamp || new Date().toISOString(), lat, lng }

  const results = {
    email: { sent: false, reason: 'No emergency contact configured' },
    sms: { sent: false, reason: 'No phone number configured' }
  }

  // ── EMAIL ──
  const emergencyEmail = user?.emergencyContact
  if (emergencyEmail) {
    results.email = await sendEmail(
      emergencyEmail,
      '🚨 Emergency Alert – Immediate Attention Required',
      buildEmailHtml(alertData)
    )
  }

  // ── SMS ──
  const phone = user?.phone
  if (phone) {
    const smsBody = `🚨 MindCare Emergency Alert!\n\nStudent: ${userName}\nMood: ${mood || 'Unknown'}\nTime: ${new Date(alertData.timestamp).toLocaleString()}\n${mapLink ? `Location: ${mapLink}` : 'Location: Not available'}\n\nPlease check on them immediately.\nKiran Helpline: 1800-599-0019`
    results.sms = await sendSMS(phone, smsBody)
  }

  // ── LOG ──
  try {
    await AdminLog.create({
      action: 'emergency_alert',
      targetType: 'user',
      targetId: user?._id,
      details: `Emergency alert sent for ${userName}. Email: ${results.email.sent}, SMS: ${results.sms.sent}`
    })
  } catch { /* non-critical */ }

  const anySent = results.email.sent || results.sms.sent
  const configured = emergencyEmail || phone

  res.json({
    success: true,
    emailSent: results.email.sent,
    smsSent: results.sms.sent,
    emailError: results.email.sent ? null : results.email.reason,
    smsError: results.sms.sent ? null : results.sms.reason,
    mapLink,
    message: anySent
      ? `Alert sent! ${[results.email.sent && 'Email', results.sms.sent && 'SMS'].filter(Boolean).join(' & ')} delivered.`
      : configured
        ? 'Alert logged but delivery failed. Check server credentials.'
        : 'Alert logged. Add emergency contact & phone in Profile for real alerts.'
  })
})

// GET /api/emergency/test — verify credentials without sending
router.get('/test-config', authMiddleware, async (req, res) => {
  res.json({
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    smsConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE),
    emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.slice(0, 4)}****` : null,
    twilioPhone: process.env.TWILIO_PHONE || null
  })
})

module.exports = router
