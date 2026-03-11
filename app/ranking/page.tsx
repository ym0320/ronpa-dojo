'use client'
import { useRouter } from 'next/navigation'

export default function RankingPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="rpg-btn px-3 py-2 text-xs">← 戻る</button>
        <h1 className="text-green-400 text-sm font-bold">🏆 ランキング</h1>
      </div>
      <div className="rpg-panel p-8 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <p className="text-gray-400 text-sm">ランキング機能は近日公開予定です</p>
        <p className="text-gray-600 text-xs mt-2">アカウント連携機能の実装後に対応します</p>
      </div>
    </div>
  )
}
