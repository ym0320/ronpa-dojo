import { DebateSession, UserProfile, UserStats, Badge } from './types'

const KEYS = {
  USER: 'ronpa_user',
  STATS: 'ronpa_stats',
  HISTORY: 'ronpa_history',
  SUSPENDED: 'ronpa_suspended',
  BADGES: 'ronpa_badges',
  SOUND: 'ronpa_sound',
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// User
export const getUser = (): UserProfile | null => safeGet(KEYS.USER, null)
export const setUser = (user: UserProfile) => safeSet(KEYS.USER, user)
export const clearUser = () => { if (typeof window !== 'undefined') localStorage.removeItem(KEYS.USER) }

// Stats
export const getStats = (): UserStats => safeGet(KEYS.STATS, {
  totalDebates: 0, wins: 0, losses: 0, draws: 0,
  winRate: 0, avgScore: 0, maxScore: 0,
  currentStreak: 0, maxStreak: 0,
  categoryWins: {}, categoryDebates: {},
})
export const setStats = (stats: UserStats) => safeSet(KEYS.STATS, stats)

// History
export const getHistory = (): DebateSession[] => safeGet(KEYS.HISTORY, [])
export const addToHistory = (session: DebateSession) => {
  const history = getHistory()
  const idx = history.findIndex(h => h.id === session.id)
  if (idx >= 0) history[idx] = session
  else history.unshift(session)
  safeSet(KEYS.HISTORY, history.slice(0, 100))
}
export const getHistoryItem = (id: string): DebateSession | null =>
  getHistory().find(h => h.id === id) ?? null

// Suspended
export const getSuspended = (): DebateSession | null => safeGet(KEYS.SUSPENDED, null)
export const setSuspended = (session: DebateSession) => safeSet(KEYS.SUSPENDED, session)
export const clearSuspended = () => { if (typeof window !== 'undefined') localStorage.removeItem(KEYS.SUSPENDED) }

// Badges
export const getBadges = (): Badge[] => safeGet(KEYS.BADGES, [])
export const addBadge = (badge: Badge) => {
  const badges = getBadges()
  if (!badges.find(b => b.type === badge.type)) {
    badges.push(badge)
    safeSet(KEYS.BADGES, badges)
    return true
  }
  return false
}

// Sound
export const getSoundEnabled = (): boolean => safeGet(KEYS.SOUND, true)
export const setSoundEnabled = (v: boolean) => safeSet(KEYS.SOUND, v)

// Update stats after debate
export const updateStatsAfterDebate = (session: DebateSession) => {
  const stats = getStats()
  stats.totalDebates++
  if (session.result === 'win') {
    stats.wins++
    stats.currentStreak++
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak
  } else if (session.result === 'lose') {
    stats.losses++
    stats.currentStreak = 0
  } else if (session.result === 'draw') {
    stats.draws++
    stats.currentStreak = 0
  }
  stats.winRate = stats.totalDebates > 0 ? Math.round(stats.wins / stats.totalDebates * 100) : 0
  if (session.score) {
    const totalScore = stats.avgScore * (stats.totalDebates - 1) + session.score
    stats.avgScore = Math.round(totalScore / stats.totalDebates)
    if (session.score > stats.maxScore) stats.maxScore = session.score
  }
  stats.categoryDebates[session.category] = (stats.categoryDebates[session.category] || 0) + 1
  if (session.result === 'win') {
    stats.categoryWins[session.category] = (stats.categoryWins[session.category] || 0) + 1
  }
  setStats(stats)
  return stats
}
