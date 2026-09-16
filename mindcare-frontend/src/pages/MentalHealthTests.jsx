import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../lib/api'

// ─── TEST DEFINITIONS ─────────────────────────────────────────────────────────

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
]

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things, such as reading or watching TV',
  'Moving or speaking so slowly that other people could have noticed',
  'Thoughts that you would be better off dead, or of hurting yourself',
]

const ANSWER_OPTIONS = [
  { label: 'Not at all',        score: 0 },
  { label: 'Several days',      score: 1 },
  { label: 'More than half the days', score: 2 },
  { label: 'Nearly every day',  score: 3 },
]

const SEVERITY_STYLES = {
  minimal:           { color: '#10b981', bg: '#ecfdf5', label: 'Minimal' },
  mild:              { color: '#f59e0b', bg: '#fffbeb', label: 'Mild' },
  moderate:          { color: '#f97316', bg: '#fff7ed', label: 'Moderate' },
  moderately_severe: { color: '#ef4444', bg: '#fef2f2', label: 'Moderately Severe' },
  severe:            { color: '#7f1d1d', bg: '#fef2f2', label: 'Severe' },
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function MentalHealthTests() {
  const [activeTest, setActiveTest]   = useState(null) // 'GAD-7' | 'PHQ-9'
  const [answers, setAnswers]         = useState([])
  const [currentQ, setCurrentQ]       = useState(0)
  const [result, setResult]           = useState(null)
  const [history, setHistory]         = useState([])
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => {
    api.get('/api/tests/my-results')
      .then(r => setHistory(r.data.results || []))
      .catch(() => {})
  }, [])

  const questions = activeTest === 'GAD-7' ? GAD7_QUESTIONS : PHQ9_QUESTIONS

  const startTest = (type) => {
    setActiveTest(type)
    setAnswers([])
    setCurrentQ(0)
    setResult(null)
  }

  const handleAnswer = (score) => {
    const newAnswers = [...answers, { question: questions[currentQ], score }]
    setAnswers(newAnswers)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      submitTest(newAnswers)
    }
  }

  const submitTest = async (finalAnswers) => {
    setSubmitting(true)
    try {
      const res = await api.post('/api/tests/submit', {
        testType: activeTest,
        answers: finalAnswers
      })
      setResult(res.data.result)
      setHistory(prev => [res.data.result, ...prev])
      toast.success('Test completed!')
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to save result')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setActiveTest(null)
    setAnswers([])
    setCurrentQ(0)
    setResult(null)
  }

  const progress = activeTest ? Math.round((currentQ / questions.length) * 100) : 0

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--mood-bg)' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--mood-text)' }}>🧪 Mental Health Tests</h1>
          <p className="opacity-60 text-sm" style={{ color: 'var(--mood-text)' }}>
            Clinically validated screening tools. Results are private and stored securely.
          </p>
        </div>

        {/* Test Selection */}
        {!activeTest && !result && (
          <div className="space-y-4">
            {[
              { type: 'GAD-7', title: 'GAD-7 Anxiety Scale', desc: 'Measures generalized anxiety disorder severity. 7 questions, ~2 minutes.', icon: '😰', color: '#8b5cf6' },
              { type: 'PHQ-9', title: 'PHQ-9 Depression Scale', desc: 'Screens for depression and measures severity. 9 questions, ~3 minutes.', icon: '😔', color: '#3b82f6' },
            ].map(t => (
              <motion.div key={t.type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => startTest(t.type)}
                className="p-6 rounded-3xl cursor-pointer"
                style={{ background: 'var(--mood-surface)', border: `1px solid ${t.color}44` }}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{t.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--mood-text)' }}>{t.title}</h3>
                    <p className="text-sm opacity-60 mt-1" style={{ color: 'var(--mood-text)' }}>{t.desc}</p>
                  </div>
                  <span className="text-2xl opacity-40" style={{ color: 'var(--mood-text)' }}>→</span>
                </div>
              </motion.div>
            ))}

            {/* History */}
            {history.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--mood-primary)' }}>
                  Previous Results
                </h2>
                <div className="space-y-3">
                  {history.slice(0, 5).map(r => {
                    const s = SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.minimal
                    return (
                      <div key={r._id} className="p-4 rounded-2xl flex items-center justify-between"
                        style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)22' }}>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--mood-text)' }}>{r.testType}</p>
                          <p className="text-xs opacity-50" style={{ color: 'var(--mood-text)' }}>
                            Score: {r.totalScore} • {new Date(r.takenAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Test */}
        {activeTest && !result && (
          <div>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'var(--mood-text)' }}>
                  {activeTest} — Question {currentQ + 1} of {questions.length}
                </span>
                <button onClick={reset} className="text-xs opacity-50 hover:opacity-100"
                  style={{ color: 'var(--mood-text)' }}>✕ Cancel</button>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'var(--mood-primary)' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQ}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="p-6 rounded-3xl mb-6"
                style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}>
                <p className="text-sm opacity-60 mb-2" style={{ color: 'var(--mood-text)' }}>
                  Over the last 2 weeks, how often have you been bothered by:
                </p>
                <h3 className="text-xl font-bold" style={{ color: 'var(--mood-text)' }}>
                  {questions[currentQ]}
                </h3>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-3">
              {ANSWER_OPTIONS.map(opt => (
                <motion.button key={opt.score} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => !submitting && handleAnswer(opt.score)}
                  disabled={submitting}
                  className="w-full p-4 rounded-2xl text-left font-medium transition-all"
                  style={{
                    background: 'var(--mood-surface)',
                    border: '1px solid var(--mood-primary)33',
                    color: 'var(--mood-text)'
                  }}>
                  <span className="inline-block w-6 h-6 rounded-full text-center text-xs leading-6 mr-3 font-bold"
                    style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                    {opt.score}
                  </span>
                  {opt.label}
                </motion.button>
              ))}
            </div>

            {submitting && (
              <p className="text-center mt-4 opacity-60 text-sm" style={{ color: 'var(--mood-text)' }}>
                ⏳ Saving your results...
              </p>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {(() => {
              const s = SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.minimal
              return (
                <div className="p-6 rounded-3xl text-center"
                  style={{ background: 'var(--mood-surface)', border: `2px solid ${s.color}` }}>
                  <div className="text-5xl mb-4">
                    {result.severity === 'minimal' ? '🌟' : result.severity === 'mild' ? '💛' : result.severity === 'moderate' ? '🟠' : '🔴'}
                  </div>
                  <h2 className="text-2xl font-black mb-2" style={{ color: s.color }}>{s.label}</h2>
                  <p className="text-sm opacity-60 mb-4" style={{ color: 'var(--mood-text)' }}>
                    {result.testType} Score: <strong style={{ color: s.color }}>{result.totalScore}</strong>
                  </p>
                  <div className="p-4 rounded-2xl mb-6 text-left"
                    style={{ background: `${s.color}11`, border: `1px solid ${s.color}44` }}>
                    <p className="text-sm" style={{ color: 'var(--mood-text)' }}>{result.recommendation}</p>
                  </div>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button onClick={reset}
                      className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                      style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                      Take Another Test
                    </button>
                    {['moderate', 'moderately_severe', 'severe'].includes(result.severity) && (
                      <a href="/counselors"
                        className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                        style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444' }}>
                        🧑‍⚕️ Book Counselor
                      </a>
                    )}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
