import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMood, MEME_DATA, ACTIVITIES } from '../context/MoodContext'
import MoodSelector from '../components/MoodSelector'
import MoodBackground from '../components/MoodBackground'
import ActivityCard from '../components/ActivityCard'
import MoodChart from '../components/MoodChart'
import MoodTrendWidget from '../components/MoodTrendWidget'
import BreathingExercise from '../components/BreathingExercise'
import confetti from 'canvas-confetti'

export default function Dashboard() {
  const { mood, currentMoodData, user, moodHistory, moodAnalytics } = useMood()
  const [showMoodPicker, setShowMoodPicker] = useState(!mood)
  const [activeActivity, setActiveActivity] = useState(null)
  const [showBreathing, setShowBreathing] = useState(false)
  const [riskAlert, setRiskAlert] = useState(null)
  const confettiFired = useRef(false)

  useEffect(() => {
    if (mood === 'happy' && !confettiFired.current) {
      confettiFired.current = true
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#10b981', '#34d399'] })
    }
    if (mood !== 'happy') confettiFired.current = false
  }, [mood])

  // Show risk alert popup when analytics detect high risk
  useEffect(() => {
    if (moodAnalytics?.risk?.level === 'high' && !riskAlert) {
      setRiskAlert(moodAnalytics.risk)
    }
  }, [moodAnalytics])

  const memes = mood ? MEME_DATA[mood] : []
  const activities = mood ? ACTIVITIES[mood] : []

  const moodAnimations = {
    happy: { animate: { y: [0, -8, 0] }, transition: { duration: 0.8, repeat: Infinity } },
    sad: { animate: { y: [0, -3, 0] }, transition: { duration: 2, repeat: Infinity } },
    angry: { animate: { x: [0, -3, 3, -3, 0] }, transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 } },
    anxious: { animate: { scale: [1, 1.05, 1] }, transition: { duration: 1.5, repeat: Infinity } },
    tired: { animate: { opacity: [1, 0.7, 1] }, transition: { duration: 3, repeat: Infinity } },
  }

  const moodAnim = mood ? moodAnimations[mood] : {}

  return (
    <div className="min-h-screen p-6 relative" style={{ background: 'var(--mood-bg)' }}>
      <MoodBackground />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--mood-text)' }}>
            Hey, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="opacity-60 mt-1" style={{ color: 'var(--mood-text)' }}>
            {mood ? `You're feeling ${currentMoodData?.label} today` : 'How are you feeling?'}
          </p>
        </div>
        <motion.button
          {...moodAnim}
          onClick={() => setShowMoodPicker(true)}
          className="text-5xl cursor-pointer hover:scale-110 transition-transform"
        >
          {currentMoodData?.emoji || '🎭'}
        </motion.button>
      </motion.div>

      {!mood ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <p className="text-xl mb-6 opacity-70" style={{ color: 'var(--mood-text)' }}>
            Select your mood to personalize your experience
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMoodPicker(true)}
            className="px-8 py-4 rounded-2xl font-semibold text-lg"
            style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}
          >
            🎭 Choose Your Mood
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Mood Banner */}
          <motion.div
            key={mood}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentMoodData?.color}22, ${currentMoodData?.color}11)`,
              border: `1px solid ${currentMoodData?.color}44`
            }}
          >
            <div className="flex items-center gap-4">
              <motion.span className="text-6xl" {...moodAnim}>
                {currentMoodData?.emoji}
              </motion.span>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: currentMoodData?.color }}>
                  {currentMoodData?.label}
                </h3>
                <p className="opacity-70" style={{ color: 'var(--mood-text)' }}>
                  {currentMoodData?.description}
                </p>
              </div>
            </div>
            {/* Mood-specific message */}
            <div className="mt-4 p-3 rounded-xl bg-white/5">
              <p className="text-sm" style={{ color: 'var(--mood-text)', opacity: 0.8 }}>
                {mood === 'happy' && '🎉 Your positive energy is amazing! Channel it into something great today.'}
                {mood === 'sad' && '💙 It\'s okay to feel sad. Be gentle with yourself today.'}
                {mood === 'angry' && '🔥 Your feelings are valid. Let\'s find healthy ways to release that energy.'}
                {mood === 'anxious' && '🌬️ Take a deep breath. You\'re safe, and this feeling will pass.'}
                {mood === 'tired' && '💤 Rest is productive too. Listen to what your body needs.'}
              </p>
            </div>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meme Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-3xl mood-card"
              style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--mood-primary)' }}>
                😂 Mood Memes
              </h3>
              <div className="space-y-3">
                {memes.map((meme, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-4 rounded-2xl flex items-start gap-3"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-2xl">{meme.emoji}</span>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-50 block mb-1"
                        style={{ color: 'var(--mood-accent)' }}>
                        {meme.type}
                      </span>
                      <p className="text-sm" style={{ color: 'var(--mood-text)' }}>{meme.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Activities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-3xl"
              style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--mood-primary)' }}>
                🎯 Suggested Activities
              </h3>
              <div className="space-y-3">
                {activities.map((activity, i) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    delay={0.4 + i * 0.1}
                    onStart={() => {
                      if (activity.type === 'breathing') setShowBreathing(true)
                      else setActiveActivity(activity)
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Mood Trend Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <MoodTrendWidget analytics={moodAnalytics} />
          </motion.div>

          {/* Legacy chart (fallback when no analytics) */}
          {!moodAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <MoodChart history={moodHistory} />
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: '🌬️', label: 'Breathe', action: () => setShowBreathing(true) },
              { icon: '📔', label: 'Journal', action: () => setActiveActivity({ title: 'Journal', type: 'journal' }) },
              { icon: '🤖', label: 'Chat AI', path: '/chat' },
              { icon: '🚨', label: 'Emergency', path: '/emergency' },
            ].map((q, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={q.action || (() => window.location.href = q.path)}
                className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all"
                style={{
                  background: 'var(--mood-surface)',
                  border: '1px solid var(--mood-primary)33',
                  boxShadow: '0 4px 20px var(--mood-glow)'
                }}
              >
                <span className="text-3xl">{q.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--mood-text)' }}>{q.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showMoodPicker && (
          <MoodSelector onClose={() => setShowMoodPicker(false)} />
        )}
        {showBreathing && (
          <BreathingExercise mood={mood} onClose={() => setShowBreathing(false)} />
        )}
        {activeActivity && activeActivity.type === 'journal' && (
          <JournalModal onClose={() => setActiveActivity(null)} />
        )}
        {riskAlert && (
          <RiskAlertModal risk={riskAlert} onClose={() => setRiskAlert(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function JournalModal({ onClose }) {
  const [text, setText] = useState('')
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-lg p-6 rounded-3xl glass"
        style={{ border: '1px solid var(--mood-primary)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--mood-primary)' }}>📔 Journal</h3>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write freely... no judgment here 💙"
          className="w-full h-48 p-4 rounded-xl bg-white/5 border resize-none focus:outline-none text-sm"
          style={{ borderColor: 'var(--mood-primary)44', color: 'var(--mood-text)' }}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl font-semibold"
            style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
            Save Entry
          </button>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl opacity-60"
            style={{ color: 'var(--mood-text)' }}>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function RiskAlertModal({ risk, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        className="w-full max-w-sm p-6 rounded-3xl glass text-center"
        style={{ border: '2px solid #ef4444' }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="text-5xl mb-3"
        >⚠️</motion.div>
        <h3 className="text-xl font-black text-red-400 mb-2">Mental Health Alert</h3>
        <p className="text-sm opacity-70 mb-4" style={{ color: 'var(--mood-text)' }}>
          {risk.reason}
        </p>
        <p className="text-xs opacity-50 mb-5" style={{ color: 'var(--mood-text)' }}>
          We care about you. Please consider reaching out for support.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { onClose(); window.location.href = '/counselors' }}
            className="w-full py-3 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            🧑‍⚕️ Book a Counselor
          </button>
          <button
            onClick={() => { onClose(); window.location.href = '/emergency' }}
            className="w-full py-2 rounded-xl font-semibold text-sm"
            style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444' }}
          >
            🚨 Emergency Support
          </button>
          <button onClick={onClose}
            className="w-full py-2 rounded-xl text-sm opacity-50 hover:opacity-80"
            style={{ color: 'var(--mood-text)' }}>
            Dismiss
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
