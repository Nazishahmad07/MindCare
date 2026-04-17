import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useMood } from '../../context/MoodContext'

const DEMO_STATS = {
  totalUsers: 142, totalBookings: 38, pendingBookings: 7,
  totalSubmissions: 95, pendingSubmissions: 12, crisisMessages: 4
}

export default function AdminOverview() {
  const { token } = useMood()
  const [stats, setStats] = useState(DEMO_STATS)

  useEffect(() => {
    axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setStats(r.data))
      .catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#6366f1', bg: '#eef2ff' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: '📅', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Activity Submissions', value: stats.totalSubmissions, icon: '📸', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Pending Reviews', value: stats.pendingSubmissions, icon: '🔍', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Crisis Messages', value: stats.crisisMessages, icon: '🚨', color: '#ef4444', bg: '#fef2f2' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: c.bg }}>
                {c.icon}
              </div>
              <span className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Review Bookings', href: '/admin/bookings', icon: '📅', color: '#10b981' },
            { label: 'Review Proofs', href: '/admin/submissions', icon: '📸', color: '#8b5cf6' },
            { label: 'View Users', href: '/admin/users', icon: '👥', color: '#6366f1' },
            { label: 'Analytics', href: '/admin/analytics', icon: '📈', color: '#f59e0b' },
          ].map(q => (
            <a key={q.label} href={q.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all text-center">
              <span className="text-2xl">{q.icon}</span>
              <span className="text-xs font-medium text-gray-600">{q.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
