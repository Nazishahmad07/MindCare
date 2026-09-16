import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMood } from '../context/MoodContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die', 'self harm', 'hurt myself']

const AI_RESPONSES = {
  happy: [
    "That's wonderful! Your positive energy is contagious 🌟 What's making you feel so great today?",
    "Love the good vibes! 🎉 Let's make the most of this energy. What would you like to accomplish?",
    "Amazing! Happiness is a superpower. How can I help you channel it today? 😊",
  ],
  sad: [
    "I hear you, and I'm here for you 💙 It's okay to feel sad. Would you like to talk about what's on your mind?",
    "Your feelings are completely valid. Sometimes we just need someone to listen. I'm here 🌊",
    "Sending you a virtual hug 🤗 Remember, even the darkest clouds pass. What's weighing on your heart?",
  ],
  angry: [
    "I can feel your frustration, and it's completely valid 🔥 Want to vent? I'm listening without judgment.",
    "Anger often comes from caring deeply. What's got you fired up? Let's work through it together 💪",
    "Take a breath with me 🌬️ In... and out... Now tell me what happened. I'm here.",
  ],
  anxious: [
    "I notice you're feeling anxious. You're safe here 💜 Let's take this one step at a time. What's worrying you?",
    "Anxiety can feel overwhelming, but you're not alone 🌸 Would you like to try a quick breathing exercise?",
    "Your feelings are real, but they don't define your reality 🌟 What's the biggest thing on your mind right now?",
  ],
  tired: [
    "Rest is so important 💤 Your body and mind are telling you something. Have you been taking care of yourself?",
    "Exhaustion is real and valid 🌙 Sometimes the most productive thing is to rest. What's been draining your energy?",
    "You deserve rest 😴 Let's figure out what's making you tired and how we can help. Tell me more.",
  ],
}

const GREETINGS = [
  "Hi! I'm your MindCare AI companion 🤖 I'm here to listen and support you. How are you feeling?",
  "Hello! I'm here for you 💙 What's on your mind today?",
]

export default function Chatbot() {
  const { mood, currentMoodData } = useMood()
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: GREETINGS[0], timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [crisisDetected, setCrisisDetected] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const detectCrisis = (text) => {
    return CRISIS_KEYWORDS.some(kw => text.toLowerCase().includes(kw))
  }

  const getAIResponse = (userMsg) => {
    const responses = AI_RESPONSES[mood] || AI_RESPONSES.anxious
    const base = responses[Math.floor(Math.random() * responses.length)]

    if (userMsg.toLowerCase().includes('help')) {
      return `I'm here to help 💙 ${base} Remember, you can also reach the Kiran Mental Health Helpline at 1800-599-0019 (free, 24/7).`
    }
    if (userMsg.toLowerCase().includes('lonely')) {
      return `You're not alone — I'm right here with you 🤗 ${base}`
    }
    return base
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')

    const isCrisis = detectCrisis(userMsg)
    if (isCrisis) setCrisisDetected(true)

    setMessages(prev => [...prev, {
      id: Date.now(), role: 'user', text: userMsg, timestamp: new Date()
    }])

    setTyping(true)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    setTyping(false)

    let response = getAIResponse(userMsg)
    if (isCrisis) {
      response = "⚠️ I'm concerned about you. Please know you're not alone. Reach out to the Kiran Mental Health Helpline: 1800-599-0019 (free, 24/7). Would you like me to alert your emergency contact? 💙"
    }

    setMessages(prev => [...prev, {
      id: Date.now() + 1, role: 'ai', text: response, timestamp: new Date(), isCrisis
    }])

    // Save to backend using authenticated api instance
    try {
      await api.post('/api/chat/message', { message: userMsg, mood })
    } catch {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--mood-bg)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 flex items-center gap-3 border-b"
        style={{ borderColor: 'var(--mood-primary)33', background: 'var(--mood-surface)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ background: 'var(--mood-primary)33', border: '2px solid var(--mood-primary)' }}
        >
          🤖
        </motion.div>
        <div>
          <h2 className="font-bold" style={{ color: 'var(--mood-text)' }}>MindCare AI</h2>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs opacity-60" style={{ color: 'var(--mood-text)' }}>
              Online • {currentMoodData ? `${currentMoodData.emoji} ${currentMoodData.label} mode` : 'Ready to chat'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Crisis Banner */}
      <AnimatePresence>
        {crisisDetected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 flex items-center gap-3"
            style={{ background: '#ef444422', borderBottom: '1px solid #ef4444' }}
          >
            <span className="text-xl">🚨</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">Crisis keywords detected</p>
              <p className="text-xs text-red-300">Kiran Helpline: 1800-599-0019 (Free, 24/7)</p>
            </div>
            <Link to="/emergency" className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white">
              Emergency
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1"
                  style={{ background: 'var(--mood-primary)33', border: '1px solid var(--mood-primary)' }}>
                  🤖
                </div>
              )}
              <div
                className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={msg.role === 'user' ? {
                  background: 'var(--mood-primary)',
                  color: 'var(--mood-bg)',
                  borderRadius: '18px 18px 4px 18px'
                } : {
                  background: msg.isCrisis ? '#ef444422' : 'var(--mood-surface)',
                  color: 'var(--mood-text)',
                  border: `1px solid ${msg.isCrisis ? '#ef4444' : 'var(--mood-primary)33'}`,
                  borderRadius: '18px 18px 18px 4px'
                }}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1"
                  style={{ background: 'var(--mood-primary)' }}>
                  {currentMoodData?.emoji || '👤'}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'var(--mood-primary)33', border: '1px solid var(--mood-primary)' }}>
                🤖
              </div>
              <div className="px-4 py-3 rounded-2xl flex gap-1"
                style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)33' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--mood-primary)33', background: 'var(--mood-surface)' }}>
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Share how you're feeling... ${currentMoodData?.emoji || ''}`}
            rows={1}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border resize-none focus:outline-none text-sm"
            style={{
              borderColor: 'var(--mood-primary)44',
              color: 'var(--mood-text)',
              maxHeight: '120px'
            }}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all"
            style={{
              background: input.trim() ? 'var(--mood-primary)' : 'var(--mood-primary)33',
              color: input.trim() ? 'var(--mood-bg)' : 'var(--mood-primary)'
            }}
          >
            ➤
          </motion.button>
        </div>
        <p className="text-xs opacity-40 mt-2 text-center" style={{ color: 'var(--mood-text)' }}>
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
