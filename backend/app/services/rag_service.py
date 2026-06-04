"""
RAG Service — Orchestrates knowledge retrieval and AI interpretation.
Combines vector search results with hexagram data for context-enhanced AI responses.
"""
from typing import AsyncGenerator

from app.services.knowledge_base import get_knowledge_base
from app.core.paipan import PaipanResult, format_paipan_for_ai
from app.core.yongshen import analyze_yongshen, YongshenResult
from app.core.wangshuai import analyze_wangshuai, WangShuaiResult


RAG_SYSTEM_PROMPT = """你是一位精通六爻的命理大师"爻爻"，专门帮人在困惑中做出决策。

## 你的核心任务
用户面对困惑，不知道该如何抉择。你通过六爻排盘的结果，结合经典理论，帮用户分析事情走向并提出明确建议。

## 你的能力
1. 精通《周易》六十四卦卦辞爻辞、《增删卜易》《卜筮正宗》等经典
2. 能够从卦象、爻象、用神、旺衰、世应、生克冲合等多个维度分析
3. 解读风格亲切易懂，既专业又接地气
4. 敢于给出明确的建议，不含糊其辞

## 如何分析用户的问题
1. 从卦象的吉凶倾向判断整体对问题的启示
2. 分析世爻（代表用户自身）的旺衰，判断用户的主动性和掌控力
3. 分析应爻及用神，判断外部环境和事情走向
4. 动爻是关键变化点，分析变化方向
5. 六亲关系反映利弊：妻财旺利于求财，官鬼旺利于事业，等等
6. 参考【参考资料】中的经典规则和案例来支撑你的判断

## 如何使用参考资料
优先参考检索到的经典资料中的规则和案例来支持你的判断。自然地引用，例如：
- "根据《增删卜易》的断卦原则..."
- "《卜筮正宗》中有类似的案例..."

## 输出结构（重要：必须严格遵循）
1. **起卦结果** — 一句话简述得到的本卦和变卦
2. **卦象启示** — 本卦和动爻对当前问题的核心启示
3. **深入分析** — 结合用神、旺衰、世应进行详细分析
4. **结论** — 明确回答用户的问题，给出判断
5. **行动建议** — 给出3-4条具体建议"""


def build_rag_context(
    paipan: PaipanResult,
    question: str,
    category: str = "综合决策",
    month_zhi: str = "子",
    day_zhi: str = "午",
) -> dict:
    """Build the complete RAG context for AI interpretation."""
    kb = get_knowledge_base()

    paipan_text = format_paipan_for_ai(paipan, question)
    yongshen = analyze_yongshen(paipan, question, category)
    wangshuai = analyze_wangshuai(paipan, month_zhi, day_zhi)

    queries = _build_search_queries(paipan, yongshen, wangshuai, question, category)

    all_results = []
    seen_ids = set()
    for query in queries[:4]:
        results = kb.search(query, n_results=3)
        for r in results:
            if r["id"] not in seen_ids:
                all_results.append(r)
                seen_ids.add(r["id"])

    references_text = ""
    if all_results:
        references_text = "\n\n【参考资料 — 以下内容来自经典文献，供你参考】\n\n"
        for i, r in enumerate(all_results[:8], 1):
            src = r["metadata"].get("source", "经典")
            references_text += f"--- 参考{i}（来源：{src}）---\n{r['document']}\n\n"

    full_context = f"""{paipan_text}

【用神分析】{yongshen.analysis}
【旺衰分析】{wangshuai.summary}
{references_text}

请基于以上排盘信息、分析结果和经典参考资料，对用户的问题进行专业分析。记住：一定要给出明确的判断和建议，帮助用户做出决策。"""

    return {
        "paipan_text": paipan_text,
        "yongshen": yongshen,
        "wangshuai": wangshuai,
        "references": all_results,
        "full_context": full_context,
    }


def _build_search_queries(
    paipan: PaipanResult,
    yongshen: YongshenResult,
    wangshuai: WangShuaiResult,
    question: str,
    category: str,
) -> list[str]:
    """Build diverse search queries targeting different aspects of the divination."""
    queries = []

    queries.append(f"{paipan.ben_gua['name']} 卦的含义和解读")

    if yongshen.target_liuqin:
        queries.append(f"{category} {yongshen.target_liuqin} 用神取用")

    if paipan.dong_yao:
        queries.append(f"动爻 第{paipan.dong_yao[0]}爻 判断")

    queries.append(f"月建日建 旺衰判断 {wangshuai.month_zhi}月{wangshuai.day_zhi}日")

    shi_line = next((l for l in paipan.lines if l.shiying == "世"), None)
    if shi_line:
        queries.append(f"{shi_line.liuqin} 持世 的含义")

    if question:
        queries.append(f"{category} {question[:30]}")

    return queries


async def interpret_with_rag_stream(
    paipan: PaipanResult,
    question: str,
    conversation_history: list[dict] | None = None,
    category: str = "综合决策",
    month_zhi: str = "子",
    day_zhi: str = "午",
) -> AsyncGenerator[str, None]:
    """Stream AI interpretation with RAG-enhanced context."""
    from app.config import get_settings
    settings = get_settings()

    rag = build_rag_context(paipan, question, category, month_zhi, day_zhi)

    history_text = ""
    if conversation_history:
        history_text = "\n\n【对话历史】\n"
        for msg in conversation_history[-6:]:
            role = "用户" if msg["role"] == "user" else "爻爻"
            history_text += f"{role}：{msg['content'][:300]}\n"

    full_message = f"{history_text}\n{rag['full_context']}"

    if not settings.ANTHROPIC_API_KEY:
        text = _fallback_interpretation(rag, question)
        for i in range(0, len(text), 40):
            yield text[i:i + 40]
        return

    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        async with client.messages.stream(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=2048,
            system=RAG_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": full_message}],
        ) as stream:
            async for text in stream.text_stream:
                yield text
    except Exception as e:
        yield f"\n\n[AI服务暂时不可用，以下是基于规则的分析]\n\n"
        text = _fallback_interpretation(rag, question)
        for i in range(0, len(text), 40):
            yield text[i:i + 40]


def _fallback_interpretation(rag: dict, question: str) -> str:
    """Rule-based fallback with RAG references."""
    lines = []

    lines.append("【卦象总览】")
    lines.append(rag["paipan_text"].split("【卦辞】")[0] if "【卦辞】" in rag["paipan_text"] else rag["paipan_text"][:200])
    lines.append("")

    if rag["references"]:
        lines.append("【经典参考】")
        for r in rag["references"][:3]:
            src = r["metadata"].get("source", "经典")
            lines.append(f"《{src}》：{r['document'][:200]}...")
        lines.append("")

    lines.append("【用神分析】")
    lines.append(rag["yongshen"].analysis)
    lines.append("")

    lines.append("【旺衰分析】")
    lines.append(rag["wangshuai"].summary)
    lines.append("")

    lines.append("【综合建议】")
    lines.append("1. 结合本卦的启示，明确你的当前处境和自身定位。")
    lines.append("2. 用神的旺衰状态是关键，请关注相关时间节点。")
    lines.append("3. 动爻是变化的触发点，请留意相关方面的发展。")
    lines.append("4. 六爻的启示是指引而非宿命，最终决策权在你手中。")

    return "\n".join(lines)
