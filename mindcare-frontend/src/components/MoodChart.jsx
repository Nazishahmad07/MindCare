import React from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useMood, MOODS } from '../context/MoodContext'

const MOOD_VALUES = { happy: 5, anxious: 3, tired: 2, sad: 1, angry: 4 }

export default function MoodChart({ history }) {
  const { mood } = useMood()

  // Build chart data from history + some sample data
  const sampleData = [
    { time: 'Mon', value: 3, mood: 'anxious' },
    { time: 'Tue', value: 2, mood: 'sad' },
    { time: 'Wed', value: 4, mood: 'angry' },
    { time: 'Thu', value: 5, mood: 'happy' },
    { time: 'Fri', value: 3, mood: 'anxious' },
    { time: 'Sat', value: 2, mood: 'tired' },
    { time: 'Today', value: MOOD_VALUES[mood] || 3, mood: mood || 'anxious' },
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      const m = MOODS[d.mood]
      return (
        <div className="px-3 py-2 rounded-xl glass text-sm"
          style={{ border: `1px solid ${m?.color || 'var(--mood-primary)'}` }}>
          <p style={{ color: m?.color }}>{m?.emoji} {m?.label}</p>
          <p className="opacity-60" style={{ color: 'var(--mood-text)' }}>{d.time}</p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl"
      style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}
    >
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--mood-primary)' }}>
        📊 Mood Tracker
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={sampleData}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--mood-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--mood-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: 'var(--mood-text)', opacity: 0.5, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 6]} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--mood-primary)"
            strokeWidth={2}
            fill="url(#moodGrad)"
            dot={{ fill: 'var(--mood-primary)', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: 'var(--mood-primary)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
