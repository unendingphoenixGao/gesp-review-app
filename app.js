const DATA = window.GESP_DATA || { questions: [], programs: [], exams: [] };
const INFO = window.INFO_DATA || { meta: {}, gespComparison: [], extraTopics: [], objectiveQuestions: [], programs: [] };

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

const GESP_LESSONS = [
  {
    title: "高精度",
    level: "五级重点",
    when: "题目里的整数可能很大，超过 long long，或要求用数组/字符串模拟大整数加减乘除。",
    points: [
      "用字符串读入大整数，按位转成数字处理。",
      "加法从低位到高位，维护 carry；减法维护 borrow 并去掉前导零。",
      "乘法先掌握大整数 × 一位数、再到大整数 × 大整数。",
      "除法先掌握大整数 ÷ int，逐位试商并维护余数。",
    ],
    code: "string add(string a, string b) {\n    string ans;\n    int i = a.size() - 1, j = b.size() - 1, carry = 0;\n    while (i >= 0 || j >= 0 || carry) {\n        int x = i >= 0 ? a[i--] - '0' : 0;\n        int y = j >= 0 ? b[j--] - '0' : 0;\n        int sum = x + y + carry;\n        ans.push_back(char('0' + sum % 10));\n        carry = sum / 10;\n    }\n    reverse(ans.begin(), ans.end());\n    return ans;\n}",
    practice: "对应 GESP 题型：高精度整数相加、进位/借位填空、数组模拟大整数。",
    links: [
      { label: "OI Wiki：高精度计算", url: "https://oi-wiki.org/math/bignum/" },
      { label: "洛谷题单：高精度", url: "https://www.luogu.com.cn/training/102" },
    ],
  },
  {
    title: "二分与查找",
    level: "五级重点",
    when: "有序序列中找数，或答案具有单调性：某个答案可行，更大的/更小的也可行。",
    points: [
      "二分查找要求序列有序，每次用 mid 缩小一半范围。",
      "二分答案不是找数组元素，而是在答案范围里找最小可行值或最大可行值。",
      "关键是写出 check(mid)，判断 mid 是否满足条件。",
      "注意 left、right、mid 更新，避免死循环。",
    ],
    code: "int binarySearch(vector<int>& a, int target) {\n    int l = 0, r = (int)a.size() - 1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (a[mid] == target) return mid;\n        if (a[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}",
    practice: "对应 GESP 题型：二分查找循环次数、查找失败时 left/right 变化、二分答案入门。",
    links: [
      { label: "OI Wiki：二分", url: "https://oi-wiki.org/basic/binary/" },
      { label: "C语言中文网：二分查找算法", url: "https://c.biancheng.net/algorithm/binary-search.html" },
    ],
  },
  {
    title: "链表",
    level: "五级高频",
    when: "题目出现结点、next、prev、头结点、哑结点、循环链表、插入删除。",
    points: [
      "单链表只有 next，双链表有 prev 和 next。",
      "删除结点前先保存要删除的指针，再改链接，最后 delete。",
      "哑结点可以统一处理删除头结点和中间结点。",
      "循环链表遍历要小心停止条件，常见是回到 head。",
    ],
    code: "Node dummy(0);\ndummy.next = head;\nNode* cur = &dummy;\nwhile (cur->next) {\n    if (cur->next->val == x) {\n        Node* del = cur->next;\n        cur->next = del->next;\n        delete del;\n    } else {\n        cur = cur->next;\n    }\n}\nhead = dummy.next;",
    practice: "对应 GESP 题型：链表插入删除填空、双链表 prev/next 指针顺序、循环链表遍历。",
    links: [
      { label: "OI Wiki：链表", url: "https://oi-wiki.org/ds/linked-list/" },
      { label: "C语言中文网：C++ 链表", url: "https://c.biancheng.net/view/337.html" },
    ],
  },
  {
    title: "欧几里得算法与最小公倍数",
    level: "五级重点",
    when: "题目问最大公约数、最小公倍数、公共周期、最大正方形边长。",
    points: [
      "gcd(a,b)=gcd(b,a%b)，直到 b 为 0。",
      "循环写法更省栈空间，递归写法更短。",
      "lcm(a,b)=a/gcd(a,b)*b，先除再乘可减少溢出。",
      "手算调用序列是选择题常考点。",
    ],
    code: "int gcd(int a, int b) {\n    while (b != 0) {\n        int t = a % b;\n        a = b;\n        b = t;\n    }\n    return a;\n}\n\nlong long lcm(long long a, long long b) {\n    return a / gcd(a, b) * b;\n}",
    practice: "对应 GESP 题型：gcd 调用顺序、辗转相除法、公共周期问题。",
    links: [
      { label: "OI Wiki：最大公约数", url: "https://oi-wiki.org/math/number-theory/gcd/" },
    ],
  },
  {
    title: "质数、埃氏筛与线性筛",
    level: "五级重点",
    when: "题目要求判断质数、生成素数表、比较埃氏筛和线性筛。",
    points: [
      "单个数判质数只需要试除到 sqrt(n)。",
      "埃氏筛从 i*i 开始筛，因为更小倍数已被更小质因子筛过。",
      "线性筛每个合数只被最小质因子筛一次。",
      "线性筛里 if (i % primes[j] == 0) break 很关键。",
    ],
    code: "vector<int> primes;\nvector<bool> isComposite(n + 1, false);\nfor (int i = 2; i <= n; i++) {\n    if (!isComposite[i]) primes.push_back(i);\n    for (int j = 0; j < primes.size() && i * primes[j] <= n; j++) {\n        isComposite[i * primes[j]] = true;\n        if (i % primes[j] == 0) break;\n    }\n}",
    practice: "对应 GESP 题型：埃氏筛内层循环、线性筛横线填空、质数判断复杂度。",
    links: [
      { label: "OI Wiki：筛法", url: "https://oi-wiki.org/math/number-theory/sieve/" },
      { label: "OI Wiki：素数", url: "https://oi-wiki.org/math/number-theory/prime/" },
    ],
  },
  {
    title: "质因数分解与唯一分解定理",
    level: "五级重点",
    when: "题目要求把整数拆成质因数，或判断唯一分解定理的含义。",
    points: [
      "唯一分解定理：大于 1 的整数能唯一分解成若干质数乘积。",
      "先处理因子 2，再枚举奇数因子。",
      "循环到 i*i <= n 即可。",
      "最后如果 n > 1，说明剩下的 n 是一个质因子。",
    ],
    code: "vector<int> factor(int n) {\n    vector<int> ans;\n    for (int i = 2; i * i <= n; i++) {\n        while (n % i == 0) {\n            ans.push_back(i);\n            n /= i;\n        }\n    }\n    if (n > 1) ans.push_back(n);\n    return ans;\n}",
    practice: "对应 GESP 题型：质因数枚举边界、唯一分解定理判断。",
    links: [
      { label: "OI Wiki：唯一分解定理", url: "https://oi-wiki.org/math/number-theory/unique-factorization-theorem/" },
      { label: "OI Wiki：质因数分解", url: "https://oi-wiki.org/math/number-theory/pollard-rho/" },
    ],
  },
  {
    title: "递归、迭代与递推",
    level: "五级高频",
    when: "题目让比较递归和循环，或阅读阶乘、斐波那契、求和代码。",
    points: [
      "递归要有边界条件，否则会无限调用。",
      "递归会占用调用栈；迭代通常更省空间。",
      "朴素递归斐波那契会重复计算，复杂度很高。",
      "递推是用前面的结果推出后面的结果。",
    ],
    code: "int fibIter(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}",
    practice: "对应 GESP 题型：阶乘填空、斐波那契复杂度、递归调用序列。",
    links: [
      { label: "OI Wiki：递归", url: "https://oi-wiki.org/basic/recursion/" },
      { label: "OI Wiki：递推", url: "https://oi-wiki.org/basic/recursion/#%E9%80%92%E6%8E%A8" },
    ],
  },
  {
    title: "贪心",
    level: "五级常考",
    when: "题目强调每一步选当前最优，比如找零、排序后选择、局部最优策略。",
    points: [
      "贪心不是试所有情况，而是每一步做当前最优选择。",
      "能用贪心必须有理由：局部最优能推出全局最优。",
      "选择题常问“核心思想是什么”。",
      "做编程题时先想清楚排序规则或选择规则。",
    ],
    code: "vector<int> coins = {100, 50, 20, 10, 5, 2, 1};\nint money;\ncin >> money;\nfor (int c : coins) {\n    int cnt = money / c;\n    money %= c;\n    cout << c << \"元: \" << cnt << endl;\n}",
    practice: "对应 GESP 题型：硬币找零、局部最优概念、贪心与枚举区分。",
    links: [
      { label: "OI Wiki：贪心", url: "https://oi-wiki.org/basic/greedy/" },
    ],
  },
  {
    title: "分治与排序",
    level: "五级补强",
    when: "题目出现把问题拆成左右两半、归并排序、快速排序、递归排序。",
    points: [
      "分治三步：分解、解决子问题、合并结果。",
      "二分查找、归并排序、快速排序都体现分治思想。",
      "归并排序通常稳定，快速排序通常不稳定。",
      "快排平均复杂度高效，但最坏情况可能退化。",
    ],
    code: "void quickSort(vector<int>& a, int l, int r) {\n    if (l >= r) return;\n    int i = l, j = r, pivot = a[(l + r) / 2];\n    while (i <= j) {\n        while (a[i] < pivot) i++;\n        while (a[j] > pivot) j--;\n        if (i <= j) swap(a[i++], a[j--]);\n    }\n    quickSort(a, l, j);\n    quickSort(a, i, r);\n}",
    practice: "对应 GESP 题型：哪些算法体现分治、排序稳定性、复杂度判断。",
    links: [
      { label: "OI Wiki：分治", url: "https://oi-wiki.org/basic/divide-and-conquer/" },
      { label: "OI Wiki：排序简介", url: "https://oi-wiki.org/basic/sort-intro/" },
    ],
  },
];

