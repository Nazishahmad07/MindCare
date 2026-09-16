import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const STATUS_STYLES = {
  pending:   { bg: '#fffbeb', color: '#f59e0b', label: 'Pending' },
  approved:  { bg: '#ecfdf5', color: '#10b981', label: 'Approved' },
  rejected:  { bg: '#fef2f2', color: '#ef4444', label: 'Rejected' },
  cancelled: { bg: '#f9fafb', color: '#6b7280', label: 'Cancelled' },
  completed: { bg: '#eef2ff', color: '#6366f1', label: 'Completed' },
}

export default function AdminBookings() {
  const [bookings, setBookings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [feedback, setFeedback]     = useState({})
  const [filterStatus, setFilter]   = useState('')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const PER_PAGE = 10

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/counselors/admin/all')
      setBookings(res.data.bookings || [])
    } catch (e) {
      setError(e.displayMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/counselors/admin/${id}/status`, {
        status, adminFeedback: feedback[id] || ''
      })
      setBookings(prev => prev.map(b =>
        b._id === id ? { ...b, status, adminFeedback: feedback[id] || '' } : b
      ))
      toast.success(`Booking ${status}`)
    } catch (e) {
      toast.error(e.displayMessage)
    }
  }

  const filtered = bookings
    .filter(b => !filterStatus || b.status === filterStatus)
    .filter(b => !search ||
      b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.counselorId?.name?.toLowerCase().includes(search.toLowerCase())
    )

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} total bookings in database</p>
        </div>
        <button onClick={fetchBookings}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">⚠️ {error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="🔍 Search by student or counselor..."
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white flex-1 min-w-[200px]" />
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'approved', 'rejected', 'cancelled', 'completed'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-medium">No bookings found</p>
          <p className="text-sm mt-1">
            {bookings.length === 0
              ? 'No bookings in database yet. Users need to book sessions first.'
              : 'No bookings match your current filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((b, i) => {
              const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending
              return (
                <motion.div key={b._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div><span className="text-gray-400">Student: </span>
                          <span className="font-medium text-gray-700">{b.userId?.name || '—'}</span></div>
                        <div><span className="text-gray-400">Counselor: </span>
                          <span className="font-medium text-gray-700">{b.counselorId?.name || '—'}</span></div>
                        <div><span className="text-gray-400">Date: </span>
                          <span className="text-gray-700">{b.date} at {b.time}</span></div>
                        <div><span className="text-gray-400">Specialization: </span>
                          <span className="text-gray-700">{b.counselorId?.specialization || '—'}</span></div>
                      </div>
                      {b.notes && <p className="text-xs text-gray-400 mt-2 italic">Notes: "{b.notes}"</p>}
                      {b.adminFeedback && (
                        <p className="text-xs mt-2 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                          Feedback: {b.adminFeedback}
                        </p>
                      )}
                    </div>

                    {b.status === 'pending' && (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <input placeholder="Add feedback (optional)"
                          value={feedback[b._id] || ''}
                          onChange={e => setFeedback(prev => ({ ...prev, [b._id]: e.target.value }))}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" />
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(b._id, 'approved')}
                            className="flex-1 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600">
                            ✅ Approve
                          </button>
                          <button onClick={() => updateStatus(b._id, 'rejected')}
                            className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600">
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
        </>
      )}
    </div>
  )
}
