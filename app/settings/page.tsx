'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, setUser, getStats, getBadges, getSoundEnabled, setSoundEnabled } from '@/lib/storage'
import { UserProfile, UserStats, Badge } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [stats, setStatsState] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [soundEnabled, setSoundState] = useState(true)
  const [editingNick, setEditingNick] = useState(false)
  const [newNick, setNewNick] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/login'); return }
    setUserState(u)
    setNewNick(u.nickname)
    setStatsState(getStats())
    setBadges(getBadges())
    setSoundState(getSoundEnabled())
  }, [router])

  const handleSaveNick = () => {
    if (!user || !newNick.trim()) return
    const updated = { ...user, nickname: newNick.trim() }
    setUser(updated)
    setUserState(updated)
    setEditingNick(false)
  }

  const handleDeleteAll = () => {
    if (typeof window !== 'undefined') {
      const keys = ['ronpa_user', 'ronpa_stats', 'ronpa_history', 'ronpa_suspended', 'ronpa_badges', 'ronpa_sound']
      keys.forEach(k => localStorage.removeItem(k))
    }
    router.replace('/login')
  }

  const handleToggleSound = () => {
    const newVal = !soundEnabled
    setSoundState(newVal)
    setSoundEnabled(newVal)
  }

  if (!user || !stats) return null

  const winRateByCategory = Object.entries(stats.categoryDebates).map(([cat, total]) => ({
    cat, total, wins: stats.categoryWins[cat] || 0,
    rate: total > 0 ? Math.round((stats.categoryWins[cat] || 0) / total * 100) : 0,
  }))

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.push('/')} className="rpg-btn px-3 py-2 text-xs">← 戻る</button>
        <h1 className="text-purple-500 text-sm font-bold">⚙️ 設定 / マイページ</h1>
      </div>

      {/* Profile */}
      <div className="rpg-panel p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rpg-panel flex items-center justify-center text-2xl">👤</div>
          <div className="flex-1">
            {editingNick ? (
              <div className="flex gap-2">
                <input value={newNick} onChange={e => setNewNick(e.target.value.slice(0, 12))}
                       className="flex-1 px-2 py-1 text-xs rounded-lg" maxLength={12} autoFocus />
                <button onClick={handleSaveNick} className="rpg-btn px-2 py-1 text-xs">保存</button>
                <button onClick={() => setEditingNick(false)} className="rpg-btn rpg-btn-danger px-2 py-1 text-xs">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-bold text-sm">{user.nickname}</span>
                <button onClick={() => setEditingNick(true)} className="text-gray-400 text-xs hover:text-pink-400">✏️</button>
              </div>
            )}
            <p className="text-gray-400 text-xs mt-1">{user.authProvider === 'guest' ? 'ゲストユーザー' : user.authProvider}</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div>
            <p className="text-purple-400 text-xs mb-2 font-bold">称号・バッジ</p>
            <div className="flex flex-wrap gap-2">
              {badges.map(b => (
                <span key={b.type} className="px-2 py-1 bg-orange-50 border border-orange-200 text-orange-500 text-xs rounded-full font-bold">
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="rpg-panel p-4">
        <h2 className="text-purple-500 text-xs font-bold mb-4">📊 成績</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-pink-50 rounded-xl p-3">
            <p className="text-gray-400">総対戦数</p>
            <p className="text-gray-700 text-xl font-bold">{stats.totalDebates}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-gray-400">勝率</p>
            <p className="text-pink-500 text-xl font-bold">{stats.winRate}%</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-gray-400">勝 / 負 / 分</p>
            <p className="text-gray-700 text-sm font-bold">{stats.wins} / {stats.losses} / {stats.draws}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-gray-400">平均スコア</p>
            <p className="text-gray-700 text-xl font-bold">{stats.avgScore}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <p className="text-gray-400">最高スコア</p>
            <p className="text-yellow-500 text-xl font-bold">{stats.maxScore}</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-gray-400">最大連勝</p>
            <p className="text-purple-500 text-xl font-bold">{stats.maxStreak}</p>
          </div>
        </div>

        {winRateByCategory.length > 0 && (
          <div className="mt-4">
            <p className="text-purple-400 text-xs mb-2 font-bold">カテゴリ別勝率</p>
            <div className="space-y-1.5">
              {winRateByCategory.map(({ cat, total, wins, rate }) => (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 w-28 truncate shrink-0">{cat}</span>
                  <div className="flex-1 bg-purple-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="text-gray-500 w-16 text-right">{wins}/{total} ({rate}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="rpg-panel p-4 space-y-3">
        <h2 className="text-purple-500 text-xs font-bold mb-2">設定</h2>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-xs">🔊 効果音</span>
          <button onClick={handleToggleSound}
                  className={`rpg-btn px-4 py-1 text-xs ${soundEnabled ? '' : 'opacity-50'}`}>
            {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="py-2">
          <p className="text-gray-500 text-xs mb-1">アカウント連携</p>
          <p className="text-gray-400 text-xs">Google / X ログインは今後対応予定</p>
        </div>

        <button onClick={() => setShowDeleteConfirm(true)}
                className="rpg-btn rpg-btn-danger w-full py-2 text-xs mt-4">
          🗑️ データを全て削除
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-30 px-6">
          <div className="rpg-panel p-6 w-full max-w-sm space-y-4">
            <p className="text-red-400 text-sm text-center font-bold">⚠️ 全データを削除しますか？</p>
            <p className="text-gray-400 text-xs text-center">この操作は取り消せません。履歴・スタッツ・バッジが全て消えます。</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleDeleteAll} className="rpg-btn rpg-btn-danger py-3 text-sm">削除する</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="rpg-btn py-3 text-sm">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
