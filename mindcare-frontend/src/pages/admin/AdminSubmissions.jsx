import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const STATUS_STYLES = {
  pending:  { bg: '#fffbeb', color: '#f59e0b', label: '⏳ Pending' },
  approved: { bg: '#ecfdf5', color: '#10b981', label: '✅ Approved' },
  rejected: { bg: '#fef2f2', color: '#ef4444', label: '❌ Rejected' },
}

const FEEDBACK_PRESETS = [
  'Great job! 👍', 'Well done! Keep it up 🌟', 'Excellent effort! 💪',
  'Try again with better proof 📸', 'Image unclear, please resubmit', 'Activity not visible, try again'
]

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [feedback, setFeedback]       = useState({})
  const [filterStatus, setFilter]     = useState('')
  const [preview, setPreview]         = useState(null)
  const [page, setPage]               = useState(1)
  const PER_PAGE = 8

  useEffect(() => { fetchSubmissions() }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/activities/admin/submissions')
      setSubmissions(res.data.submissions || [])
    } catch (e) {
      setError(e.displayMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/activities/admin/submissions/${id}`, {
        status, adminFeedback: feedback[id] || ''
      })
      setSubmissions(prev => prev.map(s =>
        s._id === id ? { ...s, status, adminFeedback: feedback[id] || '' } : s
      ))
      toast.success(`Submission ${status}${status === 'approved' ? ' (+10 pts awarded)' : ''}`)
    } catch (e) {
      toast.error(e.displayMessage)
    }
  }

  const filtered = filterStatus ? submissions.filter(s => s.status === filterStatus) : submissions
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Proof Review</h1>
          <p className="text-gray-500 text-sm mt-1">{submissions.length} total submissions in database</p>
        </div>
        <button onClick={fetchSubmissions}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">⚠️ {error}</div>
      )}

      <div className="flex gap-2 flex-wrap mb-5">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            {s === 'pending' && submissions.filter(x => x.status === 'pending').length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {submissions.filter(x => x.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📸</div>
          <p className="font-medium">No submissions found</p>
          <p className="text-sm mt-1">
            {submissions.length === 0
              ? 'No activity proofs submitted yet. Users need to complete activities first.'
              : 'No submissions match the current filter.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginated.map((sub, i) => {
              const s = STATUS_STYLES[sub.status] || STATUS_STYLES.pending
              return (
                <motion.div key={sub._id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

                  {/* Media */}
                  <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center cursor-pointer"
                    onClick={() => sub.mediaUrl && setPreview(sub)}>
                    {sub.mediaUrl ? (
                      sub.mediaType === 'video'
                        ? <video src={sub.mediaUrl} className="w-full h-full object-cover" />
                        : <img src={sub.mediaUrl} alt="proof" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-1">📸</div>
                        <p className="text-xs">No media uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{sub.activityTitle}</p>
                      <p className="text-xs text-gray-400">{sub.userId?.name} • {sub.mood}</p>
                      <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </div>

                  {sub.adminFeedback && (
                    <p className="text-xs mb-3 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 italic">
                      Feedback: "{sub.adminFeedback}"
                    </p>
                  )}

                  {sub.status === 'pending' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {FEEDBACK_PRESETS.map(p => (
                          <button key={p} onClick={() => setFeedback(prev => ({ ...prev, [sub._id]: p }))}
                            className={`text-xs px-2 py-1 rounded-full border transition-all ${
                              feedback[sub._id] === p
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <input placeholder="Or type custom feedback..."
                        value={feedback[sub._id] || ''}
                        onChange={e => setFeedback(prev => ({ ...prev, [sub._id]: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none" />
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(sub._id, 'approved')}
                          className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600">
                          ✅ Approve (+10 pts)
                        </button>
                        <button onClick={() => updateStatus(sub._id, 'rejected')}
                          className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

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

      {/* Media Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="max-w-2xl w-full rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              {preview.mediaType === 'video'
                ? <video src={preview.mediaUrl} controls className="w-full" />
                : <img src={preview.mediaUrl} alt="proof" className="w-full" />}
              <div className="bg-white p-4">
                <p className="font-semibold text-gray-800">{preview.activityTitle}</p>
                <p className="text-sm text-gray-500">{preview.userId?.name}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
