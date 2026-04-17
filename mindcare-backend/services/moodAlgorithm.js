/**
 * MindCare AI – Mood Algorithm Service
 * Handles: moving average, trend detection, weighted score, risk detection, sentiment analysis
 */

const MoodLog = require('../models/Mood')
const User = require('../models/User')

const MOOD_SCORES = { happy: 5, tired: 3, anxious: 2, angry: 2, sad: 1 }

// ─── NEGATIVE SENTIMENT WORDS ────────────────────────────────────────────────
const NEGATIVE_WORDS = [
  'sad', 'depressed', 'hopeless', 'worthless', 'empty', 'numb', 'tired', 'exhausted',
  'anxious', 'scared', 'afraid', 'panic', 'stressed', 'overwhelmed', 'angry', 'furious',
  'hate', 'useless', 'failure', 'alone', 'lonely', 'cry', 'crying', 'hurt', 'pain',
  'suffer', 'miserable', 'terrible', 'awful', 'horrible', 'dying', 'dead', 'kill',
  'suicide', 'harm', 'give up', 'cant cope', "can't cope", 'no point', 'no hope'
]
const POSITIVE_WORDS = [
  'happy', 'great', 'good', 'amazing', 'wonderful', 'excited', 'joy', 'love', 'grateful',
  'thankful', 'calm', 'peaceful', 'relaxed', 'confident', 'strong', 'better', 'improving',
  'hopeful', 'motivated', 'energetic', 'proud', 'smile', 'laugh', 'fun', 'enjoy'
]

/**
 * Simple sentiment analysis on text
 * Returns score between -1 (very negative) and +1 (very positive)
 */
function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') return 0
  const lower = text.toLowerCase()
  let score = 0
  NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score -= 1 })
  POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score += 1 })
  // Normalize to -1..1
  const maxPossible = Math.max(NEGATIVE_WORDS.length, POSITIVE_WORDS.length)
  return Math.max(-1, Math.min(1, score / maxPossible * 5))
}

/**
 * Weighted mood score — recent entries get higher weight
 * weights: [0.05, 0.08, 0.10, 0.12, 0.15, 0.20, 0.30] for oldest→newest (7 entries)
 */
function computeWeightedScore(logs) {
  if (!logs.length) return null
  const weights = [0.05, 0.08, 0.10, 0.12, 0.15, 0.20, 0.30]
  // Pad or trim to 7
  const padded = logs.slice(-7)
  const w = weights.slice(weights.length - padded.length)
  const totalWeight = w.reduce((a, b) => a + b, 0)
  const weighted = padded.reduce((sum, log, i) => sum + log.score * w[i], 0)
  return parseFloat((weighted / totalWeight).toFixed(2))
}

/**
 * Simple moving average of last N entries
 */
function movingAverage(logs, n = 7) {
  if (!logs.length) return null
  const slice = logs.slice(-n)
  const avg = slice.reduce((s, l) => s + l.score, 0) / slice.length
  return parseFloat(avg.toFixed(2))
}

/**
 * Trend detection: compare last 7 days avg vs previous 7 days avg
 * Returns: { trend: 'improving'|'declining'|'stable', current, previous, delta }
 */
function detectTrend(recentLogs, previousLogs) {
  const current = movingAverage(recentLogs, 7)
  const previous = movingAverage(previousLogs, 7)

  if (current === null) return { trend: 'stable', current: null, previous: null, delta: 0 }
  if (previous === null) return { trend: 'stable', current, previous: null, delta: 0 }

  const delta = parseFloat((current - previous).toFixed(2))
  let trend = 'stable'
  if (delta >= 0.5) trend = 'improving'
  else if (delta <= -0.5) trend = 'declining'

  return { trend, current, previous, delta }
}

/**
 * Risk detection:
 * HIGH if: 3+ consecutive low scores (≤2) OR weighted avg < 2.5
 * MEDIUM if: weighted avg < 3.5 OR 2 consecutive low scores
 * LOW otherwise
 */
