import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const MoodContext = createContext(null)

export const MOODS = {
  happy: {
    id: 'happy',
    emoji: '😊',
    label: 'Happy',
    color: '#f59e0b',
    gradient: 'from-yellow-500 to-green-500',
    bgClass: 'mood-happy',
    animSpeed: 'fast',
    description: 'Feeling great and energetic!',
    bgColor: '#0d1f0d',
    particleColor: '#f59e0b',
  },
  sad: {
    id: 'sad',
    emoji: '😔',
    label: 'Sad',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    bgClass: 'mood-sad',
    animSpeed: 'slow',
    description: 'Feeling a bit down...',
    bgColor: '#0a0f1e',
    particleColor: '#3b82f6',
  },
  angry: {
    id: 'angry',
    emoji: '😡',
    label: 'Angry',
    color: '#ef4444',
    gradient: 'from-red-500 to-orange-500',
    bgClass: 'mood-angry',
    animSpeed: 'fast',
    description: 'Feeling frustrated',
    bgColor: '#1a0a0a',
    particleColor: '#ef4444',
  },
  anxious: {
    id: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    color: '#8b5cf6',
    gradient: 'from-purple-500 to-indigo-500',
    bgClass: 'mood-anxious',
    animSpeed: 'medium',
    description: 'Feeling worried or nervous',
    bgColor: '#0d0a1a',
    particleColor: '#8b5cf6',
  },
  tired: {
    id: 'tired',
    emoji: '😴',
    label: 'Tired',
    color: '#d97706',
    gradient: 'from-amber-600 to-orange-800',
    bgClass: 'mood-tired',
    animSpeed: 'verySlow',
    description: 'Feeling exhausted',
    bgColor: '#0f0d08',
    particleColor: '#d97706',
  },
}

export const MEME_DATA = {
  happy: [
    { type: 'funny', text: 'When you finish all your assignments before the deadline 🎉', emoji: '🥳' },
    { type: 'relatable', text: 'Me after getting 8 hours of sleep for once 😂', emoji: '😂' },
    { type: 'motivational', text: 'Your energy today is contagious. Keep spreading those good vibes! ✨', emoji: '✨' },
  ],
  sad: [
    { type: 'funny', text: 'My bed and I have a special relationship. It understands me 🛏️', emoji: '🛏️' },
    { type: 'relatable', text: 'Sometimes the bravest thing you can do is just get out of bed 💙', emoji: '💙' },
    { type: 'motivational', text: 'Even the darkest night will end and the sun will rise. You got this 🌅', emoji: '🌅' },
  ],
  angry: [
    { type: 'funny', text: 'Me trying to explain why I\'m angry but then forgetting 😤', emoji: '😤' },
    { type: 'relatable', text: 'It\'s okay to be angry. It means you care about something 🔥', emoji: '🔥' },
    { type: 'motivational', text: 'Channel that energy into something powerful. You\'re stronger than you think 💪', emoji: '💪' },
  ],
  anxious: [
    { type: 'funny', text: 'My brain at 3am: "Remember that embarrassing thing from 2015?" 🧠', emoji: '🧠' },
    { type: 'relatable', text: 'Anxiety is just excitement without breath. Take a deep breath 🌬️', emoji: '🌬️' },
    { type: 'motivational', text: 'You have survived 100% of your worst days so far. That\'s a perfect score 🌟', emoji: '🌟' },
  ],
  tired: [
    { type: 'funny', text: 'My spirit animal is a sloth on a Monday morning 🦥', emoji: '🦥' },
    { type: 'relatable', text: 'Rest is not laziness. It\'s essential maintenance for your mind 💤', emoji: '💤' },
    { type: 'motivational', text: 'Even the sun sets to rise again. Rest well, you deserve it 🌙', emoji: '🌙' },
  ],
}

