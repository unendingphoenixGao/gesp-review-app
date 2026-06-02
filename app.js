const DATA = window.GESP_DATA || { questions: [], programs: [], exams: [] };

const OFFICIAL_TOPICS = [
  "初等数论",
  "高精度",
  "链表",
  "欧几里得算法",
  "质数与筛法",
  "质因数分解",
  "二分与查找",
  "贪心",
  "分治与排序",
  "递归与迭代",
  "复杂度",
];

const KNOWLEDGE = {
  "初等数论": {
    summary: "五级数论重点包括整除、同余、最大公约数、最小公倍数、质数和质因数分解。",
    points: ["看到“同时发生”“公共周期”常想到最小公倍数。", "看到“最大边长”“最大公因子”常想到 gcd。", "数论题先判断是 gcd、lcm、质数还是分解。"],
  },
  "计算机基础": {
    summary: "样题会出现少量基础常识，如输入输出设备、硬件组成、内存和指针释放。",
    points: ["麦克风是输入设备，不是输出设备。", "输出设备常见有显示器、打印机、音箱。", "C++ 动态申请的内存通常用 delete 释放。"],
  },
  "链表": {
    summary: "数组适合随机访问，链表适合频繁插入删除。五级常考 next、prev、头结点、哑结点、循环链表。",
    points: ["删除结点先改前后指针，再释放被删结点。", "哑结点可以统一处理删除头结点和中间结点。", "循环链表遍历通常用 do...while 回到 head 结束。"],
  },
  "递归与迭代": {
    summary: "递归把大问题拆成同类小问题，迭代用循环推进状态。考试常比较时间和额外空间。",
    points: ["递归必须有边界条件。", "斐波那契朴素递归会重复计算，复杂度高。", "迭代通常空间更省，状态变化要写清楚。"],
  },
  "分治与排序": {
    summary: "分治把问题拆成更小的同类子问题。五级大纲点名归并排序、快速排序，也常和递归一起考。",
    points: ["二分查找、归并排序、快速排序都体现分治。", "归并排序通常稳定，快速排序通常不稳定。", "快排平均效率高，但最坏情况可能退化。"],
  },
  "欧几里得算法": {
    summary: "gcd(a,b) = gcd(b, a % b)，直到 b 为 0，返回 a。",
    points: ["每一步把较大问题变成更小的余数问题。", "递归写法短，循环写法更省调用栈。", "手算调用序列是高频题型。"],
  },
  "质数与筛法": {
    summary: "埃氏筛从 i*i 开始筛倍数；线性筛保证每个合数只被最小质因子筛一次。",
    points: ["判断质数只需试除到 sqrt(n)。", "埃氏筛内层 j += i。", "线性筛遇到 i % primes[j] == 0 要 break。"],
  },
  "质因数分解": {
    summary: "唯一分解定理：大于 1 的整数能唯一分解成若干质数的乘积。",
    points: ["先处理因子 2，再枚举奇数因子。", "循环到 i*i <= n 即可。", "最后 n > 1 时，n 本身是剩余质因子。"],
  },
  "复杂度": {
    summary: "复杂度描述输入变大时，运行时间或空间增长的速度。",
    points: ["链表查找通常 O(n)。", "二分查找 O(log n)。", "嵌套循环要看总执行次数，不只数层数。"],
  },
  "二分与查找": {
    summary: "二分查找在有序序列上找值；二分答案是在答案范围上找满足条件的最小或最大值。",
    points: ["left <= right 是常见查找循环条件。", "mid = left + (right-left)/2 可避免溢出。", "二分答案的关键是写出单调的 check(mid)。"],
  },
  "高精度": {
    summary: "官方大纲要求 C++ 用数组模拟高精度加、减、乘、除，核心是按位处理和进位/借位。",
    points: ["加法从低位到高位，当前位 sum % 10，进位 sum / 10。", "减法要处理借位，并注意前导零。", "乘除可以先掌握大整数和一位/普通整数的运算。"],
  },
  "贪心": {
    summary: "贪心每一步做当前看起来最好的选择，适合有局部最优能推出全局最优的题。",
    points: ["硬币找零在规范币值下常用贪心。", "不是所有题都能贪心，要能证明选择安全。", "题目问“每一步当前最优”通常指贪心。"],
  },
  "模拟": {
    summary: "模拟题按规则维护状态，关键是指针、计数器和结束条件。",
    points: ["约瑟夫问题常用循环链表。", "删除当前结点前要保留后继。", "循环停止条件要对应只剩一个人或一个结点。"],
  },
  "模运算": {
    summary: "同余表示两个数除以同一个模数的余数相同。",
    points: ["a ≡ b (mod m) 意味着 m 能整除 a-b。", "gcd 与取模关系紧密。", "取模常用于余数、循环和整除判断。"],
  },
  "综合基础": {
    summary: "混合考查语法、算法概念和代码阅读。",
    points: ["先看题目问正确还是错误。", "再定位横线处变量的前后关系。", "最后用一个小样例手动跑一遍。"],
  },
};

