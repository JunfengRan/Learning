# Claude Code 用 HTML 输出的「非理性有效」

> **作者**：Thariq Shihipar（Anthropic，Member of Technical Staff；个人实践观点）
> **来源**：[Using Claude Code: The unreasonable effectiveness of HTML](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html)
> **发布**：2026-05-20
> **阅读日期**：2026-07-14
> **类型**：公司 Claude Code 实践 Blog
> **读者定位**：Agent / 工具链工程师、技术负责人、重度 Claude Code / Cursor 用户
> **范围**：为何用 HTML 替代 Markdown 作为 Agent 输出、六大用例与示例 prompt、FAQ；不覆盖 Claude Code CLI 源码
> **完整版（浏览器精读）**：[2026-05-20-claude-code-html-effectiveness.html](./2026-05-20-claude-code-html-effectiveness.html)

---

## 一句话

**当 Agent 承担更复杂的工作时，HTML 比 Markdown 更能承载信息密度与可读性——Claude Code 团队用 HTML 规格/报告/原型把人类拉回「在环」（in the loop），而不是把计划当附件丢过去。**

## 为什么值得读

- **与主流认知的差异**：Agent 生态默认 Markdown（简单、可编辑、可 grep），作者主张 **几乎全面转向 HTML**，且认为 token 增量被「更可能真正被阅读」抵消。
- **与当前学习主题的关联**：直接回应 Learning 仓库 `interpret-tech-notes` 的格式选型——**Markdown 服务 Agent 协作与索引，HTML 服务人类精读与分享**；与 `2026-02-11-harness-engineering` 的「spec 即系统记录」、`2026-06-23-claude-tag` 的协作面扩展形成三角：环境 harness → 输出载体 → 团队交互。

---

## 背景：Markdown 为何开始「不够用」

| Markdown 优势（仍成立） | 作者遇到的瓶颈 |
|------------------------|----------------|
| 简单、便携、部分富文本 | **超过 ~100 行就难以读完**，组织内更难让人通读 |
| 人类易编辑 |  increasingly **不亲手改文件**，而是 prompt Agent 改 → 可编辑性价值下降 |
| Agent 擅长 ASCII 图 | 缺颜色/布局时模型退化为 **ASCII 图、Unicode 估色** 等低效表达 |

作者把产出物当 **spec 与 reference**，而非待手工维护的文档——这改变了格式选型：重点从「人能否改 `.md`」转向「人能否 **快速理解、分享、微调** Agent 的交付物」。

---

## 核心论点

### 论点 1：HTML 的信息密度几乎无上界

- **作者说**：除 Claude 能读的信息外，几乎都能用 HTML 高效表达——表格、CSS 设计、SVG 插图、`<script>` 代码片段、JS+CSS 交互、工作流 SVG、绝对定位/canvas、`<img>` 等。
- **论据**：Markdown 受限时，模型会做更「绕」的事（ASCII 流程图、用 Unicode 字符「估」颜色）。
- **我的理解**：HTML 是 **单向富媒体通道**——模型→人 的信息带宽更大；与 API 的 JSON/Markdown 工具输出不矛盾，这是 **人类可读交付物** 的格式选择。

### 论点 2：复杂工作的可读性 = 可导航 + 可视化

- **作者说**：Claude 能写越来越长的 spec/plan，但 **100 行 Markdown 是实际阅读上限**；HTML 可用标签页、插图、链接、响应式布局组织结构。
- **论据**：团队内 spec/PR 说明若用 HTML，**被同事打开并阅读的概率更高**。
- **我的理解（推断）**：这与技术写作中的「分层披露」（progressive disclosure）同构——HTML 的 `<nav>`、折叠、锚点让 **扫读与深读** 可并存；Markdown 在 GitHub 上虽可渲染，但 **复杂布局与交互** 仍弱。

### 论点 3：分享 friction 决定 spec 是否「活」

- **作者说**：Markdown 浏览器原生渲染差，常需附件；HTML 上传后 **链接即读**。
- **我的理解**：在 Cursor 场景下，Markdown 对 Agent grep 更友好（见本仓库 `format-guide.md`），但 **对外分享 explainer** 时 HTML 单文件双击即读仍是优势。

