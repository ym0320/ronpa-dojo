'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DebateSession } from '@/lib/types'

function ScoreBar({ label, value, max = 20 }: { label: string; value: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-xs w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-800 h-3 rounded overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-700"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-green-400 text-xs w-10 text-right">{value}/{max}</span>
    </div>
  )
}

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId') || ''
  const hasError = searchParams.get('error') === '1'
  const [session, setSession] = useState<DebateSession | null>(null)

  useEffect(() => {
    const data = localStorage.getItem(`debate_${sessionId}`)
    if (data) setSession(JSON.parse(data))
  }, [sessionId])

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">データが見つかりません</p>
    </div>
  )

  const resultConfig = {
    win: { label: '勝利！', emoji: '🏆', color: 'text-yellow-400', glow: 'shadow-yellow-400/50' },
    lose: { label: '敗北...', emoji: '💀', color: 'text-red-400', glow: 'shadow-red-400/50' },
    draw: { label: '引き分け', emoji: '🤝', color: 'text-blue-400', glow: 'shadow-blue-400/50' },
    invalid: { label: '判定不能', emoji: '❓', color: 'text-gray-400', glow: '' },
  }

  const config = resultConfig[session.result || 'invalid']

  const commentParts = session.judgeComment?.split('\n\n') || []

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 space-y-4 relative scanlines">
      {/* Result header */}
      <div className="rpg-panel p-6 text-center">
        <div className="text-6xl mb-3">{config.emoji}</div>
        <h1 className={`text-2xl font-bold ${config.color} mb-2`}
            style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '1.5rem', lineHeight: '2' }}>
          {config.label}
        </h1>
        <p className="text-gray-400 text-xs">{session.topic}</p>
        {session.endReason === 'ai_surrender' && (
          <span className="inline-block mt-2 px-2 py-1 bg-yellow-900/30 border border-yellow-700 text-yellow-400 text-xs">
            AI降参勝ち
          </span>
        )}
        {session.endReason === 'user_surrender' && (
          <span className="inline-block mt-2 px-2 py-1 bg-red-900/30 border border-red-700 text-red-400 text-xs">
            ギブアップ負け
          </span>
        )}
      </div>

      {/* Score */}
      {session.score !== undefined && session.result !== 'invalid' && (
        <div className="rpg-panel p-4 space-y-3">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-green-400 text-sm font-bold">スコア</h2>
            <span className="text-2xl font-bold text-white">{session.score}<span className="text-gray-500 text-sm">/100</span></span>
          </div>
          <ScoreBar label="論理性" value={session.scoreLogic || 0} />
          <ScoreBar label="根拠の強さ" value={session.scoreEvidence || 0} />
          <ScoreBar label="説得力" value={session.scorePersuasion || 0} />
          <ScoreBar label="一貫性" value={session.scoreConsistency || 0} />
          <ScoreBar label="反論の質" value={session.scoreRebuttal || 0} />
        </div>
      )}

      {/* Judge comment */}
      {session.judgeComment && (
        <div className="rpg-panel p-4 space-y-3">
          <h2 className="text-green-400 text-sm font-bold mb-3">⚖️ 判定コメント</h2>
          {commentParts.map((part, i) => (
            <p key={i} className="text-gray-300 text-xs leading-relaxed">{part}</p>
          ))}
        </div>
      )}

      {hasError && (
        <div className="rpg-panel p-4 bg-red-900/20 border-red-700">
          <p className="text-red-400 text-xs">判定中にエラーが発生しましたが、議論データは保存されました。</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pb-6">
        <button
          onClick={() => router.push('/debate/setup')}
          className="rpg-btn w-full py-4 text-sm"
        >
          ⚔️ 同じお題で再戦
        </button>
        <button
          onClick={() => router.push('/debate/setup')}
          className="rpg-btn w-full py-4 text-sm"
        >
          🎲 別のお題でやる
        </button>
        <button
          onClick={() => router.push('/')}
          className="rpg-btn rpg-btn-danger w-full py-3 text-sm"
        >
          🏠 ホームへ戻る
        </button>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-green-400">Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}
