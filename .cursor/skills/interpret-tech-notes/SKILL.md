---
name: interpret-tech-notes
description: >-
  将论文、博客、前沿应用技术解读为 Learning 仓库风格笔记（Markdown 或 HTML）。
  触发：用户要求解读/精读/摘录论文、个人博客、公司 Research Blog、开源 Agent 项目或应用技术；
  写到 papers/、personal-blogs/、company-blogs/、frontier-apps/、model-training/；
  或提到「写笔记」「技术深挖」「学习手册」「HTML explainer」「会话整合」。
---

# 技术内容解读 → 学习笔记

把外部材料或代码仓库，写成 **可检索、可复习、可横向对比** 的学习笔记。三种内容类型共用工作流；**输出格式按场景在 Markdown 与 HTML 间取舍**（见 [references/format-guide.md](references/format-guide.md)）。

## 输出格式（先选型，再动笔）

| 类型 | 默认格式 | 何时升级 HTML |
|------|----------|---------------|
| **论文** | Markdown | 一般不升级 |
| **博客** | Markdown | 一般不升级 |
| **应用技术** | Markdown（短文） | ≥150 行、≥3 张图、需标签页/折叠/配色分级、用户要浏览器可读 → **HTML** 或 **MD 摘要 + HTML 全文** |

**Cursor 现实**：Markdown 利于编辑器内阅读与 Agent grep；HTML 利于浏览器精读与分享，Chat 内不会内嵌渲染。长应用技术推荐双文件：`.md` 进索引，`.html` 承载全文。

## 先判定内容类型

| 类型 | 典型输入 | 输出目录 | 深挖目标 |
|------|----------|----------|----------|
| **论文** | arXiv / PDF / 官方 page | `papers/` | 问题—方法—证据—局限—与 Agent 关联 |
| **博客** | 个人或公司博文 URL | `personal-blogs/` 或 `company-blogs/` | 论点—证据—新意—可行动结论 |
| **应用技术** | 开源仓库 / 产品文档 / 会话深挖 | `frontier-apps/` 或 `model-training/` | **代码级**调用链、循环、上下文工程、横向对比 |

不确定时：有本地代码仓库或要 trace 实现 → **应用技术**；只有网页/PDF → 论文或博客。

## 统一工作流

```
0. 选格式 → 1. 收集材料 → 2. 定读者与范围 → 3. 列大纲 → 4. 深挖取证
→ 5. 写正文 → 6. 补附录 → 7. 更新索引 → 8. 验证
```

### Step 0：选格式

按 [references/format-guide.md](references/format-guide.md) 决策树。动笔前明确：`.md` only / `.html` only / 双文件。

### Step 1：收集材料

- **论文**：标题、作者、链接、发表日期；优先读 Abstract / Introduction / Method / Experiments / Limitations。
- **博客**：URL、作者/公司、发布日期；抓核心论点与非常规洞察，不逐段翻译。
- **应用技术**：仓库路径、默认分支、官方文档 URL；定位入口文件（README、架构文档、核心 loop 文件）。

工具优先级：Read 本地代码 > 官方文档 > WebFetch 原文 > WebSearch 补背景。

### Step 2：定读者与范围

**Markdown** 文首 metadata：

```markdown
> **来源**：[链接 / 仓库 / Cursor 会话 id]
> **阅读日期**：YYYY-MM-DD
> **读者定位**：算法工程师 / 系统工程师 / …
> **范围**：本文覆盖 …；不覆盖 …
```

**HTML** 用 `<dl class="meta">` 同等字段；双文件时在 `.md` 顶部链到 `.html`。

应用技术额外写：**仓库路径**、**一句话心智模型**。

### Step 3：列大纲（动笔前必做）

- 论文 / 博客：8–12 个二级标题即可。
- 应用技术：先列 **目录索引表**（章节 | 主题 | 关键文件），再写正文。
- HTML：同步规划 `<nav>` 锚点与 `<section id="sN">`。

大纲原则：**按数据流 / 调用链组织**，不要按仓库文件夹字母序堆砌。

### Step 4：深挖取证（质量核心）

**所有类型**

- 每个非平凡结论要有出处：论文式 → 章节/图表；博客 → 原文段落；代码 → `path/to/file`（必要时带行号）。
- 术语首次出现给一句定义；中英可并列。
- 不编造未读内容；读不到就标「待验证」。

