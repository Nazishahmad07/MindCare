import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMood } from '../context/MoodContext'

// Demo data shown when DB has no counselors yet
const DEMO_COUNSELORS = [
  { _id: 'demo_c1', name: 'Dr. Priya Sharma', specialization: 'Anxiety', bio: 'Certified CBT therapist with 8 years experience helping students manage anxiety and stress.', rating: 4.8, reviewCount: 124, sessionFee: 0, languages: ['English', 'Hindi'], avatar: '👩‍⚕️', isDemo: true },
  { _id: 'demo_c2', name: 'Dr. Arjun Mehta', specialization: 'Depression', bio: 'Specializes in adolescent depression and mood disorders. Compassionate and evidence-based approach.', rating: 4.9, reviewCount: 98, sessionFee: 0, languages: ['English', 'Gujarati'], avatar: '👨‍⚕️', isDemo: true },
  { _id: 'demo_c3', name: 'Ms. Kavya Nair', specialization: 'Stress', bio: 'Mindfulness-based stress reduction expert. Helps students build resilience and coping skills.', rating: 4.7, reviewCount: 87, sessionFee: 0, languages: ['English', 'Malayalam'], avatar: '🧑‍⚕️', isDemo: true },
  { _id: 'demo_c4', name: 'Dr. Rahul Verma', specialization: 'Trauma', bio: 'Trauma-informed care specialist. Safe, non-judgmental space for healing and recovery.', rating: 4.6, reviewCount: 62, sessionFee: 0, languages: ['English', 'Hindi'], avatar: '👨‍⚕️', isDemo: true },
]

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

const SPEC_COLORS = {
  Anxiety: '#8b5cf6', Depression: '#3b82f6', Stress: '#f59e0b',
  Trauma: '#ef4444', Relationships: '#10b981', General: '#6366f1'
}

// Seed counselors into DB (admin only, called once)
const SEED_DATA = [
  { name: 'Dr. Priya Sharma', email: 'priya.sharma@mindcare.ai', specialization: 'Anxiety', bio: 'Certified CBT therapist with 8 years experience helping students manage anxiety and stress.', rating: 4.8, reviewCount: 124, languages: ['English', 'Hindi'], avatar: '👩‍⚕️' },
  { name: 'Dr. Arjun Mehta', email: 'arjun.mehta@mindcare.ai', specialization: 'Depression', bio: 'Specializes in adolescent depression and mood disorders. Compassionate and evidence-based approach.', rating: 4.9, reviewCount: 98, languages: ['English', 'Gujarati'], avatar: '👨‍⚕️' },
  { name: 'Ms. Kavya Nair', email: 'kavya.nair@mindcare.ai', specialization: 'Stress', bio: 'Mindfulness-based stress reduction expert. Helps students build resilience and coping skills.', rating: 4.7, reviewCount: 87, languages: ['English', 'Malayalam'], avatar: '🧑‍⚕️' },
  { name: 'Dr. Rahul Verma', email: 'rahul.verma@mindcare.ai', specialization: 'Trauma', bio: 'Trauma-informed care specialist. Safe, non-judgmental space for healing and recovery.', rating: 4.6, reviewCount: 62, languages: ['English', 'Hindi'], avatar: '👨‍⚕️' },
]

