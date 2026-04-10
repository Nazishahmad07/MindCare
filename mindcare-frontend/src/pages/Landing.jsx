import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Float, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMood, MOODS } from '../context/MoodContext'

// 3D Floating Emoji Sphere
function EmojiSphere({ emoji, position, speed = 1 }) {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3
      meshRef.current.rotation.y += 0.01 * speed
    }
  })
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        ref={meshRef}
        position={position}
        fontSize={0.8}
        anchorX="center"
        anchorY="middle"
      >
        {emoji}
      </Text>
    </Float>
  )
}

function Scene() {
  const emojis = [
    { emoji: '😊', position: [-3, 1, -2], speed: 0.8 },
    { emoji: '😔', position: [3, -1, -3], speed: 0.6 },
    { emoji: '😡', position: [-2, -2, -1], speed: 1.2 },
    { emoji: '😰', position: [2, 2, -2], speed: 0.9 },
    { emoji: '😴', position: [0, -3, -2], speed: 0.5 },
    { emoji: '🧠', position: [-4, 0, -3], speed: 0.7 },
    { emoji: '💙', position: [4, 1, -2], speed: 1.0 },
    { emoji: '✨', position: [1, 3, -3], speed: 1.1 },
  ]
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {emojis.map((e, i) => <EmojiSphere key={i} {...e} />)}
    </>
  )
}

export default function Landing() {
  const { setMood } = useMood()
  const navigate = useNavigate()

  const handleMoodSelect = (moodId) => {
    setMood(moodId)
    navigate('/login')
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a1a' }}>
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #0a0a1a 80%)' }} />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-4"
          >
            🧠
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            MindCare AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            Mood-Based Digital Mental Health
          </p>
          <p className="text-gray-500">for Students</p>
        </motion.div>

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <p className="text-center text-gray-300 text-lg mb-8 font-medium">
            How are you feeling today?
          </p>

          <div className="grid grid-cols-5 gap-4 mb-10">
            {Object.values(MOODS).map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.2, y: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMoodSelect(m.id)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all"
                style={{
                  background: `${m.color}15`,
                  border: `2px solid ${m.color}44`,
                }}
              >
                <motion.span
                  className="text-5xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                >
                  {m.emoji}
                </motion.span>
                <span className="text-sm font-medium" style={{ color: m.color }}>
                  {m.label}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-3 rounded-xl font-semibold border"
              style={{ borderColor: '#6366f1', color: '#a78bfa' }}
            >
              Get Started Free
            </motion.button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 grid grid-cols-3 gap-6 max-w-2xl w-full"
        >
          {[
            { icon: '🎭', text: 'Mood-Adaptive UI' },
            { icon: '🤖', text: 'AI Chatbot' },
            { icon: '🚨', text: 'Emergency Alerts' },
          ].map((f, i) => (
            <div key={i} className="text-center p-4 rounded-xl glass">
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="text-sm text-gray-400">{f.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
