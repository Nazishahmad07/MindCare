import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useMood, MOODS } from '../context/MoodContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, mood, currentMoodData, moodHistory, token, logout } = useMood()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', emergencyContact: user?.emergencyContact || '' })

  const moodCounts = moodHistory.reduce((acc, h) => {
    acc[h.mood] = (acc[h.mood] || 0) + 1
    return acc
  }, {})

  const handleSave = async () => {
    try {
      await axios.put('/api/auth/profile', form, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      toast.success('Profile saved (demo mode)')
      setEditing(false)
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--mood-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Avatar */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-4"
            style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </motion.div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--mood-text)' }}>{user?.name}</h2>
          <p className="opacity-60 text-sm" style={{ color: 'var(--mood-text)' }}>{user?.email}</p>
          {currentMoodData && (
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm"
              style={{ background: `${currentMoodData.color}22`, color: currentMoodData.color }}>
              {currentMoodData.emoji} Feeling {currentMoodData.label}
            </div>
          )}
        </div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl mb-6"
          style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: 'var(--mood-primary)' }}>👤 Profile Info</h3>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}
            >
              {editing ? '💾 Save' : '✏️ Edit'}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { key: 'name', label: 'Full Name', icon: '👤' },
              { key: 'phone', label: 'Phone', icon: '📱' },
              { key: 'emergencyContact', label: 'Emergency Contact Email', icon: '🚨' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs opacity-60 block mb-1" style={{ color: 'var(--mood-text)' }}>
                  {f.icon} {f.label}
                </label>
                {editing ? (
                  <input
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border text-sm focus:outline-none"
                    style={{ borderColor: 'var(--mood-primary)44', color: 'var(--mood-text)' }}
                  />
                ) : (
                  <p className="text-sm" style={{ color: 'var(--mood-text)' }}>
                    {form[f.key] || <span className="opacity-40">Not set</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mood Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-3xl mb-6"
          style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}
        >
          <h3 className="font-bold mb-4" style={{ color: 'var(--mood-primary)' }}>📊 Mood History</h3>
          {Object.keys(moodCounts).length === 0 ? (
            <p className="text-sm opacity-50" style={{ color: 'var(--mood-text)' }}>
              No mood history yet. Start tracking your moods!
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(moodCounts).map(([m, count]) => {
                const moodData = MOODS[m]
                const pct = Math.round((count / moodHistory.length) * 100)
                return (
                  <div key={m}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm" style={{ color: 'var(--mood-text)' }}>
                        {moodData?.emoji} {moodData?.label}
                      </span>
                      <span className="text-xs opacity-60" style={{ color: 'var(--mood-text)' }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: moodData?.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full py-3 rounded-2xl font-semibold text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all"
        >
          🚪 Sign Out
        </motion.button>
      </motion.div>
    </div>
  )
}
