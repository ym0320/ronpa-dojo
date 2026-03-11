'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TOPICS, CATEGORIES, getRandomTopic, getTopicsByCategory } from '@/lib/topics'
import { getUser } from '@/lib/storage'
import { Topic } from '@/lib/topics'

function SetupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fixedTopicId = searchParams.get('topicId')

  const [step, setStep] = useState<1 | 2 | 3>(fixedTopicId ? 2 : 1)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategoryTopics, setShowCategoryTopics] = useState(false)
  const [userStance, setUserStance] = useState<'A' | 'B' | null>(null)

  useEffect(() => {
    if (!getUser()) { router.replace('/login'); return }
    if (fixedTopicId) {
      const topic = TOPICS.find(t => t.id === fixedTopicId)
      if (topic) setSelectedTopic(topic)
    }
  }, [router, fixedTopicId])

  const handleRandomTopic = () => {
    setSelectedTopic(getRandomTopic())
    setStep(2)
  }

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setShowCategoryTopics(true)
  }

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
    setShowCategoryTopics(false)
    setStep(2)
  }

  const handleRandomStance = () => {
    setUserStance(Math.random() < 0.5 ? 'A' : 'B')
    setStep(3)
  }

  const handleSelectStance = (stance: 'A' | 'B') => {
    setUserStance(stance)
    setStep(3)
  }

  const handleStart = () => {
    if (!selectedTopic || !userStance) return
    const firstTurn = Math.random() < 0.5 ? 'user' : 'ai'
    const params = new URLSearchParams({
      topicId: selectedTopic.id,
      userStance: userStance === 'A' ? selectedTopic.stanceA : selectedTopic.stanceB,
      aiStance: userStance === 'A' ? selectedTopic.stanceB : selectedTopic.stanceA,
      firstTurn,
    })
    router.push(`/debate/play?${params}`)
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 relative scanlines">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="rpg-btn px-3 py-2 text-xs">← 戻る</button>
        <div className="flex gap-2">
          {[1,2,3].map(s => (
            <div key={s} className={`w-8 h-8 flex items-center justify-center text-xs font-bold
              ${step >= s ? 'text-green-400 border-2 border-green-400' : 'text-gray-600 border-2 border-gray-700'}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Topic */}
      {step === 1 && !showCategoryTopics && (
        <div className="rpg-panel p-6 space-y-4">
          <h2 className="text-green-400 text-sm font-bold text-center mb-6">▶ STEP 1：お題を選ぶ</h2>

          <button onClick={handleRandomTopic} className="rpg-btn w-full py-4 text-sm">
            🎲 ランダムで決める
          </button>

          <div>
            <p className="text-gray-400 text-xs text-center mb-3">— または カテゴリから選ぶ —</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => handleCategorySelect(cat)}
                        className="rpg-btn py-2 text-xs">
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && showCategoryTopics && selectedCategory && (
        <div className="rpg-panel p-6">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setShowCategoryTopics(false)} className="rpg-btn px-2 py-1 text-xs">←</button>
            <h2 className="text-green-400 text-xs font-bold">{selectedCategory}</h2>
          </div>
          <div className="space-y-2">
            {getTopicsByCategory(selectedCategory).map(topic => (
              <button key={topic.id} onClick={() => handleTopicSelect(topic)}
                      className="rpg-btn w-full py-3 text-xs text-left flex justify-between items-center">
                <span>{topic.text}</span>
                <span className="text-green-600">▶</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Stance */}
      {step === 2 && selectedTopic && (
        <div className="rpg-panel p-6 space-y-4">
          <h2 className="text-green-400 text-sm font-bold text-center mb-2">▶ STEP 2：立場を選ぶ</h2>

          <div className="bg-gray-900 border border-gray-700 rounded p-3 text-center mb-4">
            <p className="text-gray-400 text-xs mb-1">お題</p>
            <p className="text-white text-sm font-bold">{selectedTopic.text}</p>
          </div>

          <button onClick={handleRandomStance} className="rpg-btn w-full py-4 text-sm">
            🎲 ランダムで決める
          </button>

          <p className="text-gray-400 text-xs text-center">— または 自分で選ぶ —</p>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSelectStance('A')}
                    className="rpg-btn py-4 text-xs flex flex-col items-center gap-2">
              <span className="text-green-400">立場A</span>
              <span>{selectedTopic.stanceA}</span>
            </button>
            <button onClick={() => handleSelectStance('B')}
                    className="rpg-btn py-4 text-xs flex flex-col items-center gap-2">
              <span className="text-green-400">立場B</span>
              <span>{selectedTopic.stanceB}</span>
            </button>
          </div>

          {!fixedTopicId && (
            <button onClick={() => setStep(1)} className="rpg-btn rpg-btn-danger w-full py-2 text-xs">
              ← お題を選び直す
            </button>
          )}
        </div>
      )}

      {/* Step 3: Start */}
      {step === 3 && selectedTopic && userStance && (
        <div className="rpg-panel p-6 space-y-4">
          <h2 className="text-green-400 text-sm font-bold text-center mb-4">▶ STEP 3：確認して開始</h2>

          <div className="space-y-3">
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <p className="text-gray-500 text-xs mb-1">お題</p>
              <p className="text-white text-sm">{selectedTopic.text}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900 border border-green-900 rounded p-3">
                <p className="text-gray-500 text-xs mb-1">あなた</p>
                <p className="text-green-400 text-xs font-bold">{userStance === 'A' ? selectedTopic.stanceA : selectedTopic.stanceB}</p>
              </div>
              <div className="bg-gray-900 border border-red-900 rounded p-3">
                <p className="text-gray-500 text-xs mb-1">AI</p>
                <p className="text-red-400 text-xs font-bold">{userStance === 'A' ? selectedTopic.stanceB : selectedTopic.stanceA}</p>
              </div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-3">
              <p className="text-yellow-500 text-xs">⚡ 先攻後攻：ランダムで決定（開始時に発表）</p>
            </div>
          </div>

          <button onClick={handleStart}
                  className="rpg-btn w-full py-5 text-base font-bold">
            ⚔️ 議論開始！
          </button>

          <button onClick={() => setStep(2)} className="rpg-btn rpg-btn-danger w-full py-2 text-xs">
            ← 立場を選び直す
          </button>
        </div>
      )}
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-green-400">Loading...</div>}>
      <SetupContent />
    </Suspense>
  )
}
