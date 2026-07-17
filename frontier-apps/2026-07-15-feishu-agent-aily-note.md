# 飞书 Agent / Aily 深度分析（摘要）

> **完整版**：[2026-07-15-feishu-agent-aily-note.html](./2026-07-15-feishu-agent-aily-note.html)（浏览器打开精读）
> **来源**：`lark-cli` 实测（v1.0.69）+ 飞书开放平台 / 官网文档 + 仓库内 Claude Tag 笔记 + Slack CLI/MCP 横向对比
> **阅读日期**：2026-07-15
> **读者定位**：Agent 平台工程师、企业 IT/安全管理员
> **范围**：飞书 Aily 产品线（智能伙伴 / 自定义智能体 / 工作助手）、Channel SDK、lark-cli；不覆盖飞书内部模型权重与训练细节

---

## 一句话

**飞书 Agent 栈在「交付即用 + 飞书生态深度集成」上领先，但在 multiplayer 隔间模型上更接近「一个数字员工进 N 个群 + (user×chat) 记忆隔离」，而非 Claude Tag 的「频道级 Agent identity bundle」——你的「同一身份进多群导致效果下降」假设部分成立，需从 Identity / Memory / Context 三层分别论证。**

---

## 目录

| 章节 | 主题 | 完整版锚点 |
|------|------|------------|
| §1 | 飞书 Agent 产品谱系与心智模型 | `#s1` |
| §2 | lark-cli 实证（whoami / doctor / im / event） | `#s2` |
| §3 | Aily 三条产品线对比 | `#s3` |
| §4 | Claude Tag 隔间模型（引用已有笔记） | `#s4` |
| §5 | **核心分析：同一身份进多群** | `#s5` |
| §6 | Slack CLI / MCP 横向对比 | `#s6` |
| §7 | 优缺点与工程建议 | `#s7` |
| 附录 | 文档 URL、命令速查、待验证 | `#appendix` |

---

## 核心结论（5 条）

1. **lark-cli 已 Agent-Native**：27 embedded skills、JSON 契约（`ok`/`error` 信封）、`read|write|high-risk-write` 风险分级、`--dry-run`/`--jq`；官方 README 却建议 bot **仅作私聊助手、不要进群**——与 Claude Tag「频道 teammate」方向形成对照。

2. **飞书有三层 Agent 产品**：个人 **Aily 智能伙伴**（1 人 1 个）、团队 **Aily 自定义智能体**（一次搭建、一键进群）、企业 **Aily 工作助手**（任务模式 + 虚拟电脑 + MCP 市场）；开发者路径为 **Channel SDK + OpenClaw**。

3. **官方记忆隔离 ≠ Claude Tag 隔间**：自定义智能体 FAQ 声称「每个用户、每个群各自一份独立记忆，物理隔离」——这是 **(user × chat_id) 隐私记忆**，不保证 per-channel 的 persona / connectors / standing instructions 独立。

4. **你的假设需精确化**：问题不只是「同一 bot 进多群」，而是 **同一 Agent 配置（人设、技能、知识空间、MCP、无感进化）服务异构群** → 人设冲突、知识召回噪声、一群进化全局生效；Channel SDK **明确不覆盖** session 隔离与持久化，自建 Agent 若 session key 设计不当会放大风险。

5. **逼近 Claude Tag 的工程路径**：「一群一 Agent 实例」、标准模式替代无感进化、Channel SDK 自管 `chat_id` session key、凭证走中心化注入而非 bot 持密钥。

---

## lark-cli 实证摘录

| 命令 | 关键输出 |
|------|----------|
| `lark-cli whoami` | identity=user，appId=`cli_aadd99110db85bee`，onBehalfOf 冉浚枫 |
| `lark-cli doctor` | 全 pass；`mcp.feishu.cn` 可达 |
| `lark-cli auth status` | user/bot 双 identity ready；user scope 含 `im:message:readonly` 等 |
| `lark-cli im +chat-list` | 2 个群（含 Feishu Assistant 群） |
| `lark-cli im +chat-messages-list` | Feishu Assistant 推送 aily 激活卡片（`cli_a018f84884b8500c`） |
| `lark-cli event list` | `im.message.receive_v1` 等 20+ EventKey |
| `lark-cli skills list` | 27 skills（lark-im / lark-event / lark-task …） |

---

## 为何用 HTML 完整版

- 全文约 400+ 行，含 3 张内嵌 SVG 架构图、6 张对照表、折叠附录
- 浏览器 sticky nav + 锚点，适合精读与分享

---

## 关联阅读

- [Claude Tag：Slack 里的多人 AI 队友](../company-blogs/2026-06-23-claude-tag.md)
- [Agent Identity 访问模型](../company-blogs/2026-06-24-agent-identity-access-model.md)
- [OpenClaw 实现学习笔记](./openclaw-note.md)
