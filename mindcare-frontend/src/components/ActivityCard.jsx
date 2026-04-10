import React from 'react'
import { motion } from 'framer-motion'

export default function ActivityCard({ activity, delay = 0, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, x: 4 }}
      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--mood-primary)22' }}
    >
      <span className="text-3xl">{activity.icon}</span>
      <div className="flex-1">
        <h4 className="font-semibold text-sm" style={{ color: 'var(--mood-text)' }}>{activity.title}</h4>
        <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--mood-text)' }}>{activity.desc}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onStart}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
        style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}
      >
        Start
      </motion.button>
    </motion.div>
  )
}
