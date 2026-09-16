import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/api'

const SEVERITY_COLORS = {
  minimal:           '#10b981',
  mild:              '#f59e0b',
  moderate:          '#f97316',
  moderately_severe: '#ef4444',
  severe:            '#7f1d1d',
}
const SEVERITY_LABELS = {
  minimal: 'Minimal', mild: 'Mild', moderate: 'Moderate',
  moderately_severe: 'Mod. Severe', severe: 'Severe'
}

export default function AdminTests() {
  const [analytics, setAnalytics] = useState(null)
  const [results, setResults]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [tab, setTab]             = useState('GAD-7')
  const [filterSev, setFilterSev] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/api/tests/admin/analytics'),
      api.get('/api/tests/admin/all')
    ]).then(([a, r]) => {
      setAnalytics(a.data)
      setResults(r.data.results || [])
    }).catch(e => setError(e.displayMessage))
      .finally(() => setLoading(false))
  }, [])

  const fetchFiltered = async () => {
    try {
      const params = { testType: tab }
      if (filterSev) params.severity = filterSev
      const res = await api.get('/api/tests/admin/all', { params })
      setResults(res.data.results || [])
    } catch (e) {
      setError(e.displayMessage)
    }
  }

  useEffect(() => { if (!loading) fetchFiltered() }, [tab, filterSev])

  const pieData = (tab === 'GAD-7' ? analytics?.gad7Stats : analytics?.phq9Stats) || []
  const chartData = pieData.map(d => ({
    name: SEVERITY_LABELS[d._id] || d._id,
    value: d.count,
    color: SEVERITY_COLORS[d._id] || '#6366f1'
  }))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mental Health Test Results</h1>
        <p className="text-gray-500 text-sm mt-1">GAD-7 (Anxiety) and PHQ-9 (Depression) submissions</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">⚠️ {error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['GAD-7', 'PHQ-9'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {t === 'GAD-7' ? '😰 GAD-7 Anxiety' : '😔 PHQ-9 Depression'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">{tab} Severity Distribution</h2>
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No {tab} results yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' users', n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Severe */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Recent High-Severity Results
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (analytics?.recentSevere || []).length === 0 ? (
            <p className="text-gray-400 text-sm">No severe results 🎉</p>
          ) : (
            <div className="space-y-2">
              {(analytics?.recentSevere || []).map(r => (
                <div key={r._id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.userId?.name}</p>
                    <p className="text-xs text-gray-400">{r.testType} • Score: {r.totalScore}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: SEVERITY_COLORS[r.severity] + '22', color: SEVERITY_COLORS[r.severity] }}>
                    {SEVERITY_LABELS[r.severity]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-gray-700">{tab} Results ({results.length})</h2>
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white text-gray-600">
            <option value="">All Severities</option>
            {Object.entries(SEVERITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Score</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Severity</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No results found</td></tr>
              ) : results.map((r, i) => (
                <motion.tr key={r._id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{r.userId?.name}</p>
                    <p className="text-xs text-gray-400">{r.userId?.email}</p>
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-700">{r.totalScore}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ background: SEVERITY_COLORS[r.severity] + '22', color: SEVERITY_COLORS[r.severity] }}>
                      {SEVERITY_LABELS[r.severity]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(r.takenAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs max-w-xs truncate">{r.recommendation}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
