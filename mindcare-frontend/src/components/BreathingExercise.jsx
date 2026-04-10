import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PATTERNS = {
  happy: { name: 'Energizing Breath', inhale: 4, hold: 0, exhale: 4, color: '#f59e0b' },
  sad: { name: 'Comfort Breathing', inhale: 4, hold: 2, exhale: 6, color: '#3b82f6' },
  angry: { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, color: '#ef4444' },
  anxious: { name: 'Calming Breath', inhale: 5, hold: 5, exhale: 5, color: '#8b5cf6' },
  tired: { name: 'Reviving Breath', inhale: 6, hold: 2, exhale: 4, color: '#d97706' },
}

const PHASES = ['Inhale', 'Hold', 'Exhale']

export default function BreathingExercise({ mood, onClose }) {
  const pattern = PATTERNS[mood] || PATTERNS.anxious
  const [phase, setPhase] = useState(0)
  const [count, setCount] = useState(0)
  const [active, setActive] = useState(false)
  const [cycles, setCycles] = useState(0)

  const phaseDurations = [pattern.inhale, pattern.hold, pattern.exhale]

  useEffect(() => {
    if (!active) return
    const duration = phaseDurations[phase]
    if (duration === 0) {
      setPhase(p => (p + 1) % 3)
      return
    }
    const interval = setInterval(() => {
      setCount(c => {
        if (c >= duration - 1) {
          const nextPhase = (phase + 1) % 3
          setPhase(nextPhase)
          if (nextPhase === 0) setCycles(cy => cy + 1)
          return 0
        }
        return c + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [active, phase])

  const circleScale = phase === 0 ? 1.4 : phase === 1 ? 1.4 : 0.8

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="w-full max-w-sm p-8 rounded-3xl glass text-center"
        style={{ border: `1px solid ${pattern.color}` }}
      >
        <h3 className="text-xl font-bold mb-1" style={{ color: pattern.color }}>
          🌬️ {pattern.name}
        </h3>
        <p className="text-sm opacity-60 mb-8" style={{ color: 'var(--mood-text)' }}>
          Cycles completed: {cycles}
        </p>

        {/* Breathing Circle */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Pulse rings */}
            {active && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${pattern.color}44` }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: phaseDurations[phase] || 1, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${pattern.color}22` }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: phaseDurations[phase] || 1, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{ background: `${pattern.color}22`, border: `3px solid ${pattern.color}` }}
              animate={{ scale: active ? circleScale : 1 }}
              transition={{ duration: phaseDurations[phase] || 1, ease: 'easeInOut' }}
            >
              <div>
                <p className="text-2xl font-bold" style={{ color: pattern.color }}>
                  {active ? phaseDurations[phase] - count : '●'}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--mood-text)' }}>
                  {active ? PHASES[phase] : 'Ready'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Pattern info */}
        <div className="flex justify-center gap-4 mb-6 text-xs">
          {PHASES.map((p, i) => (
            <div key={p} className={`px-3 py-1 rounded-full transition-all ${active && phase === i ? 'font-bold' : 'opacity-50'}`}
              style={{
                background: active && phase === i ? `${pattern.color}33` : 'transparent',
                color: pattern.color,
                border: `1px solid ${pattern.color}44`
              }}>
              {p}: {phaseDurations[i]}s
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setActive(!active); setCount(0); setPhase(0) }}
            className="flex-1 py-3 rounded-xl font-semibold"
            style={{ background: pattern.color, color: '#000' }}
          >
            {active ? '⏸ Pause' : '▶ Start'}
          </motion.button>
          <button onClick={onClose}
            className="px-4 py-3 rounded-xl opacity-60 hover:opacity-100"
            style={{ color: 'var(--mood-text)' }}>
            ✕
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
