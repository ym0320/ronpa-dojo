'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/storage'

export default function HomePage() {
  const router = useRouter()
  const [hasSuspended, setHasSuspended] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
      return
    }
    const suspended = localStorage.getItem('ronpa_suspended')
    setHasSuspended(!!suspended)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 px-4 relative overflow-hidden scanlines">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Ranking button */}
      <div className="w-full flex justify-between items-start">
        <button
          onClick={() => router.push('/ranking')}
          className="rpg-btn text-xs px-3 py-2"
        >
          🏆 ランキング
        </button>
        <div className="w-8" />
      </div>

      {/* Title */}
      <div className="text-center my-6">
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 title-glow"
              style={{ fontFamily: "'Press Start 2P', monospace", lineHeight: '1.4' }}>
            論破王
          </h1>
          <p className="text-green-600 text-xs mt-3 tracking-widest">RONPA-OH</p>
        </div>
        <p className="text-gray-400 text-xs mt-4">AIとの知的バトル、始まる。</p>
      </div>

      {/* AI Avatar */}
      <div className="my-4 flex flex-col items-center">
        <div className="relative w-24 h-24 rpg-panel flex items-center justify-center text-5xl"
             style={{ imageRendering: 'pixelated' }}>
          <span>🤖</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full blink" />
        </div>
        <p className="text-green-600 text-xs mt-2">「かかってきなよ」</p>
      </div>

      {/* Command buttons */}
      <div className="w-full max-w-sm rpg-panel p-4 space-y-3">
        <p className="text-green-600 text-xs mb-4 text-center tracking-widest">▶ コマンドを選択</p>

        <button onClick={() => router.push('/debate/setup')}
                className="rpg-btn w-full text-sm py-4 flex items-center justify-between">
          <span>⚔️ はじめる</span>
          <span className="text-green-600">▶</span>
        </button>

        <button
          onClick={() => hasSuspended && router.push('/debate/resume')}
          disabled={!hasSuspended}
          className="rpg-btn w-full text-sm py-4 flex items-center justify-between"
        >
          <span>💾 続きから</span>
          <span className="text-green-600">{hasSuspended ? '▶' : '—'}</span>
        </button>

        <button onClick={() => router.push('/history')}
                className="rpg-btn w-full text-sm py-4 flex items-center justify-between">
          <span>📜 履歴</span>
          <span className="text-green-600">▶</span>
        </button>

        <button onClick={() => router.push('/settings')}
                className="rpg-btn w-full text-sm py-4 flex items-center justify-between">
          <span>⚙️ 設定</span>
          <span className="text-green-600">▶</span>
        </button>
      </div>

      <div className="text-gray-600 text-xs text-center mt-4">
        © 2024 論破王
      </div>
    </div>
  )
}
