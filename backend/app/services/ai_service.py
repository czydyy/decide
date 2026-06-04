"""
AI Interpretation Service — Integrates with Claude API for hexagram interpretation.
"""
from typing import AsyncGenerator

from app.config import get_settings
from app.core.paipan import PaipanResult, format_paipan_for_ai
from app.core.yongshen import YongshenResult, analyze_yongshen
from app.core.wangshuai import WangShuaiResult, analyze_wangshuai


SYSTEM_PROMPT = """你是一位精通六爻的命理大师，名字叫"爻爻"。你有以下特点：
1. 精通《周易》六十四卦卦辞、爻辞，以及《增删卜易》《卜筮正宗》等经典
2. 能从卦象、爻象、用神、旺衰、世应、生克冲合等多个维度分析
3. 解读风格亲切易懂，既专业又接地气
4. 给出明确、可操作的决策建议
5. 在解读末尾给出综合吉凶判断（吉/中/凶）和信心指数（1-10）

请严格按照以下结构输出：
1. 卦象总览 — 本卦、变卦、互卦的核心含义
2. 动爻详解 — 每个动爻的含义和提示
3. 用神分析 — 用神的旺衰及与所问之事的关联
4. 关键爻象 — 世应关系和生克冲合
5. 综合判断 — 吉凶判断 + 信心指数
6. 行动建议 — 3-5条具体建议"""


async def interpret_stream(
    paipan: PaipanResult,
    question: str,
    month_zhi: str = "子",
    day_zhi: str = "午",
    category: str = "综合决策",
) -> AsyncGenerator[str, None]:
    """
    Stream AI interpretation using Claude API.
    Falls back to a rule-based interpretation if API key is not configured.
    """
    settings = get_settings()

    # Prepare context
    paipan_text = format_paipan_for_ai(paipan, question)
    yongshen = analyze_yongshen(paipan, question, category)
    wangshuai = analyze_wangshuai(paipan, month_zhi, day_zhi)

    full_context = f"""{paipan_text}

【用神分析】{yongshen.analysis}
【旺衰分析】{wangshuai.summary}

请基于以上排盘信息和用户的提问，进行专业解读。"""

    if not settings.ANTHROPIC_API_KEY:
        # Fallback: rule-based interpretation
        async for chunk in _rule_based_interpretation(paipan, yongshen, wangshuai, question):
            yield chunk
        return

    # Claude API streaming
    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        async with client.messages.stream(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": full_context}],
        ) as stream:
            async for text in stream.text_stream:
                yield text
    except Exception:
        async for chunk in _rule_based_interpretation(paipan, yongshen, wangshuai, question):
            yield chunk


async def _rule_based_interpretation(
    paipan: PaipanResult,
    yongshen: YongshenResult,
    wangshuai: WangShuaiResult,
    question: str,
) -> AsyncGenerator[str, None]:
    """Rule-based interpretation fallback when no AI API key."""
    text = _build_rule_based_text(paipan, yongshen, wangshuai, question)
    # Simulate streaming by yielding chunks
    chunk_size = 30
    for i in range(0, len(text), chunk_size):
        yield text[i:i + chunk_size]


