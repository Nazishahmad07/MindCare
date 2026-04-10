import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MoodProvider, useMood } from './context/MoodContext'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Emergency from './pages/Emergency'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user } = useMood()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user } = useMood()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Layout><Chatbot /></Layout></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><Layout><Emergency /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <MoodProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--mood-surface)',
              color: 'var(--mood-text)',
              border: '1px solid var(--mood-primary)',
            }
          }}
        />
      </BrowserRouter>
    </MoodProvider>
  )
}
