import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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

  useEffect(() => {
    if (moodAnalytics?.risk?.level === 'high' && !riskAlert) {
      setRiskAlert(moodAnalytics.risk)
    }
  }, [moodAnalytics])

  const memes = mood ? MEME_DATA[mood] : []
  const activities = mood ? ACTIVITIES[mood] : []

  const moodAnimations = {
    happy:   { animate: { y: [0, -8, 0] },           transition: { duration: 0.8, repeat: Infinity } },
    sad:     { animate: { y: [0, -3, 0] },           transition: { duration: 2, repeat: Infinity } },
    angry:   { animate: { x: [0, -3, 3, -3, 0] },   transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 } },
    anxious: { animate: { scale: [1, 1.05, 1] },     transition: { duration: 1.5, repeat: Infinity } },
    tired:   { animate: { opacity: [1, 0.7, 1] },    transition: { duration: 3, repeat: Infinity } },
  }
  const moodAnim = mood ? moodAnimations[mood] : {}

  // Handle activity start — each type gets appropriate action
  const handleActivityStart = (activity) => {
    switch (activity.type) {
      case 'breathing':
        setShowBreathing(true)
        break
      case 'journal':
        setActiveActivity({ ...activity, modalType: 'journal' })
        break
      case 'grounding':
        setActiveActivity({ ...activity, modalType: 'grounding' })
        break
      case 'physical':
        setActiveActivity({ ...activity, modalType: 'physical' })
        break
      case 'comfort':
        setActiveActivity({ ...activity, modalType: 'comfort' })
        break
      case 'rest':
        setActiveActivity({ ...activity, modalType: 'rest' })
        break
      case 'creative':
        setActiveActivity({ ...activity, modalType: 'creative' })
        break
      case 'task':
        setActiveActivity({ ...activity, modalType: 'task' })
        break
      default:
        setActiveActivity({ ...activity, modalType: 'generic' })
    }
  }

  return (
    <div className="min-h-screen p-6 relative" style={{ background: 'var(--mood-bg)', position: 'relative', zIndex: 1 }}>
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
              style={{
                background: 'var(--mood-surface)',
                border: '1px solid var(--mood-primary)44',
                position: 'relative',
                zIndex: 1,
              }}
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
                    onStart={() => handleActivityStart(activity)}
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
              { icon: '🌬️', label: 'Breathe',   action: () => setShowBreathing(true) },
              { icon: '📔', label: 'Journal',   action: () => setActiveActivity({ title: 'Journal', type: 'journal', modalType: 'journal' }) },
              { icon: '🤖', label: 'Chat AI',   action: () => navigate('/chat') },
              { icon: '🚨', label: 'Emergency', action: () => navigate('/emergency') },
            ].map((q, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={q.action || (() => navigate(q.path))}
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
        {activeActivity && (
          <ActivityModal activity={activeActivity} onClose={() => setActiveActivity(null)} />
        )}
        {riskAlert && (
          <RiskAlertModal risk={riskAlert} onClose={() => setRiskAlert(null)} navigate={navigate} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── ACTIVITY MODAL ──────────────────────────────────────────────────────────
// Handles all activity types: journal, grounding, physical, comfort, rest, creative, task

const ACTIVITY_CONTENT = {
  journal: {
    title: '📔 Journal',
    hint: 'Write freely... no judgment here 💙',
    isText: true,
  },
  grounding: {
    title: '🌍 5-4-3-2-1 Grounding',
    steps: [
      '👁️ Name 5 things you can SEE right now',
      '👂 Name 4 things you can HEAR',
      '✋ Name 3 things you can TOUCH',
      '👃 Name 2 things you can SMELL',
      '👅 Name 1 thing you can TASTE',
    ],
  },
  physical: {
    title: '🏃 Physical Activity',
    steps: [
      'Stand up and find some space',
      'Do 10 jumping jacks',
      'Do 10 push-ups or wall push-ups',
      'Shake out your hands and arms',
      'Take 3 deep breaths',
    ],
  },
  comfort: {
    title: '🫂 Comfort Activity',
    steps: [
      'Find a cozy, comfortable spot',
      'Put on something calming — music, a show, or a book',
      'Make yourself a warm drink if you can',
      'Give yourself permission to just rest',
      'You deserve this moment of comfort 💙',
    ],
  },
  rest: {
    title: '💤 Rest & Recharge',
    steps: [
      'Find a quiet, comfortable place',
      'Set a timer for 20 minutes',
      'Close your eyes and breathe slowly',
      'Let your mind wander without judgment',
      'When the timer goes off, stretch gently',
    ],
  },
  creative: {
    title: '🎨 Creative Expression',
    steps: [
      'Grab any creative tool — pen, phone, anything',
      'Don\'t aim for perfection, just express',
      'Draw, write, doodle, or hum a tune',
      'Focus on the process, not the result',
      'You created something — that\'s amazing! ✨',
    ],
  },
  task: {
    title: '🎯 Focus Session',
    steps: [
      'Choose ONE task to focus on',
      'Set a 25-minute timer (Pomodoro)',
      'Remove all distractions — phone on silent',
      'Work until the timer rings',
      'Take a 5-minute break, then repeat',
    ],
  },
  generic: {
    title: '✨ Activity',
    steps: ['Follow the activity description', 'Take your time', 'Be kind to yourself'],
  },
}

function ActivityModal({ activity, onClose }) {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const type = activity.modalType || activity.type || 'generic'
  const content = ACTIVITY_CONTENT[type] || ACTIVITY_CONTENT.generic

  const handleSave = () => {
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-lg p-6 rounded-3xl glass"
        style={{ border: '1px solid var(--mood-primary)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--mood-primary)' }}>
            {content.title}
          </h3>
          <button onClick={onClose} className="text-xl opacity-50 hover:opacity-100"
            style={{ color: 'var(--mood-text)' }}>✕</button>
        </div>

        {content.isText ? (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={content.hint}
              autoFocus
              className="w-full h-48 p-4 rounded-xl bg-white/5 border resize-none focus:outline-none text-sm"
              style={{ borderColor: 'var(--mood-primary)44', color: 'var(--mood-text)' }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}
              >
                {saved ? '✅ Saved!' : '💾 Save Entry'}
              </button>
              <button onClick={onClose}
                className="px-4 py-2.5 rounded-xl opacity-60 text-sm"
                style={{ color: 'var(--mood-text)' }}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-5">
              {content.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                    {i + 1}
                  </span>
                  <p className="text-sm" style={{ color: 'var(--mood-text)' }}>{step}</p>
                </motion.div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}
            >
              ✅ Done
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

function RiskAlertModal({ risk, onClose, navigate }) {
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
            onClick={() => { onClose(); navigate('/counselors') }}
            className="w-full py-3 rounded-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            🧑‍⚕️ Book a Counselor
          </button>
          <button
            onClick={() => { onClose(); navigate('/emergency') }}
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