function detectRisk(logs) {
  if (!logs.length) return { level: 'low', reason: null }

  const weighted = computeWeightedScore(logs)
  const recent = logs.slice(-5) // last 5 entries

  // Count consecutive low scores from the end
  let consecutiveLow = 0
  for (let i = recent.length - 1; i >= 0; i--) {
    if (recent[i].score <= 2) consecutiveLow++
    else break
  }

  if (consecutiveLow >= 3 || (weighted !== null && weighted < 2.5)) {
    return {
      level: 'high',
      reason: consecutiveLow >= 3
        ? `${consecutiveLow} consecutive low mood entries detected`
        : `Weighted mood average is critically low (${weighted})`
    }
  }

  if (consecutiveLow >= 2 || (weighted !== null && weighted < 3.5)) {
    return {
      level: 'medium',
      reason: consecutiveLow >= 2
        ? 'Multiple low mood entries recently'
        : `Mood average below normal (${weighted})`
    }
  }

  return { level: 'low', reason: null }
}

/**
 * Full analytics for a user
 */
async function getUserMoodAnalytics(userId) {
  const now = new Date()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000)

  const [recentLogs, previousLogs, allRecent] = await Promise.all([
    MoodLog.find({ userId, loggedAt: { $gte: sevenDaysAgo } }).sort({ loggedAt: 1 }),
    MoodLog.find({ userId, loggedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }).sort({ loggedAt: 1 }),
    MoodLog.find({ userId }).sort({ loggedAt: -1 }).limit(30)
  ])

  const trendData = detectTrend(recentLogs, previousLogs)
  const riskData = detectRisk(allRecent)
  const weightedScore = computeWeightedScore(allRecent.slice(0, 7).reverse())
  const currentAvg = movingAverage(recentLogs, 7)

  // Daily breakdown for chart (last 7 days)
  const dailyMap = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dailyMap[key] = { date: key, scores: [], avg: null }
  }
  recentLogs.forEach(log => {
    const key = log.loggedAt.toISOString().split('T')[0]
    if (dailyMap[key]) dailyMap[key].scores.push(log.score)
  })
  const dailyChart = Object.values(dailyMap).map(d => ({
    date: d.date,
    avg: d.scores.length ? parseFloat((d.scores.reduce((a, b) => a + b, 0) / d.scores.length).toFixed(2)) : null,
    mood: d.scores.length ? (d.scores.reduce((a, b) => a + b, 0) / d.scores.length >= 4 ? 'happy' : d.scores.reduce((a, b) => a + b, 0) / d.scores.length >= 3 ? 'tired' : d.scores.reduce((a, b) => a + b, 0) / d.scores.length >= 2 ? 'anxious' : 'sad') : null
  }))

  return {
    trend: trendData,
    risk: riskData,
    weightedScore,
    currentAvg,
    dailyChart,
    totalLogs: allRecent.length,
    recentLogs: allRecent.slice(0, 7)
  }
}

/**
 * Process a new mood entry: compute score, sentiment, risk, update user
 */
async function processMoodEntry(userId, mood, note = '') {
  const score = MOOD_SCORES[mood] || 3
  const sentimentScore = analyzeSentiment(note)

  // Adjust score slightly based on sentiment (-0.5 to +0.5)
  const adjustedScore = Math.max(1, Math.min(5, score + sentimentScore * 0.5))

  // Get recent logs for risk detection
  const recentLogs = await MoodLog.find({ userId }).sort({ loggedAt: -1 }).limit(10)

  // Create the new log entry (not saved yet — caller saves)
  const tempLogs = [{ score: adjustedScore }, ...recentLogs]
  const riskData = detectRisk(tempLogs)

  // Update user risk level
  await User.findByIdAndUpdate(userId, { riskLevel: riskData.level, currentMood: mood })

  return {
    score: parseFloat(adjustedScore.toFixed(2)),
    sentimentScore: parseFloat(sentimentScore.toFixed(3)),
    riskLevel: riskData.level,
    riskReason: riskData.reason
  }
}

module.exports = {
  analyzeSentiment,
  computeWeightedScore,
  movingAverage,
  detectTrend,
  detectRisk,
  getUserMoodAnalytics,
  processMoodEntry,
  MOOD_SCORES
}
