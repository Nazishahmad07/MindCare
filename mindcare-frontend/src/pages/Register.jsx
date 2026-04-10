import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMood } from '../context/MoodContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', emergencyContact: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useMood()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', form)
      login(res.data.user, res.data.token)
      toast.success('Account created! Welcome to MindCare AI 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { key: 'phone', label: 'Phone (for alerts)', type: 'tel', placeholder: '+91 9999999999' },
    { key: 'emergencyContact', label: 'Emergency Contact Email', type: 'email', placeholder: 'guardian@example.com' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--mood-bg, #0a0a1a)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--mood-primary, #6366f1)' }}>
            Join MindCare AI
          </h1>
          <p className="text-gray-400 mt-1">Your mental health journey starts here</p>
        </div>

        <div className="p-8 rounded-3xl glass" style={{ border: '1px solid var(--mood-primary, #6366f1)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium mb-1 text-gray-300">{f.label}</label>
                <input
                  type={f.type}
                  required={f.key !== 'phone' && f.key !== 'emergencyContact'}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none"
                  style={{ borderColor: 'var(--mood-primary, #6366f1)44' }}
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-white mt-2"
              style={{ background: 'linear-gradient(135deg, var(--mood-primary, #6366f1), var(--mood-secondary, #8b5cf6))' }}
            >
              {loading ? '⏳ Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center mt-4 text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline"
              style={{ color: 'var(--mood-primary, #6366f1)' }}>
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
