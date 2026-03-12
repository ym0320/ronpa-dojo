'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
    <div className="min-h-screen flex flex-col items-center justify-between py-8 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,107,157,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(132,94,247,0.08) 0%, transparent 50%)' }} />

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
          <Image src="/logo.svg" alt="論破道場" width={320} height={93} priority className="mx-auto" />
          <p className="text-purple-400 text-xs mt-3 tracking-widest font-bold">RONPA DOJO</p>
        </div>
        <p className="text-gray-400 text-xs mt-4">AIとの知的バトル、始まる。</p>
      </div>

      {/* AI Avatar */}
      <div className="my-4 flex flex-col items-center">
        <div className="relative w-24 h-24 rpg-panel flex items-center justify-center text-5xl">
          <span>🤖</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full blink" />
        </div>
        <p className="text-purple-400 text-xs mt-2 font-bold">「かかってきなよ」</p>
      </div>

      {/* Command buttons */}
      <div className="w-full max-w-sm rpg-panel p-4 space-y-3">
        <p className="text-purple-400 text-xs mb-4 text-center tracking-widest font-bold">コマンドを選択</p>

        <button onClick={() => router.push('/debate/setup')}
                className="rpg-btn w-full text-sm py-4 flex items-center justify-between">
          <span>⚔️ はじめる</span>
          <span className="text-white/70">▶</span>
        </button>

        <button
          onClick={() => hasSuspended && router.push('/debate/resume')}
          disabled={!hasSuspended}
          className="rpg-btn w-full text-sm py-4 flex items-center justify-between"
        >
          <span>💾 続きから</span>
          <span className="text-white/70">{hasSuspended ? '▶' : '—'}</span>
        </button>

        <button onClick={() => router.push('/history')}
                className="rpg-btn w-full text-sm py-4 flex items-center justify-between">
          <span>📜 履歴</span>
          <span className="text-white/70">▶</span>
        </button>

        <button onClick={() => router.push('/settings')}
                className="rpg-btn w-full text-sm py-4 flex items-center justify-between">
          <span>⚙️ 設定</span>
          <span className="text-white/70">▶</span>
        </button>
      </div>

      <div className="text-gray-400 text-xs text-center mt-4">
        © 2024 論破道場
      </div>
    </div>
  )
}
