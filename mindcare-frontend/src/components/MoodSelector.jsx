import React from 'react'
import { motion } from 'framer-motion'
import { useMood, MOODS } from '../context/MoodContext'

export default function MoodSelector({ onClose, fullScreen = false }) {
  const { setMood, mood: currentMood } = useMood()

  const handleSelect = (moodId) => {
    setMood(moodId)
    if (onClose) onClose()
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }
  const item = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300 } }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={fullScreen ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-lg p-8 rounded-3xl glass"
        style={{ border: '1px solid var(--mood-primary)' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-center mb-2 mood-text" style={{ color: 'var(--mood-text)' }}>
          How are you feeling?
        </h2>
        <p className="text-center opacity-60 mb-8 mood-text text-sm" style={{ color: 'var(--mood-text)' }}>
          Your mood shapes your entire experience
        </p>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-5 gap-4"
        >
          {Object.values(MOODS).map((m) => (
            <motion.button
              key={m.id}
              variants={item}
              whileHover={{ scale: 1.15, y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(m.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
              style={{
                background: currentMood === m.id ? m.color + '33' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${currentMood === m.id ? m.color : 'transparent'}`,
                boxShadow: currentMood === m.id ? `0 0 20px ${m.color}66` : 'none'
              }}
            >
              <span className="text-4xl">{m.emoji}</span>
              <span className="text-xs font-medium" style={{ color: currentMood === m.id ? m.color : 'var(--mood-text)', opacity: currentMood === m.id ? 1 : 0.7 }}>
                {m.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {!fullScreen && (
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 rounded-xl opacity-50 hover:opacity-100 transition-all text-sm"
            style={{ color: 'var(--mood-text)' }}
          >
            Cancel
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}
