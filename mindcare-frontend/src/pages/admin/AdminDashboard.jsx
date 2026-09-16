import React, { useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMood } from '../../context/MoodContext'
import AdminOverview from './AdminOverview'
import AdminUsers from './AdminUsers'
import AdminBookings from './AdminBookings'
import AdminSubmissions from './AdminSubmissions'
import AdminAnalytics from './AdminAnalytics'
import AdminTests from './AdminTests'
import AdminResources from './AdminResources'

const navItems = [
  { path: '/admin',             label: 'Overview',       icon: '📊', exact: true },
  { path: '/admin/users',       label: 'Users',          icon: '👥' },
  { path: '/admin/bookings',    label: 'Bookings',       icon: '📅' },
  { path: '/admin/submissions', label: 'Activity Proofs',icon: '📸' },
  { path: '/admin/analytics',   label: 'Analytics',      icon: '📈' },
  { path: '/admin/tests',       label: 'Test Results',   icon: '🧪' },
  { path: '/admin/resources',   label: 'Resources',      icon: '📚' },
]

export default function AdminDashboard() {
  const { user, logout } = useMood()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 fixed h-full z-20 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-gray-800">MindCare AI</span>
          </div>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== '/admin'
                ? true
                : location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <Link to="/dashboard" className="block text-xs text-center py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 mb-1">
            ← Back to App
          </Link>
          <button onClick={logout} className="w-full text-xs py-1.5 rounded-lg text-red-400 hover:bg-red-50">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-gray-800">🧠 Admin Panel</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-600">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-14 left-0 right-0 z-20 bg-white border-b border-gray-200 p-3 space-y-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
                <span>{item.icon}</span><span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen bg-gray-50">
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="tests" element={<AdminTests />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  )
}
