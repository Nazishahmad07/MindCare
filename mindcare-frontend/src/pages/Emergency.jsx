import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMood } from '../context/MoodContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const HELPLINES = [
  { name: 'Kiran Mental Health Helpline', number: '1800-599-0019', flag: '🇮🇳', note: 'Free, 24/7' },
  { name: 'iCall', number: '9152987821', flag: '🇮🇳', note: 'Mon-Sat 8am-10pm' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', flag: '🇮🇳', note: '24/7' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', flag: '🌍', note: '24/7' },
]

export default function Emergency() {
  const { mood, currentMoodData, user, token, getLocation, location } = useMood()

  const [currentLoc, setCurrentLoc] = useState(location)
  const [locLoading, setLocLoading] = useState(false)

  const [sending, setSending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [alertResult, setAlertResult] = useState(null) // null | { success, emailSent, smsSent, ... }

  const [config, setConfig] = useState(null) // backend config status

  // Check backend config on mount
  useEffect(() => {
    if (!token) return
    axios.get('/api/emergency/test-config', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setConfig(r.data))
      .catch(() => {})
  }, [token])

  const fetchLocation = async () => {
    setLocLoading(true)
    try {
      const loc = await getLocation()
      setCurrentLoc(loc)
      toast.success('📍 Location captured')
    } catch {
      toast.error('Location access denied. Enable it in browser settings.')
    } finally {
      setLocLoading(false)
    }
  }

  const sendEmergencyAlert = async () => {
    setSending(true)
    try {
      const res = await axios.post('/api/emergency/alert', {
        userId: user?._id,
        mood,
        location: currentLoc,
        timestamp: new Date().toISOString(),
        userName: user?.name,
        userEmail: user?.email,
      }, { headers: { Authorization: `Bearer ${token}` } })

      setAlertResult(res.data)
      setShowConfirm(false)

      if (res.data.emailSent || res.data.smsSent) {
        toast.success('🚨 Emergency alert sent!')
      } else {
        toast('Alert logged. Configure credentials for real delivery.', { icon: '⚠️' })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send alert'
      setAlertResult({ success: false, error: msg })
      setShowConfirm(false)
      toast.error(msg)
    } finally {
      setSending(false)
    }
  }

  const isCalm = ['sad', 'anxious', 'tired'].includes(mood)
  const bgColor = isCalm ? 'var(--mood-bg)' : '#1a0505'
  const alertSent = alertResult?.success

  return (
    <div className="min-h-screen p-6" style={{ background: bgColor }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mb-4">🚨</motion.div>
          <h1 className="text-3xl font-black mb-2" style={{ color: '#ef4444' }}>Emergency Support</h1>
          <p className="opacity-70" style={{ color: 'var(--mood-text)' }}>
            You're not alone. Help is available right now.
          </p>
        </div>

        {/* Config Status Banner */}
        {config && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-3 rounded-2xl mb-5 flex flex-wrap gap-3 items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs flex items-center gap-1.5" style={{ color: config.emailConfigured ? '#10b981' : '#6b7280' }}>
              <span className={`w-2 h-2 rounded-full ${config.emailConfigured ? 'bg-green-400' : 'bg-gray-500'}`} />
              Email {config.emailConfigured ? `(${config.emailUser})` : 'not configured'}
            </span>
            <span className="text-xs flex items-center gap-1.5" style={{ color: config.smsConfigured ? '#10b981' : '#6b7280' }}>
              <span className={`w-2 h-2 rounded-full ${config.smsConfigured ? 'bg-green-400' : 'bg-gray-500'}`} />
              SMS {config.smsConfigured ? `(${config.twilioPhone})` : 'not configured'}
            </span>
            {!user?.emergencyContact && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                ⚠️ No emergency contact set in Profile
              </span>
            )}
          </motion.div>
        )}

        {/* Panic Button */}
        <motion.div className="flex justify-center mb-8">
          <div className="relative">
            {!alertSent && (
              <>
                <motion.div className="absolute inset-0 rounded-full" style={{ background: '#ef444422' }}
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.div className="absolute inset-0 rounded-full" style={{ background: '#ef444411' }}
                  animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !alertSent && setShowConfirm(true)}
              className="relative w-40 h-40 rounded-full font-black text-white flex flex-col items-center justify-center gap-1 shadow-2xl"
              style={{
                background: alertSent
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: alertSent ? '0 0 40px #10b98166' : '0 0 40px #ef444466'
              }}
            >
              <span className="text-4xl">{alertSent ? '✅' : '🆘'}</span>
              <span className="text-sm">{alertSent ? 'Alert Sent!' : 'PANIC'}</span>
              <span className="text-xs opacity-80">{alertSent ? 'Help is coming' : 'BUTTON'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Alert Result Card */}
        <AnimatePresence>
          {alertResult && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 rounded-2xl mb-5"
              style={{
                background: alertResult.success ? '#10b98115' : '#ef444415',
                border: `1px solid ${alertResult.success ? '#10b981' : '#ef4444'}`
              }}>
              <p className="font-bold mb-3" style={{ color: alertResult.success ? '#10b981' : '#ef4444' }}>
                {alertResult.success ? '✅ Alert Dispatched' : '❌ Alert Failed'}
              </p>
              <div className="space-y-2">
                {/* Email status */}
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alertResult.emailSent ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span style={{ color: 'var(--mood-text)' }}>
                    Email: {alertResult.emailSent
                      ? '✅ Sent to emergency contact'
                      : `⚠️ ${alertResult.emailError || 'Not sent'}`}
                  </span>
                </div>
                {/* SMS status */}
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${alertResult.smsSent ? 'bg-green-400' : 'bg-gray-500'}`} />
                  <span style={{ color: 'var(--mood-text)' }}>
                    SMS: {alertResult.smsSent
                      ? '✅ Sent to phone number'
                      : `⚠️ ${alertResult.smsError || 'Not sent'}`}
                  </span>
                </div>
                {/* Map link */}
                {alertResult.mapLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                    <a href={alertResult.mapLink} target="_blank" rel="noopener noreferrer"
                      className="underline" style={{ color: '#6366f1' }}>
                      📍 Location shared in alert
                    </a>
                  </div>
                )}
              </div>
              <p className="text-xs mt-3 opacity-60" style={{ color: 'var(--mood-text)' }}>
                {alertResult.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl mb-4"
          style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--mood-text)' }}>
              📍 Your Location
            </h3>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={fetchLocation} disabled={locLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
              {locLoading ? '⏳ Getting...' : '📡 Get Location'}
            </motion.button>
          </div>
          {currentLoc ? (
            <div>
              <p className="text-sm opacity-70 mb-2" style={{ color: 'var(--mood-text)' }}>
                {currentLoc.lat.toFixed(5)}, {currentLoc.lng.toFixed(5)}
              </p>
              <a href={`https://maps.google.com/?q=${currentLoc.lat},${currentLoc.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs underline" style={{ color: 'var(--mood-primary)' }}>
                🗺️ View on Google Maps
              </a>
            </div>
          ) : (
            <p className="text-sm opacity-50" style={{ color: 'var(--mood-text)' }}>
              Click "Get Location" to include your coordinates in the alert.
            </p>
          )}
        </motion.div>

        {/* Helplines */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl mb-4"
          style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}>
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--mood-primary)' }}>
            🏥 Mental Health Helplines
          </h3>
          <div className="space-y-3">
            {HELPLINES.map((h, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--mood-text)' }}>
                    {h.flag} {h.name}
                  </p>
                  <p className="text-xs opacity-50" style={{ color: 'var(--mood-text)' }}>{h.note}</p>
                </div>
                <a href={`tel:${h.number.replace(/\D/g, '')}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                  {h.number}
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mood message */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl text-center"
          style={{ background: `${currentMoodData?.color || '#6366f1'}11`, border: `1px solid ${currentMoodData?.color || '#6366f1'}44` }}>
          <p className="text-lg mb-2">{currentMoodData?.emoji || '💙'}</p>
          <p className="font-semibold" style={{ color: currentMoodData?.color || '#6366f1' }}>
            {mood === 'sad' && 'You are worthy of love and support. Reach out.'}
            {mood === 'angry' && 'Your pain is real. Let someone help you carry it.'}
            {mood === 'anxious' && 'You are safe. Breathe. Help is just a call away.'}
            {mood === 'tired' && 'Rest is okay. But please reach out if you need more.'}
            {mood === 'happy' && "Even on good days, it's okay to check in with yourself."}
            {!mood && 'You matter. Help is always available.'}
          </p>
        </motion.div>
      </motion.div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)' }}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
              className="w-full max-w-sm p-6 rounded-3xl glass text-center"
              style={{ border: '2px solid #ef4444' }}>
              <div className="text-5xl mb-4">🚨</div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Send Emergency Alert?</h3>

              {/* What will be sent */}
              <div className="text-left mb-5 space-y-2">
                <p className="text-xs font-semibold opacity-60 uppercase tracking-wide mb-2"
                  style={{ color: 'var(--mood-text)' }}>This will send:</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--mood-text)' }}>
                  <span className={`w-2 h-2 rounded-full ${config?.emailConfigured && user?.emergencyContact ? 'bg-green-400' : 'bg-gray-500'}`} />
                  Email to {user?.emergencyContact || 'emergency contact (not set)'}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--mood-text)' }}>
                  <span className={`w-2 h-2 rounded-full ${config?.smsConfigured && user?.phone ? 'bg-green-400' : 'bg-gray-500'}`} />
                  SMS to {user?.phone || 'phone number (not set)'}
                </div>
                {currentLoc && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--mood-text)' }}>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Your location (Google Maps link)
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={sendEmergencyAlert} disabled={sending}
                  className="flex-1 py-3 rounded-xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        ⏳
                      </motion.span>
                      Sending...
                    </span>
                  ) : '🆘 Yes, Send Alert'}
                </motion.button>
                <button onClick={() => setShowConfirm(false)}
                  className="px-4 py-3 rounded-xl opacity-60 hover:opacity-100"
                  style={{ color: 'var(--mood-text)' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