### 论点 4：双向交互 = 临时「问题专用编辑器」

- **作者说**：HTML 可加 slider/knob 调设计或算法参数，并把结果 **复制回 prompt** 或提交——为 **当前这一份数据** 定制的 throwaway UI，不是产品。
- **关键模式**：UI 操作 → **Export**（copy as JSON / copy as prompt / copy diff）→ 贴回 Claude Code 或写进文件，**收紧 human-in-the-loop**。

### 论点 5：选 Claude Code 而非 Claude.ai 的核心是 **上下文摄入**

- **作者说**：写此文时让 Claude Code 扫描代码目录中所有 HTML 产出、分类并生成带图的 HTML；文中插图即此流程结果。
- **论据**：除文件系统外，还可通过 **MCP**（Slack、Linear 等）、**Claude in Chrome**、**git history** 聚合上下文。
- **我的理解**：HTML 是 **渲染层**；Claude Code 是 **多源 context + 本地文件写入** 的 harness。这与 Cursor Agent + MCP + 仓库只读/写入 的能力边界类似。

### 论点 6：真正动机是「Stay in the loop」

- **作者说**：Agent 越强，越容易 **不细读计划就 hand off**；HTML 让作者 **重新感到参与** Agent 的选择，而非仅接收 Markdown  wall of text。
- **我的理解**：格式是 **注意力工程**——不是 vanity，而是对抗 automation complacency。

---

## 六大用例与示例 Prompt（压缩）

| 用例 | 何时用 HTML | 示例 prompt 要点 |
|------|-------------|------------------|
| **Specs / 规划 / 探索** | 多方案对比、mockup、实现计划、验证 Agent 读全上下文 | 6 种 onboarding 方案 grid 对比；含 mockup、数据流、代码片段的实现计划 HTML |
| **Code review / 理解** | diff 内联批注、严重性配色、流图 | PR review HTML，聚焦 streaming/backpressure，inline margin 注释 |
| **Design / 原型** | 动画/组件可调参；Claude Design 基于 HTML | checkout 按钮动画 + slider + copy 参数按钮 |
| **Reports / 研究 / 学习** | 跨 Slack/代码/git/网页 综合报告；SVG  explainer | rate limiter 单页：token-bucket 图 + 3–4 段注解代码 + gotchas |
| **Custom editing UI** | 拖拽排序、表单编辑 config、prompt  side-by-side 预览 | Linear 票 Now/Next/Later 拖拽 + export Markdown；feature flag 表单 + copy diff |
| **（隐含）验证** | 验证 Agent 读取前期 HTML spec | 新 session 传入全部 HTML 文件再实现 |

**工作流模式（规划）**：

```mermaid
flowchart LR
    explore["探索 HTML\n多方案 brainstorm"]
    mock["Mockup / 接口 HTML"]
    plan["实现计划 HTML"]
    impl["新 session\n带全部 HTML 实现"]
    verify["验证 Agent\n读 spec 对照"]
    explore --> mock --> plan --> impl --> verify
```

---

## FAQ 摘录

| 问题 | 作者回答 |
|------|----------|
| **更费 token 吗？** | 是，但表达力 + 阅读率带来的 **总产出质量** 更高；Opus 4.7 的 1M context 下增量不明显 |
| **还用 Markdown 吗？** | 作者自称 **HTML maximalist**，几乎全面停用 Markdown |
| **取代单一 plan 吗？** | 否——倾向 **多个 HTML 文件** 对应规划不同阶段（实现计划、UI 探索、组件清单），并 **长期保留** 供验证与未来参考 |

**入门门槛**：直接 prompt「make an HTML file / HTML artifact」即可； recurring 模式可再封装为 **Skill**。

---

## 与已有知识的对照

