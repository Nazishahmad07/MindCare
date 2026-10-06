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
            <input type="password" autoComplete="current-password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" />
          </span>
        </label>
        <motion.button type="submit" disabled={loading} whileTap={{ scale: .99 }} className="auth-submit">
          {loading ? 'Signing in…' : 'Log In'} <span aria-hidden="true">→</span>
        </motion.button>
      </form>
    </AuthPage>
  )
}
