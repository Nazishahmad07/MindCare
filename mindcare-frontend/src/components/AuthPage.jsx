import React from 'react'
import { Link } from 'react-router-dom'
import './auth.css'

const benefits = [
  { icon: '▥', title: 'Track Your Mood', detail: 'Understand your emotional patterns', tone: 'blue' },
  { icon: '•••', title: 'AI Wellness Support', detail: 'Get personalized guidance', tone: 'purple' },
  { icon: '♥', title: 'Student-Focused', detail: 'Designed for real college life', tone: 'pink' },
]

export default function AuthPage({ mode, children }) {
  const isLogin = mode === 'login'

  return (
    <main className={`auth-page auth-page-${mode}`}>
      <div className="auth-shell">
        <aside className="auth-story">
          <Link to="/" className="auth-brand" aria-label="MindCare AI home">
            <span className="auth-brand-mark" aria-hidden="true">✳</span>
            <span>MindCare AI</span>
          </Link>

          <div className="auth-story-copy">
            <span className="auth-pill"><span aria-hidden="true">✿</span> Your mental wellness companion</span>
            <h1>A healthier<br />mind for a<br /><span>brighter tomorrow.</span></h1>
            <p>{isLogin
              ? 'MindCare AI helps students understand their emotions, build healthier habits, and access supportive guidance whenever they need it.'
              : 'Join MindCare AI and take the first step towards understanding your emotions, building healthier habits, and getting support whenever you need it.'}</p>
          </div>

          <ul className="auth-benefits">
            {benefits.map(item => (
              <li key={item.title}>
                <span className={`auth-benefit-icon ${item.tone}`} aria-hidden="true">{item.icon}</span>
                <span><strong>{item.title}</strong><small>{item.detail}</small></span>
              </li>
            ))}
          </ul>

          <div className="auth-art" aria-hidden="true">
            <div className="auth-art-sun" />
            <div className="auth-art-note">A calmer<br />you, one day<br />at a time <span>♥</span></div>
            <div className="auth-art-plant plant-one"><i /><i /><i /><b /></div>
            <div className="auth-art-plant plant-two"><i /><i /><i /><b /></div>
            <div className="auth-art-desk" />
            <div className="auth-art-books"><i /><i /><i /></div>
            <div className="auth-art-laptop"><span>✿</span></div>
            <div className="auth-art-person"><div className="person-hair" /><div className="person-face" /><div className="person-body" /><div className="person-arm" /></div>
            <div className="auth-art-cup"><i /></div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <header className="auth-form-topline">
            <Link to="/" className="auth-home-link">← Back to home page</Link>
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Sign Up' : 'Sign In'}</Link>
            </span>
          </header>
          <div className="auth-form-content">
            {children}
            <div className="auth-privacy"><span aria-hidden="true">✓</span><div><strong>Your data stays private and secure.</strong><small>We are committed to protecting your privacy.</small></div></div>
          </div>
        </section>
      </div>
    </main>
  )
}
