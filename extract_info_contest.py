from __future__ import annotations

import json
import re
from pathlib import Path

from docx import Document


ROOT = Path(__file__).resolve().parent
SOURCE_DIR = Path("/Users/Lily/Desktop/高斯年文件集/5.参赛作品/信息素养-星火征途2026/复赛")
OUT = ROOT / "info_data.js"


TOPIC_RULES = [
    ("场景建模", ["故事背景", "场景", "管理", "系统", "计划", "记录", "查询"]),
    ("输入输出与格式", ["输入格式", "输出格式", "样例输入", "样例输出", "格式"]),
    ("顺序分支循环", ["闰年", "月份", "达标", "判断", "if", "for", "while", "累计"]),
    ("数学与枚举", ["面积", "因子", "组合", "排列", "可能", "最短路径长度", "距离", "平方", "坐标"]),
    ("排序与排名", ["排序", "排名", "排行榜", "从高到低", "降序", "字典序", "前几名"]),
    ("字典与映射", ["查询", "名称", "类别", "班级", "统计", "累加", "奖牌", "总数", "制作者"]),
    ("栈队列与链表", ["队列", "stack", "queue", "链表"]),
    ("搜索与图", ["迷宫", "最短路径", "BFS", "DFS", "路径", "墙壁", "方格"]),
    ("递推递归", ["递推", "递归", "连续子序列", "最大效力"]),
    ("字符串处理", ["字符串", "密码", "日记", "碎片", "END", "日期", "时间段"]),
]


def clean(text: str) -> str:
    text = text.replace("\u3000", " ").replace("\xa0", " ")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def doc_text(path: Path) -> str:
    doc = Document(str(path))
    paras = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return clean("\n".join(paras))


def infer_topics(text: str) -> list[str]:
    topics = []
    low = text.lower()
    for topic, keys in TOPIC_RULES:
        if any(k.lower() in low for k in keys):
            topics.append(topic)
    return topics or ["综合应用"]


def exam_name(path: Path) -> str:
    m = re.search(r"模拟\((.)\)卷", path.name)
    return f"信息素养复赛模拟({m.group(1)})卷" if m else path.stem


def split_tasks(text: str) -> list[str]:
    question_area = re.split(r"###\s*题目\s*1\s*答案|【参考答案】|答案（C\+\+代码）", text, maxsplit=1)[0]
    if re.search(r"(?m)^###\s*题目\s*\d+\s*[:：]", question_area):
        pattern = r"(?m)(?=^###\s*题目\s*\d+\s*[:：])"
    else:
        pattern = r"(?m)(?=^\d+\s*[.．、]\s*[\u4e00-\u9fff][^\n]{0,40}(?:【问题描述】)?\s*$)"
    starts = list(re.finditer(pattern, question_area))
    chunks = []
    for i, start in enumerate(starts):
        end = starts[i + 1].start() if i + 1 < len(starts) else len(question_area)
        chunk = question_area[start.start() : end].strip()
        chunk = re.split(r"【参考程序】|###\s*题目\s*\d+\s*答案", chunk, maxsplit=1)[0].strip()
        if len(chunk) > 80:
            chunks.append(chunk)
    return chunks


def title_from_chunk(chunk: str, fallback: str) -> str:
    first = chunk.splitlines()[0].strip()
    first = re.sub(r"^###\s*题目\s*\d+\s*[:：]\s*", "", first)
    first = re.sub(r"^\d+\s*[.．、]\s*", "", first)
    first = first.split("【问题描述】")[0].strip()
    return first or fallback


