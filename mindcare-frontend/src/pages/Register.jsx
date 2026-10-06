import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMood } from '../context/MoodContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import AuthPage from '../components/AuthPage'

const fields = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', autoComplete: 'name' },
  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email address', autoComplete: 'email' },
  { key: 'password', label: 'Password', type: 'password', placeholder: 'Create a password', autoComplete: 'new-password', hint: 'Use at least 8 characters with a mix of letters, numbers and symbols.' },
  { key: 'phone', label: 'Emergency Contact Number', type: 'tel', placeholder: 'Enter emergency contact number', autoComplete: 'tel', hint: 'This will be used in case of emergency.', optional: true },
  { key: 'emergencyContact', label: 'Emergency Contact Email', type: 'email', placeholder: 'Enter emergency contact email', autoComplete: 'email', hint: "We'll use this email to reach your emergency contact if needed.", optional: true },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', emergencyContact: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useMood()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', form)
      login(res.data.user, res.data.token)
      toast.success('Account created! Welcome to MindCare AI 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPage mode="register">
      <div className="auth-heading register-heading">
        <p className="auth-eyebrow">A little care goes a long way</p>
        <h2>Create Your Account</h2>
        <p>Start your mental wellness journey with MindCare AI.</p>
      </div>

      <form className="auth-form register-form" onSubmit={handleSubmit}>
        {fields.map(field => (
          <label className="auth-field" key={field.key}>
            <span>{field.label}{field.optional && <small className="auth-optional">Optional</small>}</span>
            <span className="auth-input-wrap">
              <span className="auth-input-icon" aria-hidden="true">{field.key === 'name' ? '♙' : field.key === 'password' ? '▣' : field.key === 'phone' ? '⌕' : '✉'}</span>
              <input type={field.type} autoComplete={field.autoComplete} required={!field.optional}
                minLength={field.key === 'password' ? 8 : undefined}
                value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder} />
            </span>
            {field.hint && <small className="auth-field-hint">{field.hint}</small>}
          </label>
        ))}
        <motion.button type="submit" disabled={loading} whileTap={{ scale: .99 }} className="auth-submit">
          {loading ? 'Creating account…' : 'Create Account'} <span aria-hidden="true">→</span>
        </motion.button>
      </form>
    </AuthPage>
  )
}
