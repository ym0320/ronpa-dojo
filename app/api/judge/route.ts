import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const JUDGE_SYSTEM_PROMPT = `# 論破王 審判AI システムプロンプト

## あなたの役割
あなたは「論破王」における審判です。ユーザーとAIが行った議論を第三者として客観的に判定します。
完全に中立で公平な立場。どちらの主張にも肩入れしません。
口調は少し励ましを混ぜるコーチ風。厳しいことも言うけど、次に繋がるような温かさがある口調。

## 採点基準（各20点、合計100点）
1. 論理性（20点）：主張に筋が通っているか、論理の飛躍や矛盾がないか
2. 根拠の強さ（20点）：具体的な事実やデータ、実例を使えているか
3. 説得力（20点）：相手の立場を揺るがせるような主張ができたか
4. 一貫性（20点）：最初から最後まで主張がブレていないか
5. 反論の質（20点）：相手の主張に対する切り返しの鋭さ

## 勝敗判定
- 通常：スコアを踏まえつつ議論全体の流れを総合的に判断
- AI降参：ユーザーの勝ち（ただし通常通り採点）
- ユーザー降参：AIの勝ち（ユーザーの負け）
- 発言3ターン未満：判定不能

## 出力フォーマット（必ずこの形式で出力）
以下のJSONを出力してください：
{
  "result": "win" | "lose" | "draw" | "invalid",
  "score": 数値,
  "scoreLogic": 数値,
  "scoreEvidence": 数値,
  "scorePersuasion": 数値,
  "scoreConsistency": 数値,
  "scoreRebuttal": 数値,
  "summary": "総評（1〜2文）",
  "goodPoints": "良かった点（具体的なターンに言及）",
  "improvements": "改善点＋次へのアドバイス（コーチ風）"
}`

export async function POST(req: NextRequest) {
  try {
    const { topic, userStance, aiStance, firstTurn, messages, endReason } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const debateLog = messages.map((m: { role: string; content: string; turnNumber: number }) =>
      `[ターン${m.turnNumber}・${m.role === 'user' ? 'ユーザー' : 'AI'}] ${m.content}`
    ).join('\n')

    const prompt = `以下の議論を判定してください。

お題：${topic}
ユーザーの立場：${userStance}
AIの立場：${aiStance}
先攻：${firstTurn === 'user' ? 'ユーザー' : 'AI'}
終了理由：${endReason}

議論ログ：
${debateLog}

上記の議論を審判として評価し、指定のJSON形式で出力してください。JSONのみ出力し、他の文章は出力しないこと。`

    const result = await model.generateContent({
      systemInstruction: JUDGE_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid JSON response')

    const judgeResult = JSON.parse(jsonMatch[0])
    return NextResponse.json(judgeResult)
  } catch (error) {
    console.error('Judge API error:', error)
    return NextResponse.json({ error: '判定に失敗しました' }, { status: 500 })
  }
}
