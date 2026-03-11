'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getHistory } from '@/lib/storage'
import { DebateSession } from '@/lib/types'

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<DebateSession[]>([])
  const [filter, setFilter] = useState<'all' | 'win' | 'lose' | 'draw'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setHistory(getHistory().filter(h => h.status === 'completed'))
  }, [])

  const filtered = filter === 'all' ? history : history.filter(h => h.result === filter)

  const resultLabel: Record<string, string> = { win: '勝ち', lose: '負け', draw: '引き分け', invalid: '判定不能' }
  const resultColor: Record<string, string> = { win: 'text-yellow-400', lose: 'text-red-400', draw: 'text-blue-400', invalid: 'text-gray-400' }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="rpg-btn px-3 py-2 text-xs">← 戻る</button>
        <h1 className="text-green-400 text-sm font-bold">📜 議論履歴</h1>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'win', 'lose', 'draw'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`rpg-btn px-3 py-1.5 text-xs ${filter === f ? 'pixel-border-accent' : ''}`}>
            {f === 'all' ? '全て' : f === 'win' ? '勝ち' : f === 'lose' ? '負け' : '引き分け'}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rpg-panel p-8 text-center">
          <p className="text-gray-500 text-sm">履歴がありません</p>
          <button onClick={() => router.push('/debate/setup')} className="rpg-btn mt-4 px-4 py-2 text-xs">
            議論を始める
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(session => (
          <div key={session.id} className="rpg-panel overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              className="w-full p-4 text-left flex items-start justify-between gap-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-bold truncate">{session.topic}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(session.createdAt).toLocaleDateString('ja-JP')} · {session.category}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${resultColor[session.result || 'invalid']}`}>
                  {resultLabel[session.result || 'invalid']}
                </p>
                {session.score !== undefined && (
                  <p className="text-gray-400 text-xs">{session.score}点</p>
                )}
              </div>
            </button>

            {expandedId === session.id && (
              <div className="border-t border-gray-800 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-500">あなた: </span><span className="text-green-400">{session.userStance}</span></div>
                  <div><span className="text-gray-500">AI: </span><span className="text-red-400">{session.aiStance}</span></div>
                  <div><span className="text-gray-500">ターン数: </span><span className="text-white">{session.currentTurn}/15</span></div>
                  <div><span className="text-gray-500">終了: </span><span className="text-white">{session.endReason || '-'}</span></div>
                </div>

                {session.judgeComment && (
                  <div className="bg-gray-950 rounded p-3 text-xs text-gray-300 leading-relaxed">
                    {session.judgeComment.split('\n\n')[0]}
                  </div>
                )}

                <button
                  onClick={() => {
                    localStorage.setItem(`debate_${session.id}`, JSON.stringify(session))
                    router.push(`/debate/result?sessionId=${session.id}`)
                  }}
                  className="rpg-btn w-full py-2 text-xs"
                >
                  詳細を見る ▶
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
