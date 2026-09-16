import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const MOOD_EMOJI = { happy: '😊', sad: '😔', angry: '😡', anxious: '😰', tired: '😴' }
const RISK_STYLES = {
  low:    { bg: '#ecfdf5', color: '#10b981', label: 'Low' },
  medium: { bg: '#fffbeb', color: '#f59e0b', label: 'Medium' },
  high:   { bg: '#fef2f2', color: '#ef4444', label: 'High' },
}

export default function AdminUsers() {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const [filterMood, setMood]     = useState('')
  const [filterRisk, setRisk]     = useState('')
  const [page, setPage]           = useState(1)
  const PER_PAGE = 15

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filterMood) params.mood = filterMood
      if (filterRisk) params.riskLevel = filterRisk
      if (search)     params.search = search
      const res = await api.get('/api/admin/users', { params })
      setUsers(res.data.users || [])
    } catch (e) {
      setError(e.displayMessage)
    } finally {
      setLoading(false)
    }
  }, [filterMood, filterRisk, search])

  useEffect(() => { fetchUsers() }, [filterMood, filterRisk])

  const updateRisk = async (userId, riskLevel) => {
    try {
      await api.patch(`/api/admin/users/${userId}/risk`, { riskLevel })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, riskLevel } : u))
      toast.success('Risk level updated')
    } catch (e) {
      toast.error(e.displayMessage)
    }
  }

  const paginated = users.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(users.length / PER_PAGE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered users</p>
        </div>
        <button onClick={fetchUsers}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">⚠️ {error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers()}
          placeholder="🔍 Search by name or email..."
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white flex-1 min-w-[200px]" />
        <select value={filterMood} onChange={e => { setMood(e.target.value); setPage(1) }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-600">
          <option value="">All Moods</option>
          {['happy', 'sad', 'angry', 'anxious', 'tired'].map(m => (
            <option key={m} value={m}>{MOOD_EMOJI[m]} {m}</option>
          ))}
        </select>
        <select value={filterRisk} onChange={e => { setRisk(e.target.value); setPage(1) }}
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Mood</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Risk</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Points</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Streak</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Joined</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Set Risk</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <div className="text-3xl mb-2">👥</div>
                    <p>No users found. Register some accounts first.</p>
                  </td>
                </tr>
              ) : paginated.map((u, i) => {
                const risk = RISK_STYLES[u.riskLevel] || RISK_STYLES.low
                return (
                  <motion.tr key={u._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
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
                        style={{ background: risk.bg, color: risk.color }}>{risk.label}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-700 font-medium">{u.points || 0}</td>
                    <td className="px-5 py-3 text-gray-700">🔥 {u.streak || 0}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <select value={u.riskLevel || 'low'}
                        onChange={e => updateRisk(u._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-gray-200 focus:outline-none bg-white text-gray-600">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">
            ← Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