| 主题 | 本文说法 | 其他来源 | 一致性 |
|------|----------|----------|--------|
| Agent 输出格式 | HTML 优先于 Markdown | `interpret-tech-notes/format-guide.md`：论文/博客仍 Markdown，长应用笔记 MD+HTML | **补充**：本文是 **Claude Code 交付物** 视角；Learning 仓库 **索引与 Agent grep** 仍用 MD |
| Spec 系统 | 多 HTML 文件作 reference | `2026-02-11-harness-engineering`：`docs/` + exec-plans | **一致**：都是 **可检索规格**；本文强调 **人类可读层** 用 HTML |
| 设计原型 | Claude Design 基于 HTML | 产品层面未开源 | **待验证** 实现细节 |
| 上下文来源 | FS + MCP + Chrome + git | `codex-note` / Cursor MCP | **一致** |
| 100 行阅读极限 | Markdown 实际可读上限 | 个人经验型断言 | **可参考**，非硬指标 |

### Cursor vs Claude Code（本仓库补充）

| 能力 | Claude Code（本文） | Cursor |
|------|---------------------|--------|
| HTML 预览 | 浏览器 artifact 文化 | 需「在浏览器打开」本地 `.html` |
| Chat 内嵌 | HTML artifact | 不内嵌完整交互页 |
| Agent 读笔记 | 可读 HTML，token 更高 | grep/diff 更偏 Markdown |
| 推荐策略 | 交付物 HTML | **双文件**：`.md` 索引 + `.html` 精读（见 format-guide） |

---

## 工程落点

- **产品行为（事实）**：原文提到 HTML file templates 与 GitHub gallery，但抓取未获得稳定官方 URL；社区可参考 [simsov/claude.html](https://simsov.github.io/claude.html/)（PR review、explainer、triage 示例 + 可粘贴 CLAUDE.md starter）。
- **推断的实现手段**：Claude Code 写单文件 HTML 到工作区 → 用户浏览器打开；交互型文件内嵌 vanilla JS；与 Skills 结合可固化「PR review 页」「explainer 页」模板。
- **对自建 Agent 的启发**：
  1. 长 spec / 架构说明默认 **HTML explainer**，短 changelog 仍 Markdown。
  2. 任何需要 **人类批注、排序、调参** 的中间态，做 throwaway HTML + export 按钮。
  3. 验证阶段显式 `@` 验证 Agent **读取 HTML spec 路径列表**。
  4. 在 Cursor 中可 mirrored：`interpret-tech-notes` 写 **MD 摘要 + HTML 全文**。

---

## 可行动清单

1. **下一次复杂 PR / 架构任务**：要求 Agent 产出单文件 HTML explainer（SVG 流程图 + 折叠 gotchas），而非 200 行 Markdown。
2. **多方案选型**：一张 HTML grid 并排 4–6 种布局/算法，标注 tradeoff，选定后再生成实现计划 HTML。
3. **调参类任务**（动画、easing、prompt 模板）：HTML slider +「copy as prompt」按钮，减少来回描述。
4. **固化模式**：将 recurring 输出（PR review、rate limiter explainer）写入 **Skill**，与 `interpret-tech-notes` 的 HTML 模板对齐。
5. **仓库内实践**：应用技术深挖 ≥150 行或 ≥3 图时，采用 **本笔记同款双文件**（`.md` 进 README 索引，`.html` 浏览器读）。

---

## 仍待验证

- [ ] Anthropic 官方 HTML templates / GitHub gallery 的确切 URL（原文「here」未在抓取中解析；目前仅确认社区 [simsov/claude.html](https://github.com/simsov/claude.html)）。
- [ ] Claude Design 与 Claude Code HTML 工作流的官方集成边界。
- [ ] 团队环境下 HTML spec 的版本管理与 diff 工作流（作者未展开）。

---

## 关联阅读

- 博客：`2026-02-11-harness-engineering.md`（spec 与 harness）
- 博客：`2026-06-23-claude-tag.md`（协作面）
- 技能：`interpret-tech-notes/references/format-guide.md`（MD vs HTML 选型）
- 技能：`interpret-tech-notes/references/html-template.md`（自包含 HTML 笔记骨架）

---

*摘录完成：2026-07-14*
