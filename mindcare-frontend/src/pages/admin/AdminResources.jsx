import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../../lib/api'

const TYPE_COLORS = {
  book: '#6366f1', video: '#ef4444', article: '#10b981',
  story: '#f59e0b', exercise: '#8b5cf6'
}
const MOODS = ['all', 'happy', 'sad', 'angry', 'anxious', 'tired']
const TYPES = ['book', 'video', 'article', 'story', 'exercise']

const EMPTY_FORM = { title: '', description: '', type: 'article', mood: 'all', url: '', author: '', duration: '', tags: '' }

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [filterMood, setMood]     = useState('')
  const [filterType, setType]     = useState('')

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/resources/admin/all')
      setResources(res.data.resources || [])
    } catch (e) {
      setError(e.displayMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.description) {
      toast.error('Title and description are required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
      await api.post('/api/resources/admin', payload)
      toast.success('Resource added!')
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetchResources()
    } catch (e) {
      toast.error(e.displayMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return
    try {
      await api.delete(`/api/resources/admin/${id}`)
      setResources(prev => prev.filter(r => r._id !== id))
      toast.success('Resource removed')
    } catch (e) {
      toast.error(e.displayMessage)
    }
  }

  const filtered = resources
    .filter(r => !filterMood || r.mood === filterMood)
    .filter(r => !filterType || r.type === filterType)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resource Library</h1>
          <p className="text-gray-500 text-sm mt-1">{resources.length} resources in database</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          {showForm ? '✕ Cancel' : '+ Add Resource'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">⚠️ {error}</div>
      )}

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add New Resource</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Author</label>
              <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Mood</label>
              <select value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none bg-white">
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">URL (optional)</label>
              <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="https://..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Duration</label>
              <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 10 min read" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="anxiety, breathing, quick" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving...' : '✅ Save Resource'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={filterMood} onChange={e => setMood(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-600">
          <option value="">All Moods</option>
          {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterType} onChange={e => setType(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-600">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <motion.div key={r._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${!r.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                  style={{ background: TYPE_COLORS[r.type] || '#6366f1' }}>
                  {r.type}
                </span>
                <span className="text-xs text-gray-400 capitalize">{r.mood}</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{r.title}</h3>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{r.description}</p>
              {r.author && <p className="text-xs text-gray-400">by {r.author}</p>}
              {r.duration && <p className="text-xs text-gray-400">⏱ {r.duration}</p>}
              <div className="flex items-center justify-between mt-3">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline">Open →</a>
                ) : <span />}
                <button onClick={() => handleDelete(r._id)}
                  className="text-xs text-red-400 hover:text-red-600">Remove</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
