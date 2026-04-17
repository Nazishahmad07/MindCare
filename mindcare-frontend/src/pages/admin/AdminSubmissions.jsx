import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMood } from '../../context/MoodContext'

const STATUS_STYLES = {
  pending:  { bg: '#fffbeb', color: '#f59e0b', label: '⏳ Pending' },
  approved: { bg: '#ecfdf5', color: '#10b981', label: '✅ Approved' },
  rejected: { bg: '#fef2f2', color: '#ef4444', label: '❌ Rejected' },
}

const FEEDBACK_PRESETS = [
  'Great job! 👍', 'Well done! Keep it up 🌟', 'Excellent effort! 💪',
  'Try again with better proof 📸', 'Image unclear, please resubmit', 'Activity not visible, try again'
]

const DEMO_SUBMISSIONS = [
  { _id: 's1', userId: { name: 'Aarav Singh', email: 'aarav@example.com' }, activityTitle: 'Box Breathing', activityType: 'breathing', mediaType: 'image', mediaUrl: null, status: 'pending', mood: 'anxious', submittedAt: new Date().toISOString() },
  { _id: 's2', userId: { name: 'Priya Patel', email: 'priya@example.com' }, activityTitle: 'Journaling', activityType: 'journal', mediaType: 'image', mediaUrl: null, status: 'approved', adminFeedback: 'Great job! 👍', mood: 'sad', submittedAt: new Date().toISOString() },
  { _id: 's3', userId: { name: 'Rohan Kumar', email: 'rohan@example.com' }, activityTitle: 'Dance Break', activityType: 'physical', mediaType: 'image', mediaUrl: null, status: 'pending', mood: 'happy', submittedAt: new Date().toISOString() },
]

export default function AdminSubmissions() {
  const { token } = useMood()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({})
  const [filterStatus, setFilterStatus] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/activities/admin/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSubmissions(res.data.submissions?.length ? res.data.submissions : DEMO_SUBMISSIONS)
    } catch {
      setSubmissions(DEMO_SUBMISSIONS)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/activities/admin/submissions/${id}`, {
        status, adminFeedback: feedback[id] || ''
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status, adminFeedback: feedback[id] || '' } : s))
      toast.success(`Submission ${status}`)
    } catch {
      setSubmissions(prev => prev.map(s => s._id === id ? { ...s, status } : s))
      toast.success(`${status} (demo mode)`)
    }
  }

  const filtered = filterStatus ? submissions.filter(s => s.status === filterStatus) : submissions

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity Proof Review</h1>
        <p className="text-gray-500 text-sm mt-1">{submissions.length} total submissions</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-400">Loading...</div>
        ) : filtered.map((sub, i) => {
          const s = STATUS_STYLES[sub.status] || STATUS_STYLES.pending
          return (
            <motion.div key={sub._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

              {/* Media Preview */}
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center cursor-pointer"
                onClick={() => sub.mediaUrl && setPreview(sub)}>
                {sub.mediaUrl ? (
                  sub.mediaType === 'video'
                    ? <video src={sub.mediaUrl} className="w-full h-full object-cover" />
                    : <img src={sub.mediaUrl} alt="proof" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-1">📸</div>
                    <p className="text-xs">No media (demo)</p>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{sub.activityTitle}</p>
                  <p className="text-xs text-gray-400">{sub.userId?.name} • {sub.mood}</p>
                  <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: s.bg, color: s.color }}>
                  {s.label}
                </span>
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
                          feedback[sub._id] === p ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
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
                : <img src={preview.mediaUrl} alt="proof" className="w-full" />
              }
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
