'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DebateSession } from '@/lib/types'

function ScoreBar({ label, value, max = 20 }: { label: string; value: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 text-xs w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-purple-100 h-3 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-700 rounded-full"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-purple-500 text-xs w-10 text-right font-bold">{value}/{max}</span>
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
    win: { label: '勝利！', emoji: '🏆', color: 'text-yellow-500' },
    lose: { label: '敗北...', emoji: '💀', color: 'text-red-400' },
    draw: { label: '引き分け', emoji: '🤝', color: 'text-blue-500' },
    invalid: { label: '判定不能', emoji: '❓', color: 'text-gray-400' },
  }

  const config = resultConfig[session.result || 'invalid']

  const commentParts = session.judgeComment?.split('\n\n') || []

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 space-y-4 relative">
      {/* Result header */}
      <div className="rpg-panel p-6 text-center">
        <div className="text-6xl mb-3">{config.emoji}</div>
        <h1 className={`text-2xl font-black ${config.color} mb-2 title-glow`}
            style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: '1.5rem', lineHeight: '2' }}>
          {config.label}
        </h1>
        <p className="text-gray-400 text-xs">{session.topic}</p>
        {session.endReason === 'ai_surrender' && (
          <span className="inline-block mt-2 px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-500 text-xs rounded-full font-bold">
            AI降参勝ち
          </span>
        )}
        {session.endReason === 'user_surrender' && (
          <span className="inline-block mt-2 px-3 py-1 bg-red-50 border border-red-200 text-red-400 text-xs rounded-full font-bold">
            ギブアップ負け
          </span>
        )}
      </div>

      {/* Score */}
      {session.score !== undefined && session.result !== 'invalid' && (
        <div className="rpg-panel p-4 space-y-3">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-purple-500 text-sm font-bold">スコア</h2>
            <span className="text-2xl font-bold text-gray-700">{session.score}<span className="text-gray-400 text-sm">/100</span></span>
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
          <h2 className="text-purple-500 text-sm font-bold mb-3">⚖️ 判定コメント</h2>
          {commentParts.map((part, i) => (
            <p key={i} className="text-gray-600 text-xs leading-relaxed">{part}</p>
          ))}
        </div>
      )}

      {hasError && (
        <div className="rpg-panel p-4 bg-red-50 border-red-200">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-purple-400">Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}
