import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../../lib/api'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(e => setError(e.displayMessage))
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Users',          value: stats.totalUsers,          icon: '👥', color: '#6366f1', bg: '#eef2ff' },
    { label: 'Total Bookings',       value: stats.totalBookings,       icon: '📅', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Pending Bookings',     value: stats.pendingBookings,     icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Activity Submissions', value: stats.totalSubmissions,    icon: '📸', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Pending Reviews',      value: stats.pendingSubmissions,  icon: '🔍', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Crisis Messages',      value: stats.crisisMessages,      icon: '🚨', color: '#ef4444', bg: '#fef2f2' },
  ] : []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Live data from MongoDB</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          ⚠️ {error} — check your JWT token and admin role.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-gray-200 mb-3" />
              <div className="h-6 w-16 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {cards.map((c, i) => (
            <motion.div key={c.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: c.bg }}>
                  {c.icon}
                </div>
                <span className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">{c.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Review Bookings',  to: '/admin/bookings',    icon: '📅', color: '#10b981' },
            { label: 'Review Proofs',    to: '/admin/submissions', icon: '📸', color: '#8b5cf6' },
            { label: 'View Users',       to: '/admin/users',       icon: '👥', color: '#6366f1' },
            { label: 'Analytics',        to: '/admin/analytics',   icon: '📈', color: '#f59e0b' },
            { label: 'Test Results',     to: '/admin/tests',       icon: '🧪', color: '#ef4444' },
            { label: 'Resources',        to: '/admin/resources',   icon: '📚', color: '#3b82f6' },
          ].map(q => (
            <Link key={q.label} to={q.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all text-center">
              <span className="text-2xl">{q.icon}</span>
              <span className="text-xs font-medium text-gray-600">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
