'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addToHistory, updateStatsAfterDebate } from '@/lib/storage'
import { checkAndAwardBadges } from '@/lib/badges'
import { DebateSession } from '@/lib/types'

function JudgingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId') || ''
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('議論ログを解析中...')

  useEffect(() => {
    const runJudging = async () => {
      const sessionData = localStorage.getItem(`debate_${sessionId}`)
      if (!sessionData) { router.replace('/'); return }

      const session: DebateSession = JSON.parse(sessionData)

      // Animate progress
      const steps = [
        { delay: 500, progress: 20, text: '各ターンを評価中...' },
        { delay: 1500, progress: 50, text: '採点基準を適用中...' },
        { delay: 2500, progress: 75, text: '勝敗を判定中...' },
        { delay: 3500, progress: 90, text: 'フィードバックを生成中...' },
      ]

      steps.forEach(({ delay, progress: p, text }) => {
        setTimeout(() => { setProgress(p); setStatusText(text) }, delay)
      })

      try {
        const res = await fetch('/api/judge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: session.topic,
            userStance: session.userStance,
            aiStance: session.aiStance,
            firstTurn: session.firstTurn,
            messages: session.messages,
            endReason: session.endReason,
          }),
        })

        const judgeResult = await res.json()

        const completedSession: DebateSession = {
          ...session,
          result: judgeResult.result,
          score: judgeResult.score,
          scoreLogic: judgeResult.scoreLogic,
          scoreEvidence: judgeResult.scoreEvidence,
          scorePersuasion: judgeResult.scorePersuasion,
          scoreConsistency: judgeResult.scoreConsistency,
          scoreRebuttal: judgeResult.scoreRebuttal,
          judgeComment: `${judgeResult.summary}\n\n【良かった点】${judgeResult.goodPoints}\n\n【改善点】${judgeResult.improvements}`,
          updatedAt: Date.now(),
        }

        addToHistory(completedSession)
        updateStatsAfterDebate(completedSession)
        checkAndAwardBadges(completedSession)
        localStorage.setItem(`debate_${sessionId}`, JSON.stringify(completedSession))

        setProgress(100)
        setStatusText('判定完了！')

        setTimeout(() => {
          router.push(`/debate/result?sessionId=${sessionId}`)
        }, 800)
      } catch (err) {
        console.error(err)
        router.push(`/debate/result?sessionId=${sessionId}&error=1`)
      }
    }

    runJudging()
  }, [sessionId, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative scanlines">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.05)_0%,transparent_70%)]" />

      <div className="text-center space-y-8 w-full max-w-sm">
        <div className="text-6xl animate-bounce">⚖️</div>
        <div>
          <h2 className="text-green-400 text-lg font-bold mb-2">判定中...</h2>
          <p className="text-gray-400 text-xs">{statusText}</p>
        </div>

        <div className="rpg-panel p-4">
          <div className="w-full bg-gray-800 h-4 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-green-400 text-xs text-center mt-2">{progress}%</p>
        </div>

        <p className="text-gray-600 text-xs">審判AIが議論を分析しています...</p>
      </div>
    </div>
  )
}

export default function JudgingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-green-400">Loading...</div>}>
      <JudgingContent />
    </Suspense>
  )
}
