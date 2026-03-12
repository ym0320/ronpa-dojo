import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const JUDGE_SYSTEM_PROMPT = `# 論破道場 審判AI システムプロンプト

## あなたの役割
あなたは「論破道場」における審判です。ユーザーとAIが行った議論を第三者として客観的に判定します。
完全に中立で公平な立場。どちらの主張にも肩入れしません。
口調は少し励ましを混ぜるコーチ風。厳しいことも言うけど、次に繋がるような温かさがある口調。

重要：すべてのフィードバックは「ユーザー（あなた）」に対して語りかけるように書いてください。
summary, goodPoints, improvements はすべてユーザーの議論パフォーマンスについてのコメントであり、「あなたは〜」「あなたの〜」という二人称で書いてください。

## 採点基準（各20点、合計100点）
これはユーザーの議論力に対する採点です（AIの採点ではありません）。
1. 論理性（20点）：ユーザーの主張に筋が通っているか、論理の飛躍や矛盾がないか
2. 根拠の強さ（20点）：ユーザーが具体的な事実やデータ、実例を使えているか
3. 説得力（20点）：ユーザーが相手（AI）の立場を揺るがせるような主張ができたか
4. 一貫性（20点）：ユーザーが最初から最後まで主張がブレていないか
5. 反論の質（20点）：ユーザーの相手（AI）の主張に対する切り返しの鋭さ

## 勝敗判定
resultフィールドは必ず「ユーザーから見た結果」を示します：
- "win" = ユーザーの勝ち（ユーザーがAIに勝った）
- "lose" = ユーザーの負け（AIがユーザーに勝った）
- "draw" = 引き分け
- "invalid" = 判定不能

判定基準：
- 通常終了：ユーザーのスコアを踏まえつつ議論全体の流れを総合的に判断。スコア60点以上でユーザーの議論が優勢ならwin、AIの方が優勢ならlose。
- AI降参（endReason: ai_surrender）：ユーザーの勝ち → result は "win"
- ユーザー降参（endReason: user_surrender）：ユーザーの負け → result は "lose"
- ユーザー途中離脱（endReason: user_quit）：ユーザーの負け → result は "lose"
- 発言3ターン未満：判定不能 → result は "invalid"

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
  "summary": "ユーザーに対する総評（1〜2文、「あなたは〜」で始める）",
  "goodPoints": "ユーザーの良かった点（具体的なターンに言及、「あなたの〜」で書く）",
  "improvements": "ユーザーへの改善点＋次へのアドバイス（コーチ風、「〜してみよう」で書く）"
}`

export async function POST(req: NextRequest) {
  try {
    const { topic, userStance, aiStance, firstTurn, messages, endReason } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: JUDGE_SYSTEM_PROMPT,
    })

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
