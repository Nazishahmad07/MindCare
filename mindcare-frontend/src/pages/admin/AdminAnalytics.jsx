import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useMood } from '../../context/MoodContext'

const MOOD_COLORS = {
  happy: '#f59e0b', sad: '#3b82f6', angry: '#ef4444', anxious: '#8b5cf6', tired: '#d97706'
}
const MOOD_EMOJI = { happy: '😊', sad: '😔', angry: '😡', anxious: '😰', tired: '😴' }

const DEMO_DISTRIBUTION = [
  { _id: 'happy', count: 42 },
  { _id: 'anxious', count: 38 },
  { _id: 'sad', count: 29 },
  { _id: 'tired', count: 24 },
  { _id: 'angry', count: 15 },
]

const DEMO_WEEKLY = [
  { date: '2026-04-04', happy: 8, sad: 5, anxious: 7, angry: 3, tired: 4 },
  { date: '2026-04-05', happy: 10, sad: 4, anxious: 9, angry: 2, tired: 5 },
  { date: '2026-04-06', happy: 7, sad: 7, anxious: 6, angry: 4, tired: 3 },
  { date: '2026-04-07', happy: 12, sad: 3, anxious: 5, angry: 1, tired: 6 },
  { date: '2026-04-08', happy: 9, sad: 6, anxious: 8, angry: 3, tired: 4 },
  { date: '2026-04-09', happy: 11, sad: 4, anxious: 7, angry: 2, tired: 5 },
  { date: '2026-04-10', happy: 8, sad: 8, anxious: 10, angry: 4, tired: 7 },
]

const DEMO_HIGH_RISK = [
  { _id: 'u1', name: 'Priya Patel', email: 'priya@example.com', currentMood: 'sad' },
  { _id: 'u2', name: 'Vikram Joshi', email: 'vikram@example.com', currentMood: 'anxious' },
]

export default function AdminAnalytics() {
  const { token } = useMood()
  const [data, setData] = useState({
    distribution: DEMO_DISTRIBUTION,
    weeklyTrend: DEMO_WEEKLY,
    highRiskUsers: DEMO_HIGH_RISK,
    negativeMoodUsers: []
  })

  useEffect(() => {
    axios.get('/api/admin/analytics/moods', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.data.distribution?.length) {
          // Transform weekly trend for recharts
          const trendMap = {}
          r.data.weeklyTrend?.forEach(item => {
            const d = item._id.date
            if (!trendMap[d]) trendMap[d] = { date: d }
            trendMap[d][item._id.mood] = item.count
          })
          setData({
            distribution: r.data.distribution,
            weeklyTrend: Object.values(trendMap),
            highRiskUsers: r.data.highRiskUsers || [],
            negativeMoodUsers: r.data.negativeMoodUsers || []
          })
        }
      })
      .catch(() => {})
  }, [])

  const pieData = data.distribution.map(d => ({
    name: `${MOOD_EMOJI[d._id]} ${d._id}`,
    value: d.count,
    color: MOOD_COLORS[d._id] || '#6366f1'
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-sm">
          <p className="font-medium text-gray-700">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>{payload[0].value} logs</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mental Health Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Mood patterns and user insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Mood Distribution Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Mood Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Trend Line */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Weekly Mood Trends</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip />
              <Legend />
              {Object.keys(MOOD_COLORS).map(mood => (
                <Line key={mood} type="monotone" dataKey={mood}
                  stroke={MOOD_COLORS[mood]} strokeWidth={2}
                  dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* High Risk Users */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          High Risk Users
        </h2>
        {data.highRiskUsers.length === 0 ? (
          <p className="text-gray-400 text-sm">No high-risk users detected 🎉</p>
        ) : (
          <div className="space-y-3">
            {data.highRiskUsers.map(u => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{MOOD_EMOJI[u.currentMood] || '—'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">High Risk</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mood Frequency Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-4">Mood Frequency Summary</h2>
        <div className="space-y-3">
          {data.distribution.map(d => {
            const total = data.distribution.reduce((a, b) => a + b.count, 0)
            const pct = total ? Math.round((d.count / total) * 100) : 0
            return (
              <div key={d._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {MOOD_EMOJI[d._id]} {d._id.charAt(0).toUpperCase() + d._id.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400">{d.count} logs ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: MOOD_COLORS[d._id] || '#6366f1' }} />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
