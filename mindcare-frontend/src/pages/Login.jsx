import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMood } from '../context/MoodContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import AuthPage from '../components/AuthPage'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useMood()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPage mode="login">
      <div className="auth-heading">
        <p className="auth-eyebrow">Your next step starts here</p>
        <h2>Welcome Back</h2>
        <p>Log in to continue your mental wellness journey with MindCare AI.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email Address</span>
          <span className="auth-input-wrap"><span className="auth-input-icon" aria-hidden="true">✉</span>
            <input type="email" autoComplete="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" />
          </span>
        </label>
        <label className="auth-field">
          <span>Password</span>
          <span className="auth-input-wrap"><span className="auth-input-icon" aria-hidden="true">▣</span>
            <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(visible => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                {showPassword ? (
                  <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.3 3.1" /><path d="M6.2 6.2C3.9 7.6 2.7 9.6 2.5 12c.7 2 3.7 7 9.5 7 1 0 1.9-.2 2.7-.5" /></>
                ) : (
                  <><path d="M2.5 12s3.2-7 9.5-7 9.5 7 9.5 7-3.2 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></>
                )}
              </svg>
            </button>
          </span>
        </label>
        <motion.button type="submit" disabled={loading} whileTap={{ scale: .99 }} className="auth-submit">
          {loading ? 'Signing in…' : 'Log In'} <span aria-hidden="true">→</span>
        </motion.button>
      </form>
    </AuthPage>
  )
}
