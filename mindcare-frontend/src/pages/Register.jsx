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
  { key: 'password', label: 'Password', type: 'password', placeholder: 'Create a password', autoComplete: 'new-password', hint: 'Use 8–12 characters with uppercase and lowercase letters, a number, and a symbol. No spaces.' },
  { key: 'phone', label: 'Emergency Contact Number', type: 'tel', placeholder: 'Enter emergency contact number', autoComplete: 'tel', hint: 'This will be used in case of emergency.', optional: true },
  { key: 'emergencyContact', label: 'Emergency Contact Email', type: 'email', placeholder: 'Enter emergency contact email', autoComplete: 'email', hint: "We'll use this email to reach your emergency contact if needed.", optional: true },
]

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', emergencyContact: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
              <input type={field.key === 'password' && showPassword ? 'text' : field.type} autoComplete={field.autoComplete} required={!field.optional}
                minLength={field.key === 'name' ? 2 : field.key === 'password' ? 8 : undefined}
                maxLength={field.key === 'name' ? 80 : field.key === 'password' ? 12 : undefined}
                pattern={field.key === 'name' ? "[\\p{L}][\\p{L}\\p{M} .'’\\-]{1,79}" : field.key === 'password' ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\\s])\\S{8,12}" : undefined}
                title={field.key === 'name' ? 'Use 2–80 letters, spaces, apostrophes, periods, or hyphens.' : field.key === 'password' ? 'Use 8–12 characters with uppercase and lowercase letters, a number, and a symbol. No spaces.' : undefined}
                value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder} />
              {field.key === 'password' && (
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
              )}
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
