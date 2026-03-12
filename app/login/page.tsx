'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { setUser } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'select' | 'nickname'>('select')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const handleGuestStart = () => setStep('nickname')

  const handleNicknameSubmit = () => {
    const name = nickname.trim()
    if (!name) { setError('ニックネームを入力してください'); return }
    if (name.length > 12) { setError('12文字以内で入力してください'); return }
    setUser({ nickname: name, authProvider: 'guest', createdAt: Date.now() })
    router.replace('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, rgba(132,94,247,0.06) 0%, transparent 70%)' }} />

      <div className="text-center mb-10 relative">
        <Image src="/logo.svg" alt="論破道場" width={260} height={76} priority className="mx-auto" />
        <p className="text-purple-400 text-xs mt-2 tracking-widest font-bold">RONPA DOJO</p>
        <p className="text-gray-400 text-xs mt-4">AIとの知的バトル、始まる。</p>
      </div>

      <div className="w-full max-w-sm">
        {step === 'select' ? (
          <div className="rpg-panel p-6 space-y-4">
            <p className="text-purple-500 text-sm text-center mb-6 tracking-wider font-bold">開始方法を選択</p>

            <button onClick={handleGuestStart}
                    className="rpg-btn w-full py-4 text-sm flex items-center justify-between">
              <span>👤 ゲストで始める</span>
              <span className="text-white/70">▶</span>
            </button>

            <button disabled className="rpg-btn w-full py-4 text-sm flex items-center justify-between opacity-30">
              <span>🔷 Googleでログイン</span>
              <span className="text-white/70">—</span>
            </button>

            <button disabled className="rpg-btn w-full py-4 text-sm flex items-center justify-between opacity-30">
              <span>🐦 Xでログイン</span>
              <span className="text-white/70">—</span>
            </button>

            <p className="text-gray-400 text-xs text-center mt-4">※ Google/Xログインは今後対応予定</p>
          </div>
        ) : (
          <div className="rpg-panel p-6">
            <p className="text-purple-500 text-sm text-center mb-6 tracking-wider font-bold">ニックネームを入力</p>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => { setNickname(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleNicknameSubmit()}
                  placeholder="例：論破太郎"
                  maxLength={12}
                  className="w-full px-4 py-3 text-sm rounded-xl"
                  autoFocus
                />
                <div className="flex justify-between mt-1">
                  <p className="text-red-400 text-xs">{error}</p>
                  <p className="text-gray-400 text-xs">{nickname.length}/12</p>
                </div>
              </div>

              <p className="text-orange-400 text-xs">
                ⚠️ ゲストモードではデータはこのブラウザにのみ保存されます。ブラウザのデータを削除するとデータが消えます。
              </p>

              <button onClick={handleNicknameSubmit}
                      className="rpg-btn w-full py-4 text-sm">
                決定して始める ▶
              </button>

              <button onClick={() => setStep('select')}
                      className="rpg-btn rpg-btn-danger w-full py-3 text-xs">
                ← 戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
