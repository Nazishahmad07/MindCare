import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMood } from '../context/MoodContext'
import api from '../lib/api'

const TYPE_ICONS = { book: '📚', video: '🎬', article: '📰', story: '📖', exercise: '🧘' }
const TYPE_COLORS = {
  book: '#6366f1', video: '#ef4444', article: '#10b981',
  story: '#f59e0b', exercise: '#8b5cf6'
}
const MOOD_LABELS = { all: 'All', happy: '😊 Happy', sad: '😔 Sad', angry: '😡 Angry', anxious: '😰 Anxious', tired: '😴 Tired' }

export default function Resources() {
  const { mood } = useMood()
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterMood, setMood]     = useState(mood || 'all')
  const [filterType, setType]     = useState('')

  useEffect(() => { fetchResources() }, [filterMood, filterType])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterMood && filterMood !== 'all') params.mood = filterMood
      if (filterType) params.type = filterType
      const res = await api.get('/api/resources', { params })
      setResources(res.data.resources || [])
    } catch {
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--mood-bg)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>📚 Resource Library</h1>
          <p className="opacity-60 text-sm" style={{ color: 'var(--mood-text)' }}>
            Curated books, videos, and exercises based on your mood
          </p>
        </div>

        {/* Mood Filter */}
        <div className="flex gap-2 flex-wrap mb-4">
          {Object.entries(MOOD_LABELS).map(([m, label]) => (
            <button key={m} onClick={() => setMood(m)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: filterMood === m ? 'var(--mood-primary)' : 'rgba(255,255,255,0.05)',
                color: filterMood === m ? 'var(--mood-bg)' : 'var(--mood-text)',
                border: `1px solid ${filterMood === m ? 'var(--mood-primary)' : 'rgba(255,255,255,0.1)'}`
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setType('')}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: !filterType ? 'var(--mood-primary)' : 'rgba(255,255,255,0.05)',
              color: !filterType ? 'var(--mood-bg)' : 'var(--mood-text)',
              border: `1px solid ${!filterType ? 'var(--mood-primary)' : 'rgba(255,255,255,0.1)'}`
            }}>
            All Types
          </button>
          {Object.entries(TYPE_ICONS).map(([t, icon]) => (
            <button key={t} onClick={() => setType(t)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize"
              style={{
                background: filterType === t ? TYPE_COLORS[t] : 'rgba(255,255,255,0.05)',
                color: filterType === t ? '#fff' : 'var(--mood-text)',
                border: `1px solid ${filterType === t ? TYPE_COLORS[t] : 'rgba(255,255,255,0.1)'}`
              }}>
              {icon} {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-5 rounded-3xl animate-pulse"
                style={{ background: 'var(--mood-surface)' }}>
                <div className="h-5 rounded w-3/4 mb-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="h-3 rounded w-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-3 rounded w-2/3" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 opacity-50" style={{ color: 'var(--mood-text)' }}>
            <div className="text-5xl mb-4">📭</div>
            <p>No resources found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r, i) => (
              <motion.div key={r._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="p-5 rounded-3xl flex flex-col"
                style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)22' }}>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{TYPE_ICONS[r.type] || '📄'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white capitalize"
                    style={{ background: TYPE_COLORS[r.type] || '#6366f1' }}>
                    {r.type}
                  </span>
                </div>

                <h3 className="font-bold mb-2 text-sm leading-snug" style={{ color: 'var(--mood-text)' }}>
                  {r.title}
                </h3>
                <p className="text-xs opacity-60 mb-3 flex-1 leading-relaxed" style={{ color: 'var(--mood-text)' }}>
                  {r.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div>
                    {r.author && <p className="text-xs opacity-50" style={{ color: 'var(--mood-text)' }}>by {r.author}</p>}
                    {r.duration && <p className="text-xs opacity-40" style={{ color: 'var(--mood-text)' }}>⏱ {r.duration}</p>}
                  </div>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                      Open →
                    </a>
                  ) : (
                    <span className="text-xs opacity-40" style={{ color: 'var(--mood-text)' }}>Offline</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
