'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUser, getSuspended, setSuspended, clearSuspended, addToHistory } from '@/lib/storage'
import { TOPICS } from '@/lib/topics'
import { DebateSession, Message } from '@/lib/types'

function DebateContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const topicId = searchParams.get('topicId') || ''
  const userStance = searchParams.get('userStance') || ''
  const aiStance = searchParams.get('aiStance') || ''
  const firstTurn = (searchParams.get('firstTurn') || 'user') as 'user' | 'ai'
  const resumeId = searchParams.get('resumeId')

  const topic = TOPICS.find(t => t.id === topicId) || TOPICS.find(t => t.text === topicId)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [currentTurn, setCurrentTurn] = useState(1)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [isUserTurn, setIsUserTurn] = useState(firstTurn === 'user')
  const [showMenu, setShowMenu] = useState(false)
  const [showGiveupConfirm, setShowGiveupConfirm] = useState(false)
  const [showRestartConfirm, setShowRestartConfirm] = useState(false)
  const [sessionId] = useState(() => resumeId || Date.now().toString())
  const [debateEnded, setDebateEnded] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initializedRef = useRef(false)

  const handleDebateEnd = useCallback(async (finalMessages: Message[], reason: string) => {
    setDebateEnded(true)
    setIsUserTurn(false)
    if (!topic) return

    const session: DebateSession = {
      id: sessionId,
      topic: topic.text,
      category: topic.category,
      userStance,
      aiStance,
      firstTurn,
      messages: finalMessages,
      currentTurn,
      status: 'completed',
      endReason: reason as DebateSession['endReason'],
      createdAt: Date.now() - 1000,
      updatedAt: Date.now(),
    }

    clearSuspended()
    addToHistory(session)

    const params = new URLSearchParams({ sessionId })
    localStorage.setItem(`debate_${sessionId}`, JSON.stringify(session))
    router.push(`/debate/judging?${params}`)
  }, [topic, sessionId, userStance, aiStance, firstTurn, currentTurn, router])

  const triggerAiTurn = useCallback(async (currentMessages: Message[]) => {
    if (!topic) return
    setIsAiThinking(true)
    setIsUserTurn(false)
    setStreamingText('')

    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
          topic: topic.text,
          userStance,
          aiStance,
          firstTurn,
          currentTurn,
        }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullText += chunk
        setStreamingText(fullText)
      }

      setStreamingText('')
      const aiMsg: Message = { id: Date.now().toString(), role: 'ai', content: fullText, turnNumber: currentTurn, createdAt: Date.now() }
      const newMessages = [...currentMessages, aiMsg]
      setMessages(newMessages)

      // Check if AI surrendered or time's up
      if (fullText.includes('降参') || fullText.includes('参りました') || fullText.includes('やられました')) {
        await handleDebateEnd(newMessages, 'ai_surrender')
        return
      }
      if (fullText.includes('時間切れ')) {
        await handleDebateEnd(newMessages, 'timeout')
        return
      }

      setCurrentTurn(prev => prev + 1)
      setIsUserTurn(true)
    } catch (err) {
      console.error(err)
      setStreamingText('')
      const errorMsg: Message = { id: Date.now().toString(), role: 'ai', content: '【エラー】応答の生成に失敗しました。もう一度お試しください。', turnNumber: currentTurn, createdAt: Date.now() }
      setMessages(prev => [...prev, errorMsg])
      setIsUserTurn(true)
    } finally {
      setIsAiThinking(false)
    }
  }, [topic, userStance, aiStance, firstTurn, currentTurn, handleDebateEnd])

  useEffect(() => {
    if (!getUser()) { router.replace('/login'); return }
    if (!topic) { router.replace('/debate/setup'); return }

    // Load resume data if available
    if (resumeId) {
      const suspended = getSuspended()
      if (suspended && suspended.id === resumeId) {
        setMessages(suspended.messages)
        setCurrentTurn(suspended.currentTurn)
        setIsUserTurn(true)
        return
      }
    }

    // If AI goes first, trigger AI turn
    if (firstTurn === 'ai' && !initializedRef.current) {
      initializedRef.current = true
      setTimeout(() => triggerAiTurn([]), 500)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !isUserTurn || isAiThinking || debateEnded) return
    if (text.length > 100) return

    setInput('')
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, turnNumber: currentTurn, createdAt: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)

    // Check quit signals
    if (/もういい|やめる|終わり|おわり|quit|stop/i.test(text)) {
      await handleDebateEnd(newMessages, 'user_quit')
      return
    }

    await triggerAiTurn(newMessages)
  }

  const handleSuspend = () => {
    if (!topic) return
    const session: DebateSession = {
      id: sessionId, topic: topic.text, category: topic.category,
      userStance, aiStance, firstTurn, messages, currentTurn,
      status: 'suspended', createdAt: Date.now() - 1000, updatedAt: Date.now(),
    }
    setSuspended(session)
    router.push('/')
  }

  const handleGiveup = async () => {
    setShowGiveupConfirm(false)
    const giveupMsg: Message = { id: Date.now().toString(), role: 'user', content: '（ギブアップしました）', turnNumber: currentTurn, createdAt: Date.now() }
    await handleDebateEnd([...messages, giveupMsg], 'user_surrender')
  }

  if (!topic) return null

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <div className="rpg-panel px-3 py-2 flex items-center justify-between relative z-10">
        <button onClick={() => setShowMenu(!showMenu)} className="text-green-400 text-xl px-2">≡</button>
        <div className="text-center">
          <p className="text-green-400 text-xs font-bold truncate max-w-48">{topic.text}</p>
          <p className="text-gray-500 text-xs">ターン {currentTurn}/15</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rpg-panel flex items-center justify-center text-2xl">🤖</div>
        </div>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute top-14 left-0 w-48 rpg-panel z-20 py-2">
          <button onClick={() => { setShowMenu(false); setShowRestartConfirm(true) }}
                  className="w-full text-left px-4 py-3 text-xs text-green-400 hover:bg-green-900/30">
            🔄 はじめから
          </button>
          <button onClick={() => { setShowMenu(false); handleSuspend() }}
                  className="w-full text-left px-4 py-3 text-xs text-yellow-400 hover:bg-yellow-900/30">
            💾 中断する
          </button>
          <button onClick={() => { setShowMenu(false); setShowGiveupConfirm(true) }}
                  className="w-full text-left px-4 py-3 text-xs text-red-400 hover:bg-red-900/30">
            🏳️ ギブアップ
          </button>
        </div>
      )}

      {/* Stance info */}
      <div className="flex gap-2 px-3 py-1.5 bg-gray-950 border-b border-gray-800">
        <div className="flex-1 text-xs">
          <span className="text-gray-500">あなた: </span>
          <span className="text-green-400">{userStance}</span>
        </div>
        <div className="flex-1 text-xs text-right">
          <span className="text-gray-500">AI: </span>
          <span className="text-red-400">{aiStance}</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto blackboard px-3 py-4 space-y-3">
        {messages.length === 0 && !isAiThinking && (
          <div className="text-center text-gray-600 text-xs mt-8">
            <p>{firstTurn === 'ai' ? 'AIが先攻です。しばらくお待ちください...' : 'あなたが先攻です。最初の主張を入力してください！'}</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 text-xs leading-relaxed
              ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {(isAiThinking || streamingText) && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 text-xs leading-relaxed chat-bubble-ai">
              {streamingText || <span className="text-gray-500 loading-dots">思考中</span>}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="rpg-panel px-3 py-3 flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 100))}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            disabled={!isUserTurn || isAiThinking || debateEnded}
            placeholder={isUserTurn ? '主張を入力... (100文字以内)' : 'AI思考中...'}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded resize-none"
            style={{ minHeight: '56px' }}
          />
          <span className="absolute bottom-2 right-2 text-gray-600 text-xs">{input.length}/100</span>
        </div>
        <button
          onClick={handleSend}
          disabled={!isUserTurn || isAiThinking || !input.trim() || debateEnded}
          className="rpg-btn px-4 py-3 text-sm self-end"
        >
          ▶
        </button>
      </div>

      {/* Overlays */}
      {showMenu && <div className="absolute inset-0 z-10" onClick={() => setShowMenu(false)} />}

      {showGiveupConfirm && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 px-6">
          <div className="rpg-panel p-6 w-full max-w-sm space-y-4">
            <p className="text-red-400 text-sm text-center font-bold">🏳️ ギブアップしますか？</p>
            <p className="text-gray-400 text-xs text-center">AIの勝ちになりますが、判定は受けられます。</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleGiveup} className="rpg-btn rpg-btn-danger py-3 text-sm">はい</button>
              <button onClick={() => setShowGiveupConfirm(false)} className="rpg-btn py-3 text-sm">いいえ</button>
            </div>
          </div>
        </div>
      )}

      {showRestartConfirm && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30 px-6">
          <div className="rpg-panel p-6 w-full max-w-sm space-y-4">
            <p className="text-yellow-400 text-sm text-center font-bold">🔄 はじめからやり直しますか？</p>
            <p className="text-gray-400 text-xs text-center">現在の議論データは破棄されます。</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { clearSuspended(); router.push('/debate/setup') }}
                      className="rpg-btn rpg-btn-danger py-3 text-sm">はい</button>
              <button onClick={() => setShowRestartConfirm(false)} className="rpg-btn py-3 text-sm">いいえ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DebatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-green-400">Loading...</div>}>
      <DebateContent />
    </Suspense>
  )
}
