import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMood } from '../../context/MoodContext'

const STATUS_STYLES = {
  pending:   { bg: '#fffbeb', color: '#f59e0b', label: 'Pending' },
  approved:  { bg: '#ecfdf5', color: '#10b981', label: 'Approved' },
  rejected:  { bg: '#fef2f2', color: '#ef4444', label: 'Rejected' },
  cancelled: { bg: '#f9fafb', color: '#6b7280', label: 'Cancelled' },
  completed: { bg: '#eef2ff', color: '#6366f1', label: 'Completed' },
}

const DEMO_BOOKINGS = [
  { _id: 'b1', userId: { name: 'Aarav Singh', email: 'aarav@example.com' }, counselorId: { name: 'Dr. Priya Sharma', specialization: 'Anxiety' }, date: '2026-04-15', time: '10:00', status: 'pending', notes: 'Exam stress', createdAt: new Date().toISOString() },
  { _id: 'b2', userId: { name: 'Priya Patel', email: 'priya@example.com' }, counselorId: { name: 'Dr. Arjun Mehta', specialization: 'Depression' }, date: '2026-04-18', time: '14:00', status: 'approved', notes: '', createdAt: new Date().toISOString() },
  { _id: 'b3', userId: { name: 'Rohan Kumar', email: 'rohan@example.com' }, counselorId: { name: 'Ms. Kavya Nair', specialization: 'Stress' }, date: '2026-04-20', time: '11:00', status: 'pending', notes: 'Work-life balance', createdAt: new Date().toISOString() },
]

export default function AdminBookings() {
  const { token } = useMood()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({})
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/counselors/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data.bookings?.length ? res.data.bookings : DEMO_BOOKINGS)
    } catch {
      setBookings(DEMO_BOOKINGS)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/counselors/admin/${id}/status`, {
        status, adminFeedback: feedback[id] || ''
      }, { headers: { Authorization: `Bearer ${token}` } })
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status, adminFeedback: feedback[id] || '' } : b))
      toast.success(`Booking ${status}`)
    } catch {
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b))
      toast.success(`Booking ${status} (demo mode)`)
    }
  }

  const filtered = filterStatus ? bookings.filter(b => b.status === filterStatus) : bookings

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        <p className="text-gray-500 text-sm mt-1">{bookings.length} total bookings</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : filtered.map((b, i) => {
          const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending
          return (
            <motion.div key={b._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-400">Student: </span>
                      <span className="font-medium text-gray-700">{b.userId?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Counselor: </span>
                      <span className="font-medium text-gray-700">{b.counselorId?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date: </span>
                      <span className="text-gray-700">{b.date} at {b.time}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Specialization: </span>
                      <span className="text-gray-700">{b.counselorId?.specialization}</span>
                    </div>
                  </div>
                  {b.notes && (
                    <p className="text-xs text-gray-400 mt-2 italic">Notes: "{b.notes}"</p>
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
    </div>
  )
}
