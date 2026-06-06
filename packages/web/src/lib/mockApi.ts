// ============================================================
// Mock API — self-contained mock server when backend is unavailable
// ============================================================

const hexagrams = [
  { index: 1, name: "乾为天", symbol: "䷀", gua_ci: "元亨利贞。", interpretation: "乾卦象征天，代表创造、强健、进取。得此卦者宜主动积极。", upper_gua: "乾", lower_gua: "乾" },
  { index: 2, name: "坤为地", symbol: "䷁", gua_ci: "元亨，利牝马之贞。", interpretation: "坤卦象征地，代表柔顺、包容、承载。得此卦者宜守成。", upper_gua: "坤", lower_gua: "坤" },
  { index: 3, name: "水雷屯", symbol: "䷂", gua_ci: "元亨利贞。勿用有攸往。", interpretation: "屯卦象征初生之艰难，万事开头难。", upper_gua: "坎", lower_gua: "震" },
  { index: 4, name: "山水蒙", symbol: "䷃", gua_ci: "亨。匪我求童蒙，童蒙求我。", interpretation: "蒙卦象征启蒙、教育。", upper_gua: "艮", lower_gua: "坎" },
  { index: 5, name: "水天需", symbol: "䷄", gua_ci: "有孚，光亨，贞吉。利涉大川。", interpretation: "需卦象征等待时机。", upper_gua: "坎", lower_gua: "乾" },
  { index: 6, name: "天水讼", symbol: "䷅", gua_ci: "有孚窒惕，中吉，终凶。", interpretation: "讼卦象征争讼、纠纷。", upper_gua: "乾", lower_gua: "坎" },
  { index: 7, name: "地水师", symbol: "䷆", gua_ci: "贞，丈人吉，无咎。", interpretation: "师卦象征军队、战争。得此卦者宜组织团队。", upper_gua: "坤", lower_gua: "坎" },
  { index: 8, name: "水地比", symbol: "䷇", gua_ci: "吉。原筮，元永贞，无咎。", interpretation: "比卦象征亲附、团结。", upper_gua: "坎", lower_gua: "坤" },
]

const liuqinList = ["兄弟", "父母", "子孙", "妻财", "官鬼"]
const liushouList = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"]
const palaceList = ["乾", "坤", "震", "巽", "坎", "离", "艮", "兑"]
const elements = ["金", "木", "水", "火", "土"]

function randomPick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

function generatePaipan() {
  const benGua = randomPick(hexagrams)
  const dongYaoCount = randInt(0, 3)
  const dongYao = Array.from({ length: dongYaoCount }, () => randInt(1, 6)).filter((v, i, a) => a.indexOf(v) === i)

  const lines = Array.from({ length: 6 }, (_, i) => {
    const pos = 6 - i
    const isYang = Math.random() > 0.5
    const changing = dongYao.includes(pos)
    return {
      position: pos,
      yao_type: isYang ? "yang" as const : "yin" as const,
      changing,
      najia: `${randomPick(["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"])}${randomPick(["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"])}`,
      liuqin: randomPick(liuqinList),
      liushou: randomPick(liushouList),
      shiying: pos === 4 ? "世" : pos === 1 ? "应" : "",
    }
  })

  const bianGua = dongYao.length > 0 ? randomPick(hexagrams.filter(h => h.index !== benGua.index)) : null
  const huGua = randomPick(hexagrams.filter(h => h.index !== benGua.index && (!bianGua || h.index !== bianGua.index)))
  const zongGua = randomPick(hexagrams.filter(h => h.index !== benGua.index))

  return {
    ben_gua: { name: benGua.name, symbol: benGua.symbol, gua_ci: benGua.gua_ci, interpretation: benGua.interpretation },
    bian_gua: bianGua ? { name: bianGua.name, symbol: bianGua.symbol } : null,
    hu_gua: huGua ? { name: huGua.name, symbol: huGua.symbol } : null,
    zong_gua: zongGua ? { name: zongGua.name, symbol: zongGua.symbol } : null,
    dong_yao: dongYao,
    shi_position: 4,
    ying_position: 1,
    palace: randomPick(palaceList),
    palace_element: randomPick(elements),
    lines,
  }
}

function generateInterpretation(question: string, paipan: any) {
  const guaName = paipan.ben_gua.name
  const lines = [
    `【卦象总览】`,
    `本卦为${guaName}，卦辞曰：「${paipan.ben_gua.gua_ci || "元亨利贞"}」`,
    `大意：${paipan.ben_gua.interpretation || "此卦提示你保持正心正念，顺势而为。"}`,
    ``,
    `【动爻详解】`,
    paipan.dong_yao.length > 0
      ? paipan.dong_yao.map((d: number) => `第${d}爻发动，提示此位置所代表的事项将发生变化。`).join("\n")
      : "静卦，各爻不变。以本卦卦辞为主要参考。",
    ``,
    `【用神分析】`,
    `针对"${question}"，以世爻为核心观察。世爻得位，表示你自身状态良好。`,
    ``,
    `【世应关系】`,
    `世爻代表你自身，应爻代表你所问之事。世应和谐，表示事情与人匹配。`,
    ``,
    `【综合判断】`,
    `吉凶判断：**中平** — 卦象有吉有凶，关键在于自身的选择和行动。`,
    `信心指数：**6/10**`,
    ``,
    `【行动建议】`,
    `1. 结合本卦的启示，明确当前处境和自身定位。`,
    `2. 保持积极心态，六爻的启示是指引而非宿命。`,
    `3. 建议结合实际情况综合判断，重大决策请多方考量。`,
  ]
  return lines.join("\n")
}

