export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  turnNumber: number
  createdAt: number
}

export interface DebateSession {
  id: string
  topic: string
  category: string
  userStance: string
  aiStance: string
  firstTurn: 'user' | 'ai'
  messages: Message[]
  currentTurn: number
  status: 'active' | 'completed' | 'suspended'
  endReason?: 'timeout' | 'ai_surrender' | 'user_surrender' | 'user_quit'
  result?: 'win' | 'lose' | 'draw' | 'invalid'
  score?: number
  scoreLogic?: number
  scoreEvidence?: number
  scorePersuasion?: number
  scoreConsistency?: number
  scoreRebuttal?: number
  judgeComment?: string
  createdAt: number
  updatedAt: number
}

export interface UserProfile {
  nickname: string
  authProvider: 'guest'
  createdAt: number
}

export interface UserStats {
  totalDebates: number
  wins: number
  losses: number
  draws: number
  winRate: number
  avgScore: number
  maxScore: number
  currentStreak: number
  maxStreak: number
  categoryWins: Record<string, number>
  categoryDebates: Record<string, number>
}

export interface Badge {
  type: string
  name: string
  description: string
  earnedAt: number
}
