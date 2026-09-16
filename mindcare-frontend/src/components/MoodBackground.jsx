import React, { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import { useMood } from '../context/MoodContext'

const MOOD_EMOJIS = {
  happy: ['🎉', '😄', '✨', '🌟', '🎊', '💛'],
  sad: ['😔', '💙', '🌧️', '🌊', '💧', '🌙'],
  angry: ['😤', '🔥', '⚡', '💢', '🌋', '😠'],
  anxious: ['😰', '💜', '🌀', '⭐', '🔮', '🌸'],
  tired: ['😴', '💤', '🌙', '⭐', '🛌', '🌛'],
}

function FloatingEmoji({ emoji, position, speed, scale = 0.5 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * 0.4
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.1
    }
  })
  return (
    <Float speed={speed} floatIntensity={0.3}>
      <Text ref={ref} position={position} fontSize={scale} anchorX="center" anchorY="middle">
        {emoji}
      </Text>
    </Float>
  )
}

function Scene({ mood }) {
  const emojis = MOOD_EMOJIS[mood] || MOOD_EMOJIS.happy
  const positions = [
    [-5, 2, -5], [5, -1, -6], [-3, -3, -4], [4, 3, -5],
    [0, 4, -6], [-6, 0, -5], [6, 2, -4], [2, -4, -5],
  ]
  return (
    <>
      <ambientLight intensity={0.3} />
      {positions.map((pos, i) => (
        <FloatingEmoji
          key={`${mood}-${i}`}
          emoji={emojis[i % emojis.length]}
          position={pos}
          speed={0.4 + (i % 3) * 0.2}
          scale={0.4 + (i % 2) * 0.2}
        />
      ))}
    </>
  )
}

export default function MoodBackground() {
  const { mood } = useMood()
  if (!mood) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <Scene mood={mood} />
        </Suspense>
      </Canvas>
    </div>
  )
}
