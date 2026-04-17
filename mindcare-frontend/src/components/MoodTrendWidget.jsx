import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useNavigate } from 'react-router-dom'

const TREND_CONFIG = {
  improving: { icon: '↑', label: 'Improving', color: '#10b981', bg: '#10b98122', border: '#10b98144' },
  declining:  { icon: '↓', label: 'Declining',  color: '#ef4444', bg: '#ef444422', border: '#ef444444' },
  stable:     { icon: '→', label: 'Stable',     color: '#f59e0b', bg: '#f59e0b22', border: '#f59e0b44' },
}

const RISK_CONFIG = {
  low:    { label: 'Low Risk',    color: '#10b981', bg: '#10b98115', dot: '#10b981' },
  medium: { label: 'Medium Risk', color: '#f59e0b', bg: '#f59e0b15', dot: '#f59e0b' },
  high:   { label: 'High Risk',   color: '#ef4444', bg: '#ef444415', dot: '#ef4444' },
}

const SCORE_LABELS = { 1: 'Very Low', 2: 'Low', 3: 'Moderate', 4: 'Good', 5: 'Great' }

export default function MoodTrendWidget({ analytics, onRiskAction }) {
  const navigate = useNavigate()

  if (!analytics) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-6 rounded-3xl"
        style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--mood-primary)' }}>
          📊 Mood Analytics
        </h3>
        <p className="text-sm opacity-50 text-center py-6" style={{ color: 'var(--mood-text)' }}>
          Log your mood to see trends and insights
        </p>
      </motion.div>
    )
  }

  const { trend, risk, weightedScore, currentAvg, dailyChart } = analytics
  const trendCfg = TREND_CONFIG[trend?.trend] || TREND_CONFIG.stable
  const riskCfg = RISK_CONFIG[risk?.level] || RISK_CONFIG.low

  // Chart data — fill nulls with previous value for continuity
  const chartData = (dailyChart || []).map(d => ({
    date: d.date?.slice(5), // MM-DD
    score: d.avg,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length && payload[0].value !== null) {
      const v = payload[0].value
      return (
        <div className="px-3 py-2 rounded-xl text-xs"
          style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44', color: 'var(--mood-text)' }}>
          <p className="font-semibold">{label}</p>
          <p style={{ color: 'var(--mood-primary)' }}>Score: {v} — {SCORE_LABELS[Math.round(v)] || ''}</p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl space-y-5"
      style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)44' }}>

      <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--mood-primary)' }}>
        📊 Mood Analytics
      </h3>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Trend */}
        <div className="p-3 rounded-2xl text-center"
          style={{ background: trendCfg.bg, border: `1px solid ${trendCfg.border}` }}>
          <div className="text-2xl font-black" style={{ color: trendCfg.color }}>{trendCfg.icon}</div>
          <p className="text-xs font-semibold mt-1" style={{ color: trendCfg.color }}>{trendCfg.label}</p>
          <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--mood-text)' }}>7-day trend</p>
        </div>

        {/* Weighted Score */}
        <div className="p-3 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--mood-primary)22' }}>
          <div className="text-2xl font-black" style={{ color: 'var(--mood-primary)' }}>
            {weightedScore ?? currentAvg ?? '—'}
          </div>
          <p className="text-xs font-semibold mt-1" style={{ color: 'var(--mood-primary)' }}>
            {weightedScore ? SCORE_LABELS[Math.round(weightedScore)] : 'Score'}
          </p>
          <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--mood-text)' }}>weighted avg</p>
        </div>

        {/* Risk */}
        <div className="p-3 rounded-2xl text-center"
          style={{ background: riskCfg.bg, border: `1px solid ${riskCfg.dot}44` }}>
          <div className="flex justify-center mb-1">
            <div className="w-3 h-3 rounded-full mt-1" style={{ background: riskCfg.dot }} />
          </div>
          <p className="text-xs font-semibold" style={{ color: riskCfg.color }}>{riskCfg.label}</p>
          <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--mood-text)' }}>current status</p>
        </div>
      </div>

      {/* 7-Day Chart */}
      {chartData.some(d => d.score !== null) && (
        <div>
          <p className="text-xs opacity-50 mb-2" style={{ color: 'var(--mood-text)' }}>7-day mood score</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--mood-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--mood-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'var(--mood-text)', opacity: 0.4, fontSize: 10 }}
                axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} hide />
              <ReferenceLine y={2.5} stroke="#ef444444" strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="var(--mood-primary)" strokeWidth={2}
                fill="url(#trendGrad)" connectNulls
                dot={{ fill: 'var(--mood-primary)', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs opacity-40 text-center mt-1" style={{ color: 'var(--mood-text)' }}>
            Red dashed line = risk threshold (2.5)
          </p>
        </div>
      )}

      {/* Trend delta */}
      {trend?.delta !== 0 && trend?.previous !== null && (
        <p className="text-xs opacity-60 text-center" style={{ color: 'var(--mood-text)' }}>
          {trend.delta > 0 ? '📈' : '📉'} {Math.abs(trend.delta)} point {trend.delta > 0 ? 'improvement' : 'decline'} vs last week
        </p>
      )}

      {/* HIGH RISK ALERT */}
      <AnimatePresence>
        {risk?.level === 'high' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl"
            style={{ background: '#ef444415', border: '1px solid #ef444466' }}>
            <div className="flex items-start gap-3">
              <motion.span className="text-2xl"
                animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                ⚠️
              </motion.span>
              <div className="flex-1">
                <p className="font-bold text-sm text-red-400">Mental Health Risk Detected</p>
                <p className="text-xs opacity-70 mt-0.5 text-red-300">{risk.reason}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigate('/counselors')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: '#ef4444' }}>
                    🧑‍⚕️ Book Counselor
                  </button>
                  <button onClick={() => navigate('/emergency')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444' }}>
                    🚨 Emergency
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEDIUM RISK nudge */}
      {risk?.level === 'medium' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-3 rounded-2xl flex items-center gap-3"
          style={{ background: '#f59e0b15', border: '1px solid #f59e0b44' }}>
          <span className="text-xl">💛</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-yellow-400">Your mood has been low recently</p>
            <p className="text-xs opacity-60 text-yellow-300 mt-0.5">Consider talking to a counselor</p>
          </div>
          <button onClick={() => navigate('/counselors')}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44' }}>
            Book
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