export const ACTIVITIES = {
  happy: [
    { id: 1, icon: '🎯', title: 'Productivity Sprint', desc: 'Channel your energy into a 25-min focus session', type: 'task' },
    { id: 2, icon: '🎨', title: 'Creative Expression', desc: 'Draw, write, or create something that makes you smile', type: 'creative' },
    { id: 3, icon: '🏃', title: 'Dance Break', desc: 'Put on your favorite song and just move!', type: 'physical' },
  ],
  sad: [
    { id: 1, icon: '📔', title: 'Journaling', desc: 'Write down your thoughts and feelings freely', type: 'journal' },
    { id: 2, icon: '🫂', title: 'Comfort Activity', desc: 'Watch a comforting show or read a favorite book', type: 'comfort' },
    { id: 3, icon: '🌿', title: 'Gentle Walk', desc: 'A slow 10-minute walk in fresh air can help', type: 'physical' },
  ],
  angry: [
    { id: 1, icon: '🌬️', title: 'Box Breathing', desc: '4-4-4-4 breathing to calm your nervous system', type: 'breathing' },
    { id: 2, icon: '✍️', title: 'Vent Journal', desc: 'Write everything you feel without judgment', type: 'journal' },
    { id: 3, icon: '🥊', title: 'Physical Release', desc: 'Do 20 jumping jacks or push-ups to release tension', type: 'physical' },
  ],
  anxious: [
    { id: 1, icon: '🧘', title: 'Guided Breathing', desc: '5-5-5 breathing: inhale, hold, exhale', type: 'breathing' },
    { id: 2, icon: '🌍', title: '5-4-3-2-1 Grounding', desc: 'Name 5 things you see, 4 you hear, 3 you touch...', type: 'grounding' },
    { id: 3, icon: '🎵', title: 'Calming Music', desc: 'Listen to lo-fi or nature sounds for 10 minutes', type: 'comfort' },
  ],
  tired: [
    { id: 1, icon: '💤', title: 'Power Nap', desc: 'Set a 20-minute timer and rest your eyes', type: 'rest' },
    { id: 2, icon: '💧', title: 'Hydrate & Stretch', desc: 'Drink water and do gentle stretches', type: 'physical' },
    { id: 3, icon: '🌙', title: 'Sleep Hygiene', desc: 'Prepare your space for quality sleep tonight', type: 'rest' },
  ],
}

export function MoodProvider({ children }) {
  const [mood, setMoodState] = useState(null)
  const [moodHistory, setMoodHistory] = useState([])
  const [moodAnalytics, setMoodAnalytics] = useState(null)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('mc_token'))
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [location, setLocation] = useState(null)

  useEffect(() => {
    const savedMood = localStorage.getItem('mc_mood')
    if (savedMood) setMoodState(savedMood)
    const savedUser = localStorage.getItem('mc_user')
    if (savedUser) setUser(JSON.parse(savedUser))
  }, [])

  // Fetch analytics whenever token changes (after login)
  const fetchAnalytics = useCallback(async (authToken) => {
    const t = authToken || token
    if (!t) return
    try {
      const res = await axios.get('/api/mood/analytics', {
        headers: { Authorization: `Bearer ${t}` }
      })
      setMoodAnalytics(res.data)
    } catch { /* silent */ }
  }, [token])

  const setMood = useCallback(async (newMood, note = '') => {
    setMoodState(newMood)
    localStorage.setItem('mc_mood', newMood)
    document.body.className = newMood ? `mood-${newMood}` : ''
    setMoodHistory(prev => [...prev, { mood: newMood, timestamp: new Date().toISOString() }])

    // Sync to backend
    const t = localStorage.getItem('mc_token')
    if (t) {
      try {
        const res = await axios.post('/api/mood/update', { mood: newMood, note }, {
          headers: { Authorization: `Bearer ${t}` }
        })
        // Refresh analytics after mood update
        fetchAnalytics(t)
        // Return risk info so callers can react
        return res.data
      } catch { /* silent — works offline */ }
    }
    return null
  }, [fetchAnalytics])

  useEffect(() => {
    if (mood) document.body.className = `mood-${mood}`
  }, [mood])

  const login = useCallback((userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('mc_token', authToken)
    localStorage.setItem('mc_user', JSON.stringify(userData))
    fetchAnalytics(authToken)
  }, [fetchAnalytics])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setMoodAnalytics(null)
    localStorage.removeItem('mc_token')
    localStorage.removeItem('mc_user')
    localStorage.removeItem('mc_mood')
    setMoodState(null)
    document.body.className = ''
  }, [])

  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'))
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setLocation(loc)
          resolve(loc)
        },
        reject
      )
    })
  }, [])

  const currentMoodData = mood ? MOODS[mood] : null

  return (
    <MoodContext.Provider value={{
      mood, setMood, currentMoodData,
      moodHistory, moodAnalytics, fetchAnalytics,
      MOODS, MEME_DATA, ACTIVITIES,
      user, token, login, logout,
      emergencyContacts, setEmergencyContacts,
      location, getLocation
    }}>
      {children}
    </MoodContext.Provider>
  )
}

export const useMood = () => {
  const ctx = useContext(MoodContext)
  if (!ctx) throw new Error('useMood must be used within MoodProvider')
  return ctx
}
