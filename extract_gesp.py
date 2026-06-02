from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "data.js"


TOPIC_RULES = [
    ("计算机基础", ["输出设备", "输入设备", "计算机硬件", "存储器", "控制器", "运算器"]),
    ("链表", ["链表", "结点", "节点", "next", "prev", "循环链表", "双向"]),
    ("递归与迭代", ["递归", "迭代", "递推", "调用序列", "fibonacci", "fib", "factorial"]),
    ("分治与排序", ["分治", "归并", "快速排序", "快排", "merge", "quick", "sort", "排序"]),
    ("欧几里得算法", ["gcd", "最大公约数", "辗转相除", "欧几里得", "欧⼏⾥"]),
    ("质数与筛法", ["素数", "质数", "筛", "is_prime", "primes", "埃氏", "埃⽒", "线性筛", "欧拉"]),
    ("质因数分解", ["质因数", "唯一分解", "唯⼀分解", "分解定理"]),
    ("复杂度", ["时间复杂度", "空间复杂度", "效率"]),
    ("二分与查找", ["二分", "二分答案", "二分枚举", "查找", "binarySearch", "search"]),
    ("高精度", ["高精度", "⾼精度", "carry", "to_string", "大整数"]),
    ("贪心", ["贪心", "贪⼼", "最优选择", "硬币"]),
    ("模拟", ["约瑟夫", "模拟", "遍历", "输出"]),
    ("模运算", ["同余", "取模", "模", "%"]),
]


def clean_text(text: str) -> str:
    text = text.replace("\u3000", " ").replace("\xa0", " ")
    text = text.replace("！=", "!=").replace("⽉", "月").replace("⽇", "日")
    text = re.sub(r"页\s*\d+\s*共\s*/\s*页\s*\d+\s*第", "", text)
    text = re.sub(r"第\s*\d+\s*页\s*/\s*共\s*\d+\s*页", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def infer_exam_name(pdf: Path, text: str) -> str:
    if "样题" in text[:300]:
        return "GESP 五级样题"
    m = re.search(r"C\+\+\s*[　 ]*五级\s*\n?\s*(\d{4})\s*年\s*(\d{1,2})\s*月", text)
    if m:
        return f"{m.group(1)}年{int(m.group(2)):02d}月"
    return pdf.stem


def extract_answers(text: str) -> list[str]:
    m = re.search(r"答案\s+((?:[A-D]\s*){10,20})", text)
    if not m:
        return []
    return re.findall(r"[A-D]", m.group(1))[:15]


def split_choice_area(text: str) -> str:
    m = re.search(r"(?:一、|1\s*)单选题.*?(?=(?:二、|2\s*)(?:编程题|判断题|程序|$))", text, re.S)
    if m:
        return m.group(0)
    m = re.search(r"第\s*1\s*题.*?(?=2\s*(?:编程题|判断题|程序|二、|$))", text, re.S)
    return m.group(0) if m else text


def split_questions(choice_area: str) -> list[tuple[int, str]]:
    matches = list(re.finditer(r"(?m)(?:第\s*(\d{1,2})\s*题|^\s*(\d{1,2})、)", choice_area))
    result: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        number = int(m.group(1) or m.group(2))
        if number < 1 or number > 15:
            continue
        end = matches[i + 1].start() if i + 1 < len(matches) else len(choice_area)
        chunk = choice_area[m.start() : end].strip()
        result.append((number, chunk))
    seen = set()
    unique = []
    for num, chunk in result:
        if num not in seen:
            unique.append((num, chunk))
            seen.add(num)
    return unique[:15]


def parse_options(chunk: str) -> tuple[str, dict[str, str]]:
    starts = list(re.finditer(r"(?m)^\s*([A-D])\.\s*", chunk))
    if len(starts) < 2:
        return chunk, {}
    question = chunk[: starts[0].start()].strip()
    options: dict[str, str] = {}
    for i, start in enumerate(starts):
        letter = start.group(1)
        end = starts[i + 1].start() if i + 1 < len(starts) else len(chunk)
        value = chunk[start.end() : end].strip()
        value = re.sub(r"\n{3,}", "\n\n", value)
        options[letter] = value
    return question, options


def infer_topics(text: str) -> list[str]:
    topics = []
    low = text.lower()
    for topic, keys in TOPIC_RULES:
        if any(k.lower() in low for k in keys):
            topics.append(topic)
    return topics or ["综合基础"]


def extract_programming(text: str, exam: str, source: str) -> list[dict]:
    m = re.search(r"(?:二、|三、|2\s*|3\s*)(?:编程题|程序设计|编程).*", text, re.S)
    if not m:
        return []
    area = m.group(0).strip()
    chunks = re.split(r"(?=第\s*\d+\s*题|^\s*\d+、)", area, flags=re.M)
    tasks = []
    for idx, chunk in enumerate(chunks):
        if len(chunk.strip()) < 120:
            continue
        title_line = chunk.strip().splitlines()[0]
        tasks.append(
            {
                "id": f"{source}-P{idx + 1}",
                "exam": exam,
                "title": re.sub(r"\s+", " ", title_line)[:80],
                "topics": infer_topics(chunk),
                "content": chunk.strip()[:5000],
                "source": source,
            }
        )
    if not tasks and len(area) > 120:
        tasks.append(
            {
                "id": f"{source}-P1",
                "exam": exam,
                "title": f"{exam} 编程题",
                "topics": infer_topics(area),
                "content": area[:5000],
                "source": source,
            }
        )
    return tasks


def main() -> None:
    questions = []
    programs = []
    exams = []
    for pdf in sorted(ROOT.glob("*.pdf")):
        reader = PdfReader(str(pdf))
        text = clean_text("\n".join(page.extract_text() or "" for page in reader.pages))
        if "认证标准" in text[:500] and "单选题" not in text[:1000]:
            continue
        exam = infer_exam_name(pdf, text)
        answers = extract_answers(text)
        exams.append({"name": exam, "source": pdf.name, "answers": answers, "pages": len(reader.pages)})
        for number, chunk in split_questions(split_choice_area(text)):
            question_text, options = parse_options(chunk)
            answer = answers[number - 1] if number - 1 < len(answers) else ""
            full_text = f"{question_text}\n" + "\n".join(f"{k}. {v}" for k, v in options.items())
            questions.append(
                {
                    "id": f"{pdf.stem}-Q{number}",
                    "exam": exam,
                    "source": pdf.name,
                    "number": number,
                    "answer": answer,
                    "topics": infer_topics(full_text),
                    "question": question_text,
                    "options": options,
                    "raw": chunk,
                }
            )
        programs.extend(extract_programming(text, exam, pdf.stem))

    payload = {
        "generatedFrom": [e["source"] for e in exams],
        "exams": exams,
        "questions": questions,
        "programs": programs,
    }
    OUT.write_text(
        "window.GESP_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT} with {len(questions)} choice questions and {len(programs)} programming sections.")


if __name__ == "__main__":
    main()