def _build_rule_based_text(
    paipan: PaipanResult,
    yongshen: YongshenResult,
    wangshuai: WangShuaiResult,
    question: str,
) -> str:
    lines = []

    # 1. 卦象总览
    lines.append("【卦象总览】")
    lines.append(f"本卦为{paipan.ben_gua['name']}，卦辞曰：「{paipan.ben_gua['gua_ci']}」")
    lines.append(f"大意：{paipan.ben_gua['interpretation']}")
    if paipan.bian_gua:
        lines.append(f"变卦为{paipan.bian_gua['name']}，表示事情的发展方向。")
        lines.append(f"变卦辞曰：「{paipan.bian_gua['gua_ci']}」")
    if paipan.hu_gua:
        lines.append(f"互卦{paipan.hu_gua['name']}揭示事情的内在因素。")
    lines.append("")

    # 2. 动爻详解
    lines.append("【动爻详解】")
    if paipan.dong_yao:
        for d in paipan.dong_yao:
            hex_data = next((h for h in __import__("app.data.hexagram_seed", fromlist=["HEXAGRAMS"]).HEXAGRAMS if h["gua_index"] == paipan.ben_gua["index"]), None)
            if hex_data:
                yao_keys = list(hex_data["yao_ci"].keys())
                if d <= len(yao_keys):
                    lines.append(f"第{d}爻动：{yao_keys[d-1]}「{hex_data['yao_ci'][yao_keys[d-1]]}」")
    else:
        lines.append("静卦，各爻不变。以本卦卦辞为主要参考。")
    lines.append("")

    # 3. 用神分析
    lines.append("【用神分析】")
    lines.append(yongshen.analysis)
    if yongshen.recommended_line:
        yl = yongshen.recommended_line
        for wsl in wangshuai.lines:
            if wsl.position == yl["position"]:
                lines.append(f"用神第{yl['position']}爻{wsl.zhi}：月{wsl.month_status} 日{wsl.day_status} → 综合{wsl.overall}")
    lines.append("")

    # 4. 关键爻象
    lines.append("【世应关系】")
    shi_line = next((l for l in paipan.lines if l.shiying == "世"), None)
    ying_line = next((l for l in paipan.lines if l.shiying == "应"), None)
    if shi_line and ying_line:
        lines.append(f"世爻第{shi_line.position}爻({shi_line.liuqin}) — 代表你自身")
        lines.append(f"应爻第{ying_line.position}爻({ying_line.liuqin}) — 代表所问之事/对方")
        shi_element = WUXING[shi_line.najia_zhi]
        ying_element = WUXING[ying_line.najia_zhi]
        if SHENG_MAP.get((shi_element, ying_element)):
            lines.append("世生应：你主动付出，事情需要你的努力推动。")
        elif SHENG_MAP.get((ying_element, shi_element)):
            lines.append("应生世：事情对你有利，对方/环境会给你支持。")
        elif KE_MAP.get((shi_element, ying_element)):
            lines.append("世克应：你可以掌控局面，但需要付出精力。")
        elif KE_MAP.get((ying_element, shi_element)):
            lines.append("应克世：需要注意对方的阻力或外部压力。")
        else:
            lines.append("世应比和：关系和谐，双方在同一频道上。")
    lines.append("")

    # 5. 综合判断
    lines.append("【综合判断】")
    # Calculate overall assessment
    good_count = sum(1 for wsl in wangshuai.lines if wsl.overall in ("旺盛", "偏旺"))
    bad_count = sum(1 for wsl in wangshuai.lines if wsl.overall in ("衰弱", "偏弱"))
    if good_count > bad_count and shi_line and ying_line:
        shi_element = WUXING[shi_line.najia_zhi]
        ying_element = WUXING[ying_line.najia_zhi]
        if SHENG_MAP.get((ying_element, shi_element)):
            lines.append("吉凶判断：**吉** — 卦象总体向好，爻象配合，用神得位。")
            lines.append("信心指数：**7/10**")
        else:
            lines.append("吉凶判断：**中偏吉** — 卦象有积极因素，但需注意细节。")
            lines.append("信心指数：**6/10**")
    elif good_count < bad_count:
        lines.append("吉凶判断：**中偏凶** — 卦象提示较多阻碍，建议谨慎行事。")
        lines.append("信心指数：**4/10**")
    else:
        lines.append("吉凶判断：**中平** — 卦象有吉有凶，关键在于自身的选择和行动。")
        lines.append("信心指数：**5/10**")
    lines.append("")

    # 6. 行动建议
    lines.append("【行动建议】")
    lines.append("1. 结合本卦的启示，明确当前处境和自身定位。")
    if paipan.bian_gua:
        lines.append(f"2. 关注变卦{paipan.bian_gua['name']}的发展趋势，提前做好准备。")
    if paipan.dong_yao:
        lines.append("3. 动爻是关键转折点，注意相关时间节点的变化。")
    lines.append("4. 保持积极心态，六爻的启示是指引而非宿命。")
    lines.append("5. 建议结合实际情况综合判断，重大决策请多方考量。")

    return "\n".join(lines)


# Late import fix
from app.core.paipan import WUXING, SHENG_MAP, KE_MAP