let quiz = [];
let current = 0;
let answers = JSON.parse(localStorage.getItem("gespAnswers") || "{}");

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function unique(arr) {
  return [...new Set(arr)].filter(Boolean);
}

function allTopics() {
  return unique(OFFICIAL_TOPICS.concat(DATA.questions.flatMap((q) => q.topics), DATA.programs.flatMap((p) => p.topics)));
}

function topicCount(topic) {
  return DATA.questions.filter((q) => q.topics.includes(topic)).length;
}

function saveAnswers() {
  localStorage.setItem("gespAnswers", JSON.stringify(answers));
}

function setView(name) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === name));
}

function renderStats() {
  $("#statQuestions").textContent = `${DATA.questions.length} 道选择题`;
  $("#statPrograms").textContent = `${DATA.programs.length} 组编程题`;
  $("#statMastery").textContent = `${allTopics().length} 个知识点`;
}

function renderReview() {
  $("#topicGrid").innerHTML = allTopics()
    .map((topic) => {
      const item = KNOWLEDGE[topic] || KNOWLEDGE["综合基础"];
      return `
        <article class="topic-card">
          <h3>${topic}</h3>
          <p>${item.summary}</p>
          <ul>${item.points.map((p) => `<li>${p}</li>`).join("")}</ul>
          <div class="footer">
            <span class="pill">${topicCount(topic)} 道选择题</span>
            <button data-topic="${topic}" class="practice-topic">练这个</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function fillFilters() {
  const topics = ["全部知识点", ...allTopics()];
  $("#topicFilter").innerHTML = topics.map((t) => `<option>${t}</option>`).join("");
  $("#programTopicFilter").innerHTML = topics.map((t) => `<option>${t}</option>`).join("");
  $("#examFilter").innerHTML = ["全部试卷", ...DATA.exams.map((e) => e.name)].map((e) => `<option>${e}</option>`).join("");
}

function filteredQuestions() {
  const topic = $("#topicFilter").value;
  const exam = $("#examFilter").value;
  const wrongOnly = $("#wrongOnly").checked;
  return DATA.questions.filter((q) => {
    const topicOk = topic === "全部知识点" || q.topics.includes(topic);
    const examOk = exam === "全部试卷" || q.exam === exam;
    const wrongOk = !wrongOnly || answers[q.id]?.correct === false;
    return topicOk && examOk && wrongOk;
  });
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeQuiz() {
  const size = Math.max(5, Math.min(50, Number($("#quizSize").value) || 15));
  quiz = shuffle(filteredQuestions()).slice(0, size);
  current = 0;
  renderQuestion();
}

function renderQuestion() {
  const q = quiz[current];
  $("#quizEmpty").hidden = Boolean(q);
  $("#quizQuestion").hidden = !q;
  updateScore();
  if (!q) return;

  $("#questionIndex").textContent = `第 ${current + 1} / ${quiz.length} 题`;
  $("#questionSource").textContent = `${q.exam} 第 ${q.number} 题`;
  $("#questionTitle").textContent = q.topics.join(" · ");
  const optionEntries = Object.entries(q.options || {});
  const hasFullOptions = optionEntries.length >= 4;
  $("#questionBody").textContent = (hasFullOptions ? q.question : q.raw).replace(/^第\s*\d+\s*题\s*/, "").trim();

  $("#optionList").innerHTML = hasFullOptions
    ? optionEntries
        .slice(0, 4)
        .map(([letter, text]) => `
          <button class="option" data-letter="${letter}">
            <span class="letter">${letter}</span>
            <span>${escapeHtml(text)}</span>
          </button>
        `)
        .join("")
    : ["A", "B", "C", "D"]
        .map((letter) => `
          <button class="option" data-letter="${letter}">
            <span class="letter">${letter}</span>
            <span>${escapeHtml(q.options?.[letter] || "见上方原题内容")}</span>
          </button>
        `)
        .join("");

  $("#feedback").hidden = true;
  const previous = answers[q.id]?.choice;
  if (previous) showAnswer(previous, false);
}

function showAnswer(choice, record = true) {
  const q = quiz[current];
  if (!q) return;
  const correct = choice === q.answer;
  $$(".option").forEach((button) => {
    const letter = button.dataset.letter;
    button.classList.toggle("correct", letter === q.answer);
    button.classList.toggle("wrong", letter === choice && !correct);
  });
  const box = $("#feedback");
  box.hidden = false;
  box.classList.toggle("bad", !correct);
  box.innerHTML = correct
    ? `答对了。答案是 <strong>${q.answer}</strong>。`
    : `这题先记一下：你选了 <strong>${choice}</strong>，正确答案是 <strong>${q.answer}</strong>。`;
  if (record) {
    answers[q.id] = { choice, correct };
    saveAnswers();
    updateScore();
  }
}

function updateScore() {
  const done = quiz.filter((q) => answers[q.id]).length;
  const right = quiz.filter((q) => answers[q.id]?.correct).length;
  $("#scoreText").textContent = `${right} / ${done}`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderProgramming() {
  const topic = $("#programTopicFilter").value || "全部知识点";
  const list = DATA.programs.filter((p) => topic === "全部知识点" || p.topics.includes(topic));
  $("#programList").innerHTML =
    list
      .map((p) => {
        const mainTopic = p.topics[0] || "综合基础";
        const k = KNOWLEDGE[mainTopic] || KNOWLEDGE["综合基础"];
        return `
          <details class="program-card">
            <summary>${p.exam} · ${escapeHtml(p.title)}</summary>
            <div class="question-meta">${p.topics.map((t) => `<span>${t}</span>`).join("")}</div>
            <div class="steps">
              <div class="step"><strong>先复习</strong><br>${k.summary}</div>
              <div class="step"><strong>想步骤</strong><br>${k.points[0] || "先拆输入、处理、输出。"}</div>
              <div class="step"><strong>再写代码</strong><br>列变量、边界条件、循环或递归终点。</div>
            </div>
            <pre>${escapeHtml(p.content)}</pre>
          </details>
        `;
      })
      .join("") || `<div class="empty">这个知识点暂时没有编程题。</div>`;
}

function renderBank() {
  const key = $("#bankSearch").value.trim().toLowerCase();
  const list = DATA.questions.filter((q) => {
    const text = `${q.exam} ${q.topics.join(" ")} ${q.question} ${Object.values(q.options || {}).join(" ")}`.toLowerCase();
    return !key || text.includes(key);
  });
  $("#bankList").innerHTML = list
    .map(
      (q) => `
        <article class="bank-card">
          <div class="question-meta">
            <span>${q.exam} 第 ${q.number} 题</span>
            ${q.topics.map((t) => `<span>${t}</span>`).join("")}
          </div>
          <h3>${escapeHtml(q.question.replace(/^第\s*\d+\s*题\s*/, "").slice(0, 220))}</h3>
          <p class="answer">答案：${q.answer || "未识别"}</p>
        </article>
      `
    )
    .join("");
}

function bindEvents() {
  $$(".tab").forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
  $("#startQuizFromReview").addEventListener("click", () => {
    setView("quiz");
    makeQuiz();
  });
  $("#topicGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".practice-topic");
    if (!button) return;
    $("#topicFilter").value = button.dataset.topic;
    setView("quiz");
    makeQuiz();
  });
  $("#newQuiz").addEventListener("click", makeQuiz);
  $("#optionList").addEventListener("click", (event) => {
    const button = event.target.closest(".option");
    if (button) showAnswer(button.dataset.letter);
  });
  $("#prevQuestion").addEventListener("click", () => {
    current = Math.max(0, current - 1);
    renderQuestion();
  });
  $("#nextQuestion").addEventListener("click", () => {
    current = Math.min(quiz.length - 1, current + 1);
    renderQuestion();
  });
  $("#programTopicFilter").addEventListener("change", renderProgramming);
  $("#bankSearch").addEventListener("input", renderBank);
}

function init() {
  renderStats();
  renderReview();
  fillFilters();
  renderProgramming();
  renderBank();
  bindEvents();
}

init();
