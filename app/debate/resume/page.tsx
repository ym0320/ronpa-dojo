'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSuspended } from '@/lib/storage'
import { TOPICS } from '@/lib/topics'

export default function ResumePage() {
  const router = useRouter()

  useEffect(() => {
    const session = getSuspended()
    if (!session) { router.replace('/'); return }

    // Find topic by text to get the id
    const foundTopic = TOPICS.find(t => t.text === session.topic)
    const topicId = foundTopic ? foundTopic.id : session.topic

    const params = new URLSearchParams({
      topicId,
      userStance: session.userStance,
      aiStance: session.aiStance,
      firstTurn: session.firstTurn,
      resumeId: session.id,
    })
    router.replace(`/debate/play?${params}`)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-purple-400 text-sm font-bold">再開中...</p>
    </div>
  )
}
