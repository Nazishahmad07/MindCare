import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMood } from '../context/MoodContext'
import MoodSelector from './MoodSelector'

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/chat', icon: '🤖', label: 'AI Chat' },
  { path: '/emergency', icon: '🚨', label: 'Emergency' },
  { path: '/profile', icon: '👤', label: 'Profile' },
]

export default function Layout({ children }) {
  const { mood, currentMoodData, user, logout } = useMood()
  const location = useLocation()
  const navigate = useNavigate()
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen mood-bg flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-col w-64 mood-surface border-r mood-border p-4 fixed h-full z-20"
        style={{ borderColor: 'var(--mood-primary)', background: 'var(--mood-surface)' }}
      >
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-bold mood-primary" style={{ color: 'var(--mood-primary)' }}>
            🧠 MindCare AI
          </h1>
          <p className="text-xs opacity-50 mood-text mt-1">Mental Health for Students</p>
        </div>

        {/* Current Mood */}
        <button
          onClick={() => setShowMoodSelector(true)}
          className="mb-6 p-3 rounded-xl glass flex items-center gap-3 hover:scale-105 transition-all"
          style={{ border: '1px solid var(--mood-primary)' }}
        >
          <span className="text-2xl">{currentMoodData?.emoji || '🎭'}</span>
          <div className="text-left">
            <p className="text-xs opacity-60 mood-text">Current Mood</p>
            <p className="font-semibold mood-primary text-sm" style={{ color: 'var(--mood-primary)' }}>
              {currentMoodData?.label || 'Select Mood'}
            </p>
          </div>
        </button>

        {/* Nav */}
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === item.path
                  ? 'mood-btn font-semibold'
                  : 'hover:bg-white/5 mood-text opacity-70 hover:opacity-100'
              }`}
              style={location.pathname === item.path ? {
                background: 'var(--mood-primary)',
                color: 'var(--mood-bg)'
              } : {}}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--mood-primary)', opacity: 0.3 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium mood-text" style={{ color: 'var(--mood-text)' }}>{user?.name}</p>
              <p className="text-xs opacity-50">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full text-sm py-2 rounded-lg opacity-60 hover:opacity-100 transition-all mood-text"
            style={{ color: 'var(--mood-text)' }}>
            🚪 Logout
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--mood-primary)' }}>
        <h1 className="font-bold" style={{ color: 'var(--mood-primary)' }}>🧠 MindCare AI</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMoodSelector(true)} className="text-xl">
            {currentMoodData?.emoji || '🎭'}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-xl mood-text">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-14 left-0 right-0 z-20 glass p-4 space-y-2"
          >
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={location.pathname === item.path ? {
                  background: 'var(--mood-primary)', color: 'var(--mood-bg)'
                } : { color: 'var(--mood-text)' }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 opacity-60"
              style={{ color: 'var(--mood-text)' }}>🚪 Logout</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mood Selector Modal */}
      <AnimatePresence>
        {showMoodSelector && (
          <MoodSelector onClose={() => setShowMoodSelector(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