export default function Counselors() {
  const { token, user } = useMood()
  const [counselors, setCounselors] = useState([])
  const [isDemo, setIsDemo] = useState(false)
  const [selected, setSelected] = useState(null)
  const [bookingData, setBookingData] = useState({ date: '', time: '', notes: '' })
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [filterSpec, setFilterSpec] = useState('All')

  useEffect(() => { fetchCounselors() }, [])

  const fetchCounselors = async () => {
    try {
      const res = await axios.get('/api/counselors')
      if (res.data.counselors?.length) {
        setCounselors(res.data.counselors)
        setIsDemo(false)
      } else {
        setCounselors(DEMO_COUNSELORS)
        setIsDemo(true)
      }
    } catch {
      setCounselors(DEMO_COUNSELORS)
      setIsDemo(true)
    }
  }

  // Admin: seed real counselors into DB
  const seedCounselors = async () => {
    setSeeding(true)
    try {
      const authToken = token || localStorage.getItem('mc_token')
      for (const c of SEED_DATA) {
        await axios.post('/api/counselors/admin/counselors', c, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      }
      toast.success('Counselors added to database!')
      await fetchCounselors()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seeding failed — are you logged in as admin?')
    } finally {
      setSeeding(false)
    }
  }

  const openBooking = (counselor) => {
    if (counselor.isDemo) {
      toast.error('These are demo counselors. An admin needs to add real counselors first.', { duration: 4000 })
      return
    }
    setSelected(counselor)
    setBookingData({ date: '', time: '', notes: '' })
    setShowModal(true)
  }

  const handleBook = async () => {
    if (!bookingData.date || !bookingData.time) {
      toast.error('Please select a date and time')
      return
    }
    setLoading(true)
    try {
      const authToken = token || localStorage.getItem('mc_token')
      const res = await axios.post('/api/counselors/book', {
        counselorId: selected._id,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes
      }, { headers: { Authorization: `Bearer ${authToken}` } })

      toast.success('Session booked! Awaiting confirmation 🎉')
      setShowModal(false)
      setShowConfirm(false)
    } catch (err) {
      // Show the REAL error from backend
      const msg = err.response?.data?.message || err.message || 'Booking failed'
      toast.error(msg)
      // Don't close modal — let user fix the issue
    } finally {
      setLoading(false)
    }
  }

  const specs = ['All', 'Anxiety', 'Depression', 'Stress', 'Trauma', 'General']
  const filtered = filterSpec === 'All' ? counselors : counselors.filter(c => c.specialization === filterSpec)
  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--mood-bg)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--mood-text)' }}>
              🧑‍⚕️ Book a Counselor
            </h1>
            <p className="opacity-60 text-sm" style={{ color: 'var(--mood-text)' }}>
              Connect with certified mental health professionals
            </p>
          </div>
          {/* Admin seed button */}
          {user?.role === 'admin' && isDemo && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={seedCounselors} disabled={seeding}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#6366f122', color: '#6366f1', border: '1px solid #6366f144' }}>
              {seeding ? '⏳ Adding...' : '➕ Add Demo Counselors to DB'}
            </motion.button>
          )}
        </div>

        {/* Demo notice */}
        {isDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-3 rounded-2xl mb-5 flex items-center gap-3"
            style={{ background: '#f59e0b15', border: '1px solid #f59e0b44' }}>
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-400">Showing demo counselors</p>
              <p className="text-xs text-yellow-300 opacity-70">
                No counselors in database yet.
                {user?.role === 'admin'
                  ? ' Click "Add Demo Counselors to DB" above to enable real bookings.'
                  : ' Ask an admin to add counselors to enable booking.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {specs.map(s => (
            <button key={s} onClick={() => setFilterSpec(s)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: filterSpec === s ? (SPEC_COLORS[s] || 'var(--mood-primary)') : 'rgba(255,255,255,0.05)',
                color: filterSpec === s ? '#fff' : 'var(--mood-text)',
                border: `1px solid ${filterSpec === s ? (SPEC_COLORS[s] || 'var(--mood-primary)') : 'rgba(255,255,255,0.1)'}`
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Counselor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((c, i) => (
            <motion.div key={c._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="p-6 rounded-3xl"
              style={{
                background: 'var(--mood-surface)',
                border: `1px solid ${c.isDemo ? 'rgba(255,255,255,0.1)' : 'var(--mood-primary)33'}`,
                opacity: c.isDemo ? 0.75 : 1
              }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `${SPEC_COLORS[c.specialization] || '#6366f1'}22` }}>
                  {c.avatar || '🧑‍⚕️'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>{c.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${SPEC_COLORS[c.specialization] || '#6366f1'}22`, color: SPEC_COLORS[c.specialization] || '#6366f1' }}>
                    {c.specialization}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-sm">{'⭐'.repeat(Math.min(5, Math.round(c.rating || 5)))}</div>
                  <p className="text-xs opacity-50" style={{ color: 'var(--mood-text)' }}>{c.reviewCount} reviews</p>
                </div>
              </div>

              <p className="text-sm opacity-70 mb-4" style={{ color: 'var(--mood-text)' }}>{c.bio}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {(c.languages || ['English']).map(l => (
                    <span key={l} className="text-xs px-2 py-0.5 rounded-full opacity-60"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--mood-text)' }}>
                      {l}
                    </span>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => openBooking(c)}
                  className="px-5 py-2 rounded-xl font-semibold text-sm"
                  style={{
                    background: c.isDemo ? 'rgba(255,255,255,0.1)' : 'var(--mood-primary)',
                    color: c.isDemo ? 'var(--mood-text)' : 'var(--mood-bg)',
                    opacity: c.isDemo ? 0.6 : 1
                  }}>
                  {c.isDemo ? 'Demo Only' : 'Book Session'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => { setShowModal(false); setShowConfirm(false) }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md p-6 rounded-3xl"
              style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)' }}
              onClick={e => e.stopPropagation()}>

              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--mood-primary)' }}>
                📅 Book with {selected.name}
              </h3>
              <p className="text-sm opacity-60 mb-5" style={{ color: 'var(--mood-text)' }}>
                {selected.specialization} Specialist
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium opacity-60 block mb-1" style={{ color: 'var(--mood-text)' }}>
                    Select Date
                  </label>
                  <input type="date" min={minDate}
                    value={bookingData.date}
                    onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm focus:outline-none"
                    style={{ borderColor: 'var(--mood-primary)44', color: 'var(--mood-text)', colorScheme: 'dark' }} />
                </div>

                <div>
                  <label className="text-xs font-medium opacity-60 block mb-2" style={{ color: 'var(--mood-text)' }}>
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => setBookingData({ ...bookingData, time: t })}
                        className="py-2 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: bookingData.time === t ? 'var(--mood-primary)' : 'rgba(255,255,255,0.05)',
                          color: bookingData.time === t ? 'var(--mood-bg)' : 'var(--mood-text)',
                          border: `1px solid ${bookingData.time === t ? 'var(--mood-primary)' : 'rgba(255,255,255,0.1)'}`
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium opacity-60 block mb-1" style={{ color: 'var(--mood-text)' }}>
                    Notes (optional)
                  </label>
                  <textarea rows={2} placeholder="What would you like to discuss?"
                    value={bookingData.notes}
                    onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm resize-none focus:outline-none"
                    style={{ borderColor: 'var(--mood-primary)44', color: 'var(--mood-text)' }} />
                </div>
              </div>

              {!showConfirm ? (
                <div className="flex gap-3 mt-5">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirm(true)}
                    disabled={!bookingData.date || !bookingData.time}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={{
                      background: bookingData.date && bookingData.time ? 'var(--mood-primary)' : 'rgba(255,255,255,0.1)',
                      color: bookingData.date && bookingData.time ? 'var(--mood-bg)' : 'var(--mood-text)',
                      opacity: bookingData.date && bookingData.time ? 1 : 0.5
                    }}>
                    Review Booking
                  </motion.button>
                  <button onClick={() => setShowModal(false)}
                    className="px-4 py-3 rounded-xl opacity-60 hover:opacity-100"
                    style={{ color: 'var(--mood-text)' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-5 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--mood-primary)44' }}>
                  <p className="text-sm font-semibold mb-3" style={{ color: 'var(--mood-text)' }}>Confirm your booking:</p>
                  <div className="space-y-1 text-sm mb-4">
                    <p style={{ color: 'var(--mood-text)' }}>🧑‍⚕️ <span className="opacity-70">Counselor:</span> {selected.name}</p>
                    <p style={{ color: 'var(--mood-primary)' }}>📅 {bookingData.date} at {bookingData.time}</p>
                    {bookingData.notes && <p className="opacity-60 text-xs italic" style={{ color: 'var(--mood-text)' }}>"{bookingData.notes}"</p>}
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleBook} disabled={loading}
                      className="flex-1 py-2.5 rounded-xl font-bold"
                      style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                      {loading ? '⏳ Booking...' : '✅ Confirm'}
                    </motion.button>
                    <button onClick={() => setShowConfirm(false)}
                      className="px-4 py-2.5 rounded-xl opacity-60"
                      style={{ color: 'var(--mood-text)' }}>
                      Back
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
