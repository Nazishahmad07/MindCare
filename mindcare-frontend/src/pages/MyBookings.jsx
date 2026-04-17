import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMood } from '../context/MoodContext'

const STATUS_STYLES = {
  pending:   { bg: '#f59e0b22', color: '#f59e0b', label: '⏳ Pending' },
  approved:  { bg: '#10b98122', color: '#10b981', label: '✅ Approved' },
  rejected:  { bg: '#ef444422', color: '#ef4444', label: '❌ Rejected' },
  cancelled: { bg: '#6b728022', color: '#6b7280', label: '🚫 Cancelled' },
  completed: { bg: '#6366f122', color: '#6366f1', label: '🎓 Completed' },
}

const DEMO_BOOKINGS = [
  { _id: 'b1', counselorId: { name: 'Dr. Priya Sharma', specialization: 'Anxiety' }, date: '2026-04-15', time: '10:00', status: 'approved', notes: 'Feeling very anxious about exams', createdAt: new Date().toISOString() },
  { _id: 'b2', counselorId: { name: 'Dr. Arjun Mehta', specialization: 'Depression' }, date: '2026-04-20', time: '14:00', status: 'pending', notes: '', createdAt: new Date().toISOString() },
]

export default function MyBookings() {
  const { token } = useMood()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelId, setCancelId] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/counselors/my/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data.bookings?.length ? res.data.bookings : DEMO_BOOKINGS)
    } catch {
      setBookings(DEMO_BOOKINGS)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    try {
      await axios.patch(`/api/counselors/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Booking cancelled')
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b))
    } catch {
      toast.error('Cancellation failed (demo mode)')
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b))
    } finally {
      setCancelId(null)
    }
  }

  const upcoming = bookings.filter(b => ['pending', 'approved'].includes(b.status))
  const past = bookings.filter(b => ['cancelled', 'rejected', 'completed'].includes(b.status))

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--mood-bg)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>📅 My Bookings</h1>
        <p className="opacity-60 mb-8" style={{ color: 'var(--mood-text)' }}>Manage your counseling sessions</p>

        {loading ? (
          <div className="text-center py-20 opacity-50" style={{ color: 'var(--mood-text)' }}>Loading...</div>
        ) : (
          <>
            {/* Upcoming */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--mood-primary)' }}>
                Upcoming Sessions ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <div className="p-6 rounded-2xl text-center opacity-50"
                  style={{ background: 'var(--mood-surface)', color: 'var(--mood-text)' }}>
                  No upcoming sessions. <a href="/counselors" className="underline" style={{ color: 'var(--mood-primary)' }}>Book one now</a>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.map((b, i) => <BookingCard key={b._id} booking={b} delay={i * 0.1} onCancel={() => setCancelId(b._id)} />)}
                </div>
              )}
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 opacity-60" style={{ color: 'var(--mood-text)' }}>
                  Past Sessions
                </h2>
                <div className="space-y-4">
                  {past.map((b, i) => <BookingCard key={b._id} booking={b} delay={i * 0.1} />)}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Cancel Confirm */}
      <AnimatePresence>
        {cancelId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm p-6 rounded-3xl text-center"
              style={{ background: 'var(--mood-surface)', border: '2px solid #ef4444' }}>
              <div className="text-4xl mb-3">🚫</div>
              <h3 className="text-lg font-bold mb-2 text-red-400">Cancel Booking?</h3>
              <p className="text-sm opacity-60 mb-5" style={{ color: 'var(--mood-text)' }}>
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => handleCancel(cancelId)}
                  className="flex-1 py-3 rounded-xl font-bold text-white"
                  style={{ background: '#ef4444' }}>
                  Yes, Cancel
                </button>
                <button onClick={() => setCancelId(null)}
                  className="px-4 py-3 rounded-xl opacity-60"
                  style={{ color: 'var(--mood-text)' }}>
                  Keep It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BookingCard({ booking, delay, onCancel }) {
  const s = STATUS_STYLES[booking.status] || STATUS_STYLES.pending
  const canCancel = ['pending', 'approved'].includes(booking.status)

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      className="p-5 rounded-2xl"
      style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)22' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🧑‍⚕️</span>
            <h4 className="font-semibold" style={{ color: 'var(--mood-text)' }}>
              {booking.counselorId?.name || 'Counselor'}
            </h4>
          </div>
          <p className="text-xs opacity-60 mb-2" style={{ color: 'var(--mood-text)' }}>
            {booking.counselorId?.specialization}
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: 'var(--mood-primary)' }}>📅 {booking.date}</span>
            <span style={{ color: 'var(--mood-primary)' }}>🕐 {booking.time}</span>
          </div>
          {booking.notes && (
            <p className="text-xs mt-2 opacity-50 italic" style={{ color: 'var(--mood-text)' }}>
              "{booking.notes}"
            </p>
          )}
          {booking.adminFeedback && (
            <p className="text-xs mt-2 px-2 py-1 rounded-lg"
              style={{ background: `${s.color}11`, color: s.color }}>
              Admin: {booking.adminFeedback}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: s.bg, color: s.color }}>
            {s.label}
          </span>
          {canCancel && onCancel && (
            <button onClick={onCancel}
              className="text-xs opacity-50 hover:opacity-100 transition-all"
              style={{ color: '#ef4444' }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