let quiz = [];
let current = 0;
const STORAGE_KEY = "gespAnswers";
const INFO_STORAGE_KEY = "infoProgramRecords";
let answers = loadAnswers();
let infoRecords = loadInfoRecords();

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

function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAnswers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

function loadInfoRecords() {
  try {
    return JSON.parse(localStorage.getItem(INFO_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveInfoRecords() {
  localStorage.setItem(INFO_STORAGE_KEY, JSON.stringify(infoRecords));
}

function recordFor(questionId) {
  const record = answers[questionId];
  if (!record) return null;
  return {
    choice: record.choice || record.lastChoice || "",
    correct: Boolean(record.correct),
    attempts: Number(record.attempts || 1),
    everWrong: Boolean(record.everWrong || record.correct === false),
    lastAt: record.lastAt || "",
  };
}

function progressSummary() {
  const practiced = DATA.questions.filter((q) => recordFor(q.id)).length;
  const currentWrong = DATA.questions.filter((q) => recordFor(q.id)?.correct === false).length;
  const everWrong = DATA.questions.filter((q) => recordFor(q.id)?.everWrong).length;
  const correct = DATA.questions.filter((q) => recordFor(q.id)?.correct === true).length;
  const remaining = Math.max(0, DATA.questions.length - practiced);
  const accuracy = practiced ? Math.round((correct / practiced) * 100) : 0;
  return { practiced, currentWrong, everWrong, correct, remaining, accuracy };
}

function infoSummary() {
  const done = INFO.programs.filter((p) => infoRecords[p.id]?.done).length;
  return { done, total: INFO.programs.length, remaining: Math.max(0, INFO.programs.length - done) };
}

function setView(name) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
  $$(".view").forEach((view) => view.classList.toggle("active", view.id === name));
}

function renderStats() {
  const progress = progressSummary();
  $("#statQuestions").textContent = `${DATA.questions.length} 道选择题`;
  $("#statPracticed").textContent = `已练 ${progress.practiced} 道`;
  $("#statWrong").textContent = `错题 ${progress.currentWrong} 道`;
  $("#statInfo").textContent = `信息素养 ${infoSummary().total} 题`;
}

function renderProgress() {
  const progress = progressSummary();
  $("#progressPracticed").textContent = progress.practiced;
  $("#progressRemaining").textContent = progress.remaining;
  $("#progressWrong").textContent = progress.currentWrong;
  $("#progressAccuracy").textContent = `${progress.accuracy}%`;
  $("#sideProgress").textContent = `${progress.practiced} / ${DATA.questions.length}`;
  $("#sideWrong").textContent = progress.currentWrong;
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
  $("#gespLessonList").innerHTML = GESP_LESSONS.map(renderLessonCard).join("");
}

function renderLessonCard(lesson) {
  return `
    <details class="lesson-card">
      <summary>
        <span>${escapeHtml(lesson.title)}</span>
        <em>${escapeHtml(lesson.level)}</em>
      </summary>
      <div class="lesson-body">
        <p class="lesson-when"><strong>什么时候用：</strong>${escapeHtml(lesson.when)}</p>
        <ul>${lesson.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
        <pre class="code-block">${escapeHtml(lesson.code)}</pre>
        <p><strong>练习方向：</strong>${escapeHtml(lesson.practice)}</p>
        <div class="resource-links">
          ${lesson.links.map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}
        </div>
      </div>
    </details>
  `;
}

function fillFilters() {
  const topics = ["全部知识点", ...allTopics()];
  $("#topicFilter").innerHTML = topics.map((t) => `<option>${t}</option>`).join("");
  $("#programTopicFilter").innerHTML = topics.map((t) => `<option>${t}</option>`).join("");
  $("#examFilter").innerHTML = ["全部试卷", ...DATA.exams.map((e) => e.name)].map((e) => `<option>${e}</option>`).join("");
  const infoTopics = ["全部知识点", ...unique(INFO.programs.flatMap((p) => p.topics))];
  $("#infoTopicFilter").innerHTML = infoTopics.map((t) => `<option>${t}</option>`).join("");
}

function filteredQuestions() {
  const topic = $("#topicFilter").value;
  const exam = $("#examFilter").value;
  const mode = $("#practiceMode").value;
  return DATA.questions.filter((q) => {
    const record = recordFor(q.id);
    const topicOk = topic === "全部知识点" || q.topics.includes(topic);
    const examOk = exam === "全部试卷" || q.exam === exam;
    const modeOk =
      mode === "all" ||
      (mode === "unpracticed" && !record) ||
      (mode === "wrong" && record?.correct === false) ||
      (mode === "reviewed" && Boolean(record));
    return topicOk && examOk && modeOk;
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

function startMode(mode) {
  $("#practiceMode").value = mode;
  setView("quiz");
  makeQuiz();
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
  const previous = recordFor(q.id)?.choice;
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
    const previous = recordFor(q.id);
    answers[q.id] = {
      choice,
      lastChoice: choice,
      correct,
      attempts: (previous?.attempts || 0) + 1,
      everWrong: Boolean(previous?.everWrong || !correct),
      lastAt: new Date().toISOString(),
    };
    saveAnswers();
    updateScore();
    renderStats();
    renderProgress();
    renderBank();
  }
}

function updateScore() {
  const done = quiz.filter((q) => answers[q.id]).length;
  const right = quiz.filter((q) => recordFor(q.id)?.correct).length;
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

function renderInfo() {
  const summary = infoSummary();
  $("#infoTitle").textContent = INFO.meta.name || "全国青少年信息素养大赛智能算法挑战赛复赛";
  $("#infoFormat").innerHTML = (INFO.meta.format || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#infoProgress").textContent = `${summary.done} / ${summary.total}`;

  $("#infoComparison").innerHTML = (INFO.gespComparison || [])
    .map(
      (group) => `
        <article class="topic-card">
          <h3>${escapeHtml(group.area)}</h3>
          <ul>${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");

  $("#infoTopicGrid").innerHTML = (INFO.extraTopics || [])
    .map(
      (topic) => `
        <article class="topic-card">
          <h3>${escapeHtml(topic.title)}</h3>
          <ul>${topic.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");

  $("#infoLessonList").innerHTML = (INFO.lessons || [])
    .map(
      (lesson) => renderLessonCard(lesson)
    )
    .join("");

  $("#infoObjectiveList").innerHTML = (INFO.objectiveQuestions || [])
    .map((q) => {
      const type = q.type === "multi" ? "多选" : "单选";
      const answer = Array.isArray(q.answer) ? q.answer.join("、") : q.answer;
      return `
        <details class="bank-card">
          <summary>${type} · ${escapeHtml(q.topic)} · ${escapeHtml(q.question)}</summary>
          <div class="options compact-options">
            ${Object.entries(q.options)
              .map(([letter, text]) => `<div class="option readonly"><span class="letter">${letter}</span><span>${escapeHtml(text)}</span></div>`)
              .join("")}
          </div>
          <p class="answer">答案：${escapeHtml(answer)}</p>
        </details>
      `;
    })
    .join("");
  renderInfoPrograms();
}

function renderInfoPrograms() {
  const topic = $("#infoTopicFilter").value || "全部知识点";
  const status = $("#infoStatusFilter").value || "all";
  const list = INFO.programs.filter((p) => {
    const done = Boolean(infoRecords[p.id]?.done);
    const topicOk = topic === "全部知识点" || p.topics.includes(topic);
    const statusOk = status === "all" || (status === "done" && done) || (status === "undone" && !done);
    return topicOk && statusOk;
  });

  $("#infoProgramList").innerHTML =
    list
      .map((p) => {
        const done = Boolean(infoRecords[p.id]?.done);
        return `
          <details class="program-card info-program ${done ? "done" : ""}">
            <summary>${done ? "已完成" : "未练习"} · ${p.exam} 第 ${p.number} 题 · ${escapeHtml(p.title)}</summary>
            <div class="question-meta">
              <span class="${done ? "status-normal" : "status-review"}">${done ? "已完成" : "未练习"}</span>
              ${p.topics.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}
            </div>
            <div class="steps">
              <div class="step"><strong>建模</strong><br>${infoAdvice(p, 0)}</div>
              <div class="step"><strong>数据结构</strong><br>${infoAdvice(p, 1)}</div>
              <div class="step"><strong>测试</strong><br>样例之外，再补空值、边界、重复数据或最大数据。</div>
            </div>
            <pre>${escapeHtml(p.content)}</pre>
            <div class="actions">
              <button class="mark-info" data-info-id="${p.id}" data-done="${done ? "0" : "1"}">${done ? "标记未完成" : "标记已完成"}</button>
            </div>
          </details>
        `;
      })
      .join("") || `<div class="empty">没有符合条件的信息素养复赛题。</div>`;
}

function infoAdvice(program, index) {
  const topics = program.topics.join(" ");
  if (index === 0) {
    if (topics.includes("搜索与图")) return "把格子、位置、步数抽象成状态，先判断是否需要 BFS。";
    if (topics.includes("字典与映射")) return "先列出每条记录的字段，再确定按哪个字段查询或汇总。";
    if (topics.includes("排序与排名")) return "明确排序键：分数、次数、频率、字典序，注意同分规则。";
    return "把故事背景翻译成输入、处理、输出三部分。";
  }
  if (topics.includes("搜索与图")) return "queue + visited + 方向数组通常是最短路题的骨架。";
  if (topics.includes("字典与映射")) return "优先考虑 map<string, ...> 或 vector<pair<...>>。";
  if (topics.includes("排序与排名")) return "使用 vector 存记录，再用 sort 写比较规则。";
  if (topics.includes("数学与枚举")) return "先写朴素枚举，确认复杂度能通过再优化。";
  return "先用变量或结构体保存数据，再按题意模拟。";
}

function renderBank() {
  const key = $("#bankSearch").value.trim().toLowerCase();
  const status = $("#bankStatusFilter").value;
  const list = DATA.questions.filter((q) => {
    const record = recordFor(q.id);
    const text = `${q.exam} ${q.topics.join(" ")} ${q.question} ${Object.values(q.options || {}).join(" ")}`.toLowerCase();
    const keyOk = !key || text.includes(key);
    const statusOk =
      status === "all" ||
      (status === "unpracticed" && !record) ||
      (status === "correct" && record?.correct === true) ||
      (status === "wrong" && record?.correct === false) ||
      (status === "everWrong" && record?.everWrong);
    return keyOk && statusOk;
  });
  $("#bankList").innerHTML = list
    .map(
      (q) => {
        const record = recordFor(q.id);
        const statusText = !record ? "未练习" : record.correct ? "已答对" : "当前错题";
        const extra = record?.everWrong && record.correct ? "曾错已订正" : "";
        return `
        <article class="bank-card">
          <div class="question-meta">
            <span>${q.exam} 第 ${q.number} 题</span>
            <span class="${record?.correct === false ? "status-wrong" : "status-normal"}">${statusText}</span>
            ${extra ? `<span class="status-review">${extra}</span>` : ""}
            ${q.topics.map((t) => `<span>${t}</span>`).join("")}
          </div>
          <h3>${escapeHtml(q.question.replace(/^第\s*\d+\s*题\s*/, "").slice(0, 220))}</h3>
          <p class="answer">答案：${q.answer || "未识别"}${record ? ` · 已练 ${record.attempts} 次 · 上次选 ${record.choice}` : ""}</p>
        </article>
      `;
      }
    )
    .join("") || `<div class="empty">没有符合条件的题目。</div>`;
}

function bindEvents() {
  $$(".tab").forEach((tab) => tab.addEventListener("click", () => setView(tab.dataset.view)));
  $("#startQuizFromReview").addEventListener("click", () => {
    startMode("all");
  });
  $("#continueQuiz").addEventListener("click", () => startMode("unpracticed"));
  $("#topicGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".practice-topic");
    if (!button) return;
    $("#topicFilter").value = button.dataset.topic;
    startMode("unpracticed");
  });
  $("#newQuiz").addEventListener("click", makeQuiz);
  $("#clearRecords").addEventListener("click", () => {
    if (!confirm("确定要清空所有已练题和错题记录吗？清空后不能恢复。")) return;
    answers = {};
    saveAnswers();
    quiz = [];
    current = 0;
    renderStats();
    renderProgress();
    renderQuestion();
    renderBank();
  });
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
  $("#bankStatusFilter").addEventListener("change", renderBank);
  $("#infoTopicFilter").addEventListener("change", renderInfoPrograms);
  $("#infoStatusFilter").addEventListener("change", renderInfoPrograms);
  $("#infoShowUndone").addEventListener("click", () => {
    $("#infoStatusFilter").value = "undone";
    renderInfoPrograms();
  });
  $("#infoShowAll").addEventListener("click", () => {
    $("#infoStatusFilter").value = "all";
    renderInfoPrograms();
  });
  $("#infoProgramList").addEventListener("click", (event) => {
    const button = event.target.closest(".mark-info");
    if (!button) return;
    infoRecords[button.dataset.infoId] = {
      done: button.dataset.done === "1",
      updatedAt: new Date().toISOString(),
    };
    saveInfoRecords();
    renderStats();
    renderInfo();
  });
}

function init() {
  renderStats();
  renderProgress();
  renderReview();
  fillFilters();
  renderInfo();
  renderProgramming();
  renderBank();
  bindEvents();
}

init();
