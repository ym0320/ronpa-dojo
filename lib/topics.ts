export interface Topic {
  id: string
  category: string
  text: string
  stanceA: string
  stanceB: string
}

export const CATEGORIES = [
  '社会・倫理系',
  'AI・テクノロジー',
  '教育',
  '働き方',
  '男女・恋愛',
  '文化・価値観',
  '経済',
  '食・健康',
  'エンタメ',
  'インターネット特有の議題',
]

export const TOPICS: Topic[] = [
  // 社会・倫理系
  { id: 's1', category: '社会・倫理系', text: '死刑制度は必要か', stanceA: '必要である', stanceB: '不要である' },
  { id: 's2', category: '社会・倫理系', text: '安楽死は合法化すべきか', stanceA: '合法化すべき', stanceB: '合法化すべきでない' },
  { id: 's3', category: '社会・倫理系', text: 'ベーシックインカムは導入すべきか', stanceA: '導入すべき', stanceB: '導入すべきでない' },
  { id: 's4', category: '社会・倫理系', text: '生活保護はもっと厳しくするべきか', stanceA: '厳しくすべき', stanceB: '厳しくすべきでない' },
  { id: 's5', category: '社会・倫理系', text: '外国人労働者を増やすべきか', stanceA: '増やすべき', stanceB: '増やすべきでない' },
  { id: 's6', category: '社会・倫理系', text: '移民は社会にとってプラスか', stanceA: 'プラスである', stanceB: 'プラスでない' },
  { id: 's7', category: '社会・倫理系', text: '少子化対策として子供を持つ義務を作るべきか', stanceA: '作るべき', stanceB: '作るべきでない' },
  { id: 's8', category: '社会・倫理系', text: '結婚制度は時代遅れか', stanceA: '時代遅れである', stanceB: '時代遅れでない' },
  { id: 's9', category: '社会・倫理系', text: '同性婚を認めるべきか', stanceA: '認めるべき', stanceB: '認めるべきでない' },
  { id: 's10', category: '社会・倫理系', text: 'ポリコレは行き過ぎているか', stanceA: '行き過ぎている', stanceB: '行き過ぎていない' },
  // AI・テクノロジー
  { id: 'a1', category: 'AI・テクノロジー', text: 'AIは人間の仕事を奪うのか', stanceA: '奪う', stanceB: '奪わない' },
  { id: 'a2', category: 'AI・テクノロジー', text: 'AI生成作品は著作権を認めるべきか', stanceA: '認めるべき', stanceB: '認めるべきでない' },
  { id: 'a3', category: 'AI・テクノロジー', text: 'AIが作った芸術は本物か', stanceA: '本物である', stanceB: '本物でない' },
  { id: 'a4', category: 'AI・テクノロジー', text: 'AI恋人は社会に悪影響か', stanceA: '悪影響である', stanceB: '悪影響でない' },
  { id: 'a5', category: 'AI・テクノロジー', text: 'SNSは社会を悪くしたか', stanceA: '悪くした', stanceB: '悪くしていない' },
  { id: 'a6', category: 'AI・テクノロジー', text: 'スマホは子供に禁止すべきか', stanceA: '禁止すべき', stanceB: '禁止すべきでない' },
  { id: 'a7', category: 'AI・テクノロジー', text: 'AI規制は必要か', stanceA: '必要である', stanceB: '不要である' },
  { id: 'a8', category: 'AI・テクノロジー', text: 'AIは危険な技術か', stanceA: '危険である', stanceB: '危険でない' },
  { id: 'a9', category: 'AI・テクノロジー', text: 'AIが政治判断する社会はありか', stanceA: 'あり', stanceB: 'なし' },
  // 教育
  { id: 'e1', category: '教育', text: '学歴は本当に必要か', stanceA: '必要である', stanceB: '不要である' },
  { id: 'e2', category: '教育', text: '大学は行く価値があるのか', stanceA: '価値がある', stanceB: '価値がない' },
  { id: 'e3', category: '教育', text: '義務教育はオンライン化すべきか', stanceA: 'すべき', stanceB: 'すべきでない' },
  { id: 'e4', category: '教育', text: '学校の制服は必要か', stanceA: '必要である', stanceB: '不要である' },
  { id: 'e5', category: '教育', text: '宿題は廃止すべきか', stanceA: '廃止すべき', stanceB: '廃止すべきでない' },
  { id: 'e6', category: '教育', text: '偏差値教育は悪なのか', stanceA: '悪である', stanceB: '悪でない' },
  { id: 'e7', category: '教育', text: 'プログラミング教育は必須か', stanceA: '必須である', stanceB: '必須でない' },
  // 働き方
  { id: 'w1', category: '働き方', text: '週5勤務は時代遅れか', stanceA: '時代遅れである', stanceB: '時代遅れでない' },
  { id: 'w2', category: '働き方', text: 'リモートワークは生産性を下げるか', stanceA: '下げる', stanceB: '下げない' },
  { id: 'w3', category: '働き方', text: '終身雇用は復活すべきか', stanceA: '復活すべき', stanceB: '復活すべきでない' },
  { id: 'w4', category: '働き方', text: '成果主義は公平か', stanceA: '公平である', stanceB: '公平でない' },
  { id: 'w5', category: '働き方', text: '副業は禁止すべきか', stanceA: '禁止すべき', stanceB: '禁止すべきでない' },
  { id: 'w6', category: '働き方', text: '定年制度は必要か', stanceA: '必要である', stanceB: '不要である' },
  // 男女・恋愛
  { id: 'g1', category: '男女・恋愛', text: '男女平等は実現しているか', stanceA: '実現している', stanceB: '実現していない' },
  { id: 'g2', category: '男女・恋愛', text: '男性の方が社会的に不利になっているか', stanceA: '不利になっている', stanceB: '不利でない' },
  { id: 'g3', category: '男女・恋愛', text: '専業主婦は時代遅れか', stanceA: '時代遅れである', stanceB: '時代遅れでない' },
  { id: 'g4', category: '男女・恋愛', text: '奢る奢らない問題', stanceA: '男性が奢るべき', stanceB: '割り勘が正しい' },
  { id: 'g5', category: '男女・恋愛', text: 'マッチングアプリは恋愛を壊したか', stanceA: '壊した', stanceB: '壊していない' },
  { id: 'g6', category: '男女・恋愛', text: '一夫一妻制は自然なのか', stanceA: '自然である', stanceB: '自然でない' },
  // 文化・価値観
  { id: 'c1', category: '文化・価値観', text: 'タトゥーは社会的に許されるべきか', stanceA: '許されるべき', stanceB: '許されるべきでない' },
  { id: 'c2', category: '文化・価値観', text: 'SNSの「いいね」は承認欲求を壊すか', stanceA: '壊す', stanceB: '壊さない' },
  { id: 'c3', category: '文化・価値観', text: '炎上文化は必要悪か', stanceA: '必要悪である', stanceB: '必要悪でない' },
  { id: 'c4', category: '文化・価値観', text: '有名人の不倫は叩くべきか', stanceA: '叩くべき', stanceB: '叩くべきでない' },
  { id: 'c5', category: '文化・価値観', text: 'キャンセルカルチャーは正義か', stanceA: '正義である', stanceB: '正義でない' },
  // 経済
  { id: 'eco1', category: '経済', text: '富裕層への増税は正しいか', stanceA: '正しい', stanceB: '正しくない' },
  { id: 'eco2', category: '経済', text: '仮想通貨は価値があるのか', stanceA: '価値がある', stanceB: '価値がない' },
  { id: 'eco3', category: '経済', text: '投資はギャンブルか', stanceA: 'ギャンブルである', stanceB: 'ギャンブルでない' },
  { id: 'eco4', category: '経済', text: '不動産価格は規制すべきか', stanceA: '規制すべき', stanceB: '規制すべきでない' },
  { id: 'eco5', category: '経済', text: '最低賃金を上げるべきか', stanceA: '上げるべき', stanceB: '上げるべきでない' },
  // 食・健康
  { id: 'f1', category: '食・健康', text: '肉食は倫理的に問題か', stanceA: '問題である', stanceB: '問題でない' },
  { id: 'f2', category: '食・健康', text: 'ヴィーガンは正しいのか', stanceA: '正しい', stanceB: '正しくない' },
  { id: 'f3', category: '食・健康', text: '砂糖は規制すべきか', stanceA: '規制すべき', stanceB: '規制すべきでない' },
  { id: 'f4', category: '食・健康', text: '酒・タバコは合法でいいのか', stanceA: '合法でよい', stanceB: '規制すべき' },
  { id: 'f5', category: '食・健康', text: 'サプリは意味があるのか', stanceA: '意味がある', stanceB: '意味がない' },
  // エンタメ
  { id: 'en1', category: 'エンタメ', text: 'ゲームは子供に悪影響か', stanceA: '悪影響である', stanceB: '悪影響でない' },
  { id: 'en2', category: 'エンタメ', text: 'アニメは幼稚な文化か', stanceA: '幼稚である', stanceB: '幼稚でない' },
  { id: 'en3', category: 'エンタメ', text: 'スポーツ選手の年収は高すぎるか', stanceA: '高すぎる', stanceB: '適切である' },
  { id: 'en4', category: 'エンタメ', text: 'VTuberは文化として残るか', stanceA: '残る', stanceB: '残らない' },
  { id: 'en5', category: 'エンタメ', text: '芸能人の炎上は過剰反応か', stanceA: '過剰反応である', stanceB: '過剰でない' },
  // インターネット特有の議題
  { id: 'i1', category: 'インターネット特有の議題', text: '匿名は必要か', stanceA: '必要である', stanceB: '不要である' },
  { id: 'i2', category: 'インターネット特有の議題', text: '実名SNSの方が健全か', stanceA: '健全である', stanceB: '健全でない' },
  { id: 'i3', category: 'インターネット特有の議題', text: 'SNSは規制すべきか', stanceA: '規制すべき', stanceB: '規制すべきでない' },
  { id: 'i4', category: 'インターネット特有の議題', text: 'インフルエンサーは社会に価値があるか', stanceA: '価値がある', stanceB: '価値がない' },
  { id: 'i5', category: 'インターネット特有の議題', text: 'バズるコンテンツは質が低いか', stanceA: '質が低い', stanceB: '質が低くない' },
]

export function getRandomTopic(): Topic {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)]
}

export function getTopicsByCategory(category: string): Topic[] {
  return TOPICS.filter(t => t.category === category)
}