export function handleMockApi(path: string, method: string, body: any): Response | null {
  // Generate paipan
  if (path === "/api/qigua/paipan" && method === "POST") {
    return json(generatePaipan())
  }

  // Coin toss
  if (path === "/api/qigua/yao" && method === "POST") {
    const paipan = generatePaipan()
    return json({
      method: "yao",
      lines: paipan.lines.map((l: any) => ({ position: l.position, yao_str: l.yao_type === "yang" ? "⚊" : "⚋", type: l.yao_type, changing: l.changing })),
      ben_gua_index: 1, ben_gua_name: paipan.ben_gua.name, ben_gua_symbol: paipan.ben_gua.symbol,
      dong_yao: paipan.dong_yao,
    })
  }

  // Number/time qigua
  if ((path === "/api/qigua/number" || path === "/api/qigua/time") && method === "POST") {
    const paipan = generatePaipan()
    return json({
      method: path.includes("number") ? "number" : "time",
      lines: paipan.lines.map((l: any) => ({ position: l.position, yao_str: l.yao_type === "yang" ? "⚊" : "⚋", type: l.yao_type, changing: l.changing })),
      ben_gua_index: 1, ben_gua_name: paipan.ben_gua.name, ben_gua_symbol: paipan.ben_gua.symbol,
      dong_yao: paipan.dong_yao,
    })
  }

  // AI interpretation stream (SSE)
  if (path === "/api/interpret/stream" && method === "POST") {
    const paipan = generatePaipan()
    const text = generateInterpretation(body?.question || "占卜", paipan)
    return sse(text)
  }

  // Conversation create
  if (path === "/api/conversations" && method === "POST") {
    const paipan = generatePaipan()
    return json({
      conversation_id: "mock-" + Date.now(),
      title: body?.question || "新对话",
      paipan: {
        ben_gua: paipan.ben_gua,
        bian_gua: paipan.bian_gua,
        hu_gua: paipan.hu_gua,
        zong_gua: paipan.zong_gua,
        dong_yao: paipan.dong_yao,
        lines: paipan.lines,
      },
      ben_gua_name: paipan.ben_gua.name,
    })
  }

  // Conversation stream (SSE)
  if (path.match(/\/api\/conversations\/.*\/stream/) && method === "POST") {
    const paipan = generatePaipan()
    const text = generateInterpretation(body?.content || "解读", paipan)
    return sse(text)
  }

  // Interpret (sync)
  if (path === "/api/interpret" && method === "POST") {
    const paipan = generatePaipan()
    return json({
      interpretation: generateInterpretation(body?.question || "占卜", paipan),
      paipan,
    })
  }

  // Hexagram list
  if (path === "/api/hexagrams" && method === "GET") {
    return json(hexagrams.map(h => ({ ...h, gua_ci: h.gua_ci.slice(0, 50) + "..." })))
  }

  // Auth
  if (path === "/api/auth/profile" && method === "GET") {
    return json({ id: "mock-user-1", nickname: "测试用户", avatar_url: null, phone: "138****8888" })
  }
  if (path === "/api/auth/login" && method === "POST") {
    return json({ id: "mock-user-1", nickname: "测试用户", phone: body?.phone || "13800000000", token: "mock-token-" + Date.now() })
  }
  if (path === "/api/auth/register" && method === "POST") {
    return json({ id: "mock-user-2", nickname: "新用户", phone: body?.phone || "13800000000", token: "mock-token-" + Date.now() })
  }
  if (path === "/api/auth/send-sms" && method === "POST") {
    return json({ ok: true, message: "验证码已发送（mock: 000000）" })
  }

  // History
  if (path === "/api/history" && method === "GET") {
    return json([
      { id: "mock-h-1", question: "我该不该换工作？", method: "yao", ben_gua_name: "乾为天", dong_yao: [2], ai_interpretation: "此卦提示你应该...", is_favorite: false, created_at: new Date().toISOString() },
      { id: "mock-h-2", question: "这次投资能成功吗？", method: "number", ben_gua_name: "地天泰", dong_yao: [], ai_interpretation: "地天泰卦，天地交泰...", is_favorite: true, created_at: new Date(Date.now() - 86400000).toISOString() },
    ])
  }

  return null // not handled
}

function json(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  })
}

function sse(text: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      let i = 0
      const chunkSize = 5
      function push() {
        if (i >= text.length) { controller.close(); return }
        const chunk = text.slice(i, i + chunkSize)
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
        i += chunkSize
        setTimeout(push, 30)
      }
      push()
    },
  })
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  })
}
