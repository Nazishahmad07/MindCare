import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMood } from '../context/MoodContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useMood()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--mood-bg, #0a0a1a)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--mood-primary, #6366f1)' }}>
            Welcome Back
          </h1>
          <p className="text-gray-400 mt-1">Sign in to MindCare AI</p>
        </div>

        <div className="p-8 rounded-3xl glass" style={{ border: '1px solid var(--mood-primary, #6366f1)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none transition-all"
                style={{ borderColor: 'var(--mood-primary, #6366f1)44' }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 focus:outline-none transition-all"
                style={{ borderColor: 'var(--mood-primary, #6366f1)44' }}
                placeholder="••••••••"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, var(--mood-primary, #6366f1), var(--mood-secondary, #8b5cf6))' }}
            >
              {loading ? '⏳ Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline"
              style={{ color: 'var(--mood-primary, #6366f1)' }}>
              Register
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-gray-500 text-sm hover:text-gray-300">← Back to Home</Link>
        </p>
      </motion.div>
    </div>
  )
}