def build_payload() -> dict:
    docs = sorted(p for p in SOURCE_DIR.glob("*.docx") if "去答案版" not in p.name)
    programs = []
    for path in docs:
        text = doc_text(path)
        name = exam_name(path)
        for idx, chunk in enumerate(split_tasks(text), start=1):
            title = title_from_chunk(chunk, f"第 {idx} 题")
            programs.append(
                {
                    "id": f"{path.stem}-P{idx}",
                    "contest": "全国青少年信息素养大赛智能算法挑战赛复赛",
                    "exam": name,
                    "number": idx,
                    "title": title,
                    "topics": infer_topics(chunk),
                    "content": chunk,
                    "source": path.name,
                }
            )

    objective_questions = [
        {
            "id": "INFO-O1",
            "type": "single",
            "topic": "考试形式",
            "question": "2026 信息素养大赛智能算法挑战赛复赛客观题部分的分值结构更接近哪一项？",
            "options": {"A": "5 道单选共 10 分，5 道多选共 20 分", "B": "15 道单选共 30 分", "C": "10 道判断共 20 分", "D": "只有编程题"},
            "answer": ["A"],
        },
        {
            "id": "INFO-O2",
            "type": "multi",
            "topic": "复赛补强",
            "question": "和 GESP 五级相比，信息素养 C++ 复赛更需要额外补强哪些内容？",
            "options": {"A": "set/map/pair 等关联容器", "B": "stack/queue 任务建模", "C": "场景化输入输出与数据统计", "D": "只背选择题答案"},
            "answer": ["A", "B", "C"],
        },
        {
            "id": "INFO-O3",
            "type": "single",
            "topic": "评分规则",
            "question": "复赛编程题按测试数据通过率给分时，最重要的训练习惯是？",
            "options": {"A": "只写样例能过即可", "B": "先覆盖边界和多组测试，再提交", "C": "把所有变量名写得很短", "D": "不用考虑复杂度"},
            "answer": ["B"],
        },
        {
            "id": "INFO-O4",
            "type": "multi",
            "topic": "C++考点",
            "question": "图片中的 C++ 复赛考点包含哪些方向？",
            "options": {"A": "模拟、枚举、高精度", "B": "前缀和、二分、DFS、BFS", "C": "set/map/pair、栈、队列", "D": "第三方库和模板直接套用"},
            "answer": ["A", "B", "C"],
        },
        {
            "id": "INFO-O5",
            "type": "single",
            "topic": "做题策略",
            "question": "看到“班级、姓名、次数、查询、汇总”这类场景题，通常优先考虑什么结构？",
            "options": {"A": "map 或 vector<pair<...>>", "B": "只用一个 int", "C": "递归求阶乘", "D": "线性筛"},
            "answer": ["A"],
        },
    ]

    return {
        "meta": {
            "name": "全国青少年信息素养大赛智能算法挑战赛复赛",
            "track": "C++ 复赛",
            "note": "本模块用于 2026 年 7 月复赛备赛，题源为本地模拟卷与用户提供的复赛趋势资料。",
            "format": [
                "总分 100 分",
                "客观题 30 分：单选 5 题 × 2 分，多选 5 题 × 4 分",
                "编程操作题 70 分：4 道核心编程题，前 2 题各 15 分，后 2 题各 20 分",
                "初中组考试时长 120 分钟",
                "评分按测试数据通过率给分",
            ],
        },
        "gespComparison": [
            {"area": "高度重合", "items": ["顺序/分支/循环", "模拟", "枚举", "递归递推", "二分", "贪心", "复杂度", "高精度", "基础数论"]},
            {"area": "信息素养更强调", "items": ["真实场景建模", "多字段数据记录", "查询与统计", "排序排名", "set/map/pair", "stack/queue", "DFS/BFS", "前缀和"]},
            {"area": "备赛策略", "items": ["GESP 五级继续打算法基础", "信息素养模块专练 4 题限时编程", "每题补边界测试和多组测试"]},
        ],
        "extraTopics": [
            {"title": "场景化建模", "points": ["把题目里的角色、物品、记录转成变量或结构体", "先写输入字段表，再决定用数组、vector、map 还是 pair", "输出格式要严格照样例"]},
            {"title": "关联容器 set/map/pair", "points": ["map 适合按名称、类别、班级汇总或查询", "set 适合去重和有序集合", "pair 适合把名称-分数、时间-课程等二元信息放在一起排序"]},
            {"title": "栈、队列与搜索", "points": ["queue 常用于 BFS 最短路", "stack 可模拟撤销、括号、路径回退", "迷宫题优先想 BFS：状态、队列、访问标记、方向数组"]},
            {"title": "前缀和与区间", "points": ["频繁求区间和时先建 prefix 数组", "区间 [l,r] 的和可用 prefix[r]-prefix[l-1]", "注意 0 下标和 1 下标边界"]},
            {"title": "限时编程策略", "points": ["先保前两题稳定拿分", "后两题先写朴素正确版，再优化复杂度", "每题至少自造 2 组边界数据"]},
        ],
        "objectiveQuestions": objective_questions,
        "programs": programs,
    }


def main() -> None:
    payload = build_payload()
    OUT.write_text("window.INFO_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Wrote {OUT} with {len(payload['programs'])} information-literacy programming tasks.")


if __name__ == "__main__":
    main()
