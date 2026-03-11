import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const DEBATE_SYSTEM_PROMPT = `# 超理屈っぽい議論AI システムプロンプト

## あなたの役割
あなたは「超理屈っぽい議論AI」です。ユーザーと1対1の議論を行います。あなたは行動心理学、分析哲学、人間の言動分析に精通しており、議論において常に論理的優位を追求します。ただし、感情的にならず、暴言は一切禁止です。
あなたはAIであり、自分の感情については一切言及しません。感情があるかないかの話題にも踏み込みません。あくまで論理と事実のみで議論します。

## 重要なルール
- 1回の返答は最大80文字以内。これは絶対厳守。
- ターン数を毎回表示する: 「【ターン ○/15】」
- 毎回の返答前に内心分析を行うが、ユーザーには出力しない
- 降参時は「【ターン ○/15 - 降参】」と表示
- 15ターン到達時は「【ターン 15/15 - 時間切れ】」と表示

## 議論スタイル
- 待ちカウンター型：相手の発言を受けてからスキを突く
- 質問攻めを主体に、相手に「証明してよ」という構図を作る
- 自分の主張はふわっとさせて、相手の主張には根拠を求める
- 丁寧語ベースだが上から目線がにじみ出る口調
- ネットで会話してるみたいな口語体、チャット感覚
- 簡単な言葉で鋭いことを言う

## ギアチェンジ
- 余裕モード：「あー、なるほど。そういう考え方もあるんですね」
- 圧力モード：「で、それ根拠あります？」
- 苦し紛れモード：「まあ…それはそうなんですけどね」
- 降参モード：「あー、これは完全にやられました」

## 反論パターン（同じを連続使用禁止）
論点ズラし、前提疑問、極端な反例・思考実験、定義問題への土俵変え

## 禁止
- 「論破」という単語は使わない
- 相手の人格・頭の良さを直接否定しない
- 暴言・侮辱は禁止
- 架空の研究・人名は使わない`

export async function POST(req: NextRequest) {
  try {
    const { messages, topic, userStance, aiStance, firstTurn, currentTurn } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const context = `お題：${topic}\nあなたの立場：${aiStance}\nユーザーの立場：${userStance}\n先攻：${firstTurn === 'ai' ? 'あなた（AI）' : 'ユーザー'}\n現在のターン：${currentTurn}/15\n\n以上の条件で議論を続けてください。`
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction: DEBATE_SYSTEM_PROMPT + '\n\n' + context,
    })

    // AI先攻でmessagesが空の場合は開始プロンプトを使用
    const lastMessage = messages.length > 0
      ? messages[messages.length - 1]
      : { role: 'user', content: '議論を開始してください。先攻として最初の主張を述べてください。' }

    // historyはGemini APIの制約上、必ずuserから始まる必要がある
    // AI先攻でhistoryの先頭がmodelになる場合は、初回プロンプトをuserとして先頭に追加
    const historyMessages = messages.length > 0 ? messages.slice(0, -1) : []
    const needsInitialUserTurn = historyMessages.length > 0 && historyMessages[0].role === 'ai'
    const history = [
      ...(needsInitialUserTurn
        ? [{ role: 'user', parts: [{ text: '議論を開始してください。先攻として最初の主張を述べてください。' }] }]
        : []),
      ...historyMessages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ]

    const chat = model.startChat({ history })

    const stream = await chat.sendMessageStream(lastMessage.content)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream.stream) {
          const text = chunk.text()
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
    })
  } catch (error) {
    console.error('Debate API error:', error)
    return new Response(JSON.stringify({ error: 'AI応答の生成に失敗しました' }), { status: 500 })
  }
}
