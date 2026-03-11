import { getBadges, addBadge, getStats } from './storage'
import { DebateSession } from './types'
import { Badge } from './types'

const BADGE_DEFS: { type: string; name: string; description: string; check: (session: DebateSession, wins: number, total: number, streak: number, catWins: Record<string,number>) => boolean }[] = [
  { type: 'first_debate', name: '議論デビュー', description: '初めての議論を完了', check: (_, _w, total) => total === 1 },
  { type: 'first_win', name: '初勝利', description: '初めて勝利', check: (s) => s.result === 'win' },
  { type: 'ten_wins', name: '論客', description: '10勝達成', check: (_, wins) => wins >= 10 },
  { type: 'ai_surrender', name: '逆転の発想', description: 'AIを降参させた', check: (s) => s.endReason === 'ai_surrender' },
  { type: 'full_battle', name: '不屈の精神', description: '15ターンフルで戦い抜いて勝利', check: (s) => s.result === 'win' && s.endReason === 'timeout' },
  { type: 'streak5', name: '連勝街道', description: '5連勝達成', check: (_, _w, _t, streak) => streak >= 5 },
  { type: 'veteran', name: '鉄人', description: '50戦達成', check: (_, _w, total) => total >= 50 },
]

export function checkAndAwardBadges(session: DebateSession): Badge[] {
  const stats = getStats()
  const newBadges: Badge[] = []
  for (const def of BADGE_DEFS) {
    if (def.check(session, stats.wins, stats.totalDebates, stats.currentStreak, stats.categoryWins)) {
      const badge: Badge = { type: def.type, name: def.name, description: def.description, earnedAt: Date.now() }
      if (addBadge(badge)) newBadges.push(badge)
    }
  }
  return newBadges
}
