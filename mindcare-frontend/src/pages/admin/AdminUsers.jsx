import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMood } from '../../context/MoodContext'

const DEMO_USERS = [
  { _id: 'u1', name: 'Aarav Singh', email: 'aarav@example.com', currentMood: 'anxious', riskLevel: 'medium', points: 50, streak: 3, createdAt: '2026-03-01' },
  { _id: 'u2', name: 'Priya Patel', email: 'priya@example.com', currentMood: 'sad', riskLevel: 'high', points: 20, streak: 1, createdAt: '2026-03-10' },
  { _id: 'u3', name: 'Rohan Kumar', email: 'rohan@example.com', currentMood: 'happy', riskLevel: 'low', points: 120, streak: 7, createdAt: '2026-02-15' },
  { _id: 'u4', name: 'Sneha Reddy', email: 'sneha@example.com', currentMood: 'tired', riskLevel: 'low', points: 80, streak: 5, createdAt: '2026-03-20' },
]

const MOOD_EMOJI = { happy: '😊', sad: '😔', angry: '😡', anxious: '😰', tired: '😴' }
const RISK_STYLES = {
  low: { bg: '#ecfdf5', color: '#10b981', label: 'Low' },
  medium: { bg: '#fffbeb', color: '#f59e0b', label: 'Medium' },
  high: { bg: '#fef2f2', color: '#ef4444', label: 'High' },
}

export default function AdminUsers() {
  const { token } = useMood()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filterMood, setFilterMood] = useState('')
  const [filterRisk, setFilterRisk] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [filterMood, filterRisk])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterMood) params.mood = filterMood
      if (filterRisk) params.riskLevel = filterRisk
      if (search) params.search = search
      const res = await axios.get('/api/admin/users', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data.users?.length ? res.data.users : DEMO_USERS)
    } catch {
      setUsers(DEMO_USERS)
    } finally {
      setLoading(false)
    }
  }

  const updateRisk = async (userId, riskLevel) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/risk`, { riskLevel }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, riskLevel } : u))
      toast.success('Risk level updated')
    } catch {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, riskLevel } : u))
      toast.success('Updated (demo mode)')
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search users..."
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white" />
        <select value={filterMood} onChange={e => setFilterMood(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-600">
          <option value="">All Moods</option>
          {['happy', 'sad', 'angry', 'anxious', 'tired'].map(m => (
            <option key={m} value={m}>{MOOD_EMOJI[m]} {m}</option>
          ))}
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-600">
          <option value="">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
        <button onClick={fetchUsers}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Mood</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Risk Level</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Points</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Streak</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : filtered.map((u, i) => {
                const risk = RISK_STYLES[u.riskLevel] || RISK_STYLES.low
                return (
                  <motion.tr key={u._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-lg">{MOOD_EMOJI[u.currentMood] || '—'}</span>
                      <span className="text-xs text-gray-500 ml-1 capitalize">{u.currentMood || 'N/A'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: risk.bg, color: risk.color }}>
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{u.points || 0}</td>
                    <td className="px-5 py-3 text-gray-700">🔥 {u.streak || 0}</td>
                    <td className="px-5 py-3">
                      <select value={u.riskLevel || 'low'}
                        onChange={e => updateRisk(u._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-200 focus:outline-none bg-white text-gray-600">
                        <option value="low">Set Low</option>
                        <option value="medium">Set Medium</option>
                        <option value="high">Set High</option>
                      </select>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