**应用技术额外必挖**（`frontier-apps` 精髓，**与格式无关**）

1. **调用链**：用户输入 → 调度 → 主循环 → LLM → 工具 → 持久化，标清函数/模块名。
2. **核心循环**：ReAct 变体？一层还是多层 while？steer / interrupt / follow-up 语义？
3. **Thread / Turn / Session / Event / Item**：若项目有，必须画清概念边界。
4. **上下文工程**：什么进 history、什么每轮重算、首轮全量 vs diff、compact、记忆是否跨 session。
5. **Skills / MCP / Tools / Sandbox**：加载时机、优先级、与 system/developer 消息的关系。
6. **Prompt Cache 影响**：哪些变更会使前缀 cache 失效。
7. **关键设计决策**：编号列出 3–7 条「为什么这样设计」。
8. **横向对比**：与仓库内已有笔记（OpenCode / Codex / OpenClaw 等）做对照表，突出差异。
9. **测试即规格**：集成测试若断言 request body / snapshot，写入附录。

### Step 5：写正文

| 类型 | Markdown 模板 | HTML 模板 |
|------|---------------|-----------|
| 论文 | [references/paper-template.md](references/paper-template.md) | — |
| 博客 | [references/blog-template.md](references/blog-template.md) | — |
| 应用技术 | [references/app-tech-template.md](references/app-tech-template.md) | [references/html-template.md](references/html-template.md) |

**Markdown 写作**

- 中文为主；代码路径、API 名保留英文。
- 复杂链路用 Mermaid → 遵守 `draw-mermaid-diagrams` skill。

**HTML 写作**

- 自包含单文件，无 CDN；`prefers-color-scheme` 适配明暗色。
- 左侧 sticky 目录 + 章节锚点；附录 `<details>` 折叠。
- 架构图 **优先内嵌 SVG**（不依赖 Mermaid CI）；对照表用 styled `<table>`。
- 可选：复制命令按钮、纯 CSS 标签页；不引入构建步骤。

### Step 6：附录（应用技术几乎必写）

- 代码文件索引、文档 URL、阅读顺序/实验命令、一张表速查
- HTML 中放折叠 `<details>`，避免首屏过长

### Step 7：更新索引

- 命名：`YYYY-MM-DD-简短标题.md`（摘要或全文）；HTML 同名 `.html`
- 更新对应目录 `README.md`：**索引行链到 `.md`**；摘要内链到 HTML 完整版

### Step 8：验证

| 格式 | 验证 |
|------|------|
| Markdown + Mermaid | `npm run validate:mermaid` |
| HTML | 浏览器打开目测布局、锚点、SVG；关键路径 Grep/Read |
| 应用技术 | [references/depth-checklist.md](references/depth-checklist.md) |

## 三种类型的深度差异（必守）

### 论文 — 读懂贡献与边界

- 重点：核心问题、方法直觉、关键实验、局限、与 Agent/LLM 工程的关系。
- **固定 Markdown**；篇幅通常 1–3 屏。

### 博客 — 提炼论点，不是摘要翻译

- 重点：作者新观点、论据、差异、可行动结论。
- **固定 Markdown**；篇幅通常 1–2 屏。

### 应用技术 — 代码级深挖（最高标准）

以 `frontier-apps/*-note.md` 为质量标准；超长时升 HTML 不改深度要求。

- 读者不看源码也能懂主链路；看源码能按笔记定位文件。
- 必须含：目录索引、架构图、对比表、设计决策、代码索引、阅读顺序。
- 篇幅可达长文；HTML 用导航与折叠降阅读成本。

## 产出检查（发表前）

对照 [references/depth-checklist.md](references/depth-checklist.md)。

## 与仓库其他 skill 协作

- Markdown 画图 → `draw-mermaid-diagrams`
- HTML 画图 → 内嵌 SVG（默认）；Mermaid 仅当 SVG 过重
- 应用技术横向对比 → 先 Read 已有 `*-note.md` / `*.html`

## 示例触发

- 「解读这篇 arXiv 论文，写到 papers/」（→ Markdown）
- 「精读 Anthropic HTML 这篇 blog，摘录到 company-blogs/」（→ Markdown）
- 「像 codex-note 一样深挖 Cursor Agent，写成 HTML explainer」（→ HTML 或双文件）
- 「把 OpenCode V2 讨论整合成学习手册，浏览器可读」（→ MD 摘要 + HTML）
