# 论文笔记

有意思的 Agent、LLM、对齐与系统方向论文阅读记录。

## 索引

| 日期 | 论文 | 一句话摘要 | 链接 |
|------|------|-----------|------|
| 2026-01-27 | Self-Distilled Reasoner (OPSD) | 单模型双 context：用标准解作 privileged teacher，on-policy logit 自蒸馏，数学推理上 4–8× token 效率于 GRPO | [笔记](./2026-01-27-opsd-self-distilled-reasoner.md) |
| 2026-01-28 | Self-Distillation Enables Continual Learning (SDFT) | Demo-conditioned self-teacher 做 on-policy 蒸馏，持续学新技能并显著减轻 catastrophic forgetting | [笔记](./2026-01-28-sdft-continual-learning.md) |
| 2026-01-29 | Reinforcement Learning via Self-Distillation (SDPO) | 环境 rich feedback → retrospective self-teacher，per-token credit assignment，可 drop-in 替换 GRPO advantage | [笔记](./2026-01-29-sdpo-reinforcement-learning-self-distillation.md) |
| 2026-02-02 | Expanding RL via Textual Feedback (RLTF) | 训练期 2-turn text critique 内化进 single-turn policy；RLTF-SD + Feedback Modeling 双方法 | [笔记](./2026-02-02-rltf-text-feedback.md) |
| 2026-07-14 | Self-Distillation 系列横向对比 | OPSD / SDFT / SDPO / RLTF 统一心智模型、对照表、选型决策树与 Agent 工程映射 | [笔记](./2026-07-14-self-distillation-methods-comparison.md) |
| 2026-03-10 | OpenClaw-RL: Train Any Agent Simply by Talking | 异步四组件 RL：把 next-state（用户回复/工具输出）同时转成 PRM 标量奖励与 OPD token 级指导，个人 OpenClaw「用着变强」+ 通用 Agent 规模化训练 | [笔记](./2026-03-10-openclaw-rl.md) |
| 2026-06-24 | Thinking to Recall | 简单单跳 QA 上 reasoning 扩展参数知识边界：计算缓冲 + 事实 priming 双机制；中间事实幻觉会拖累最终答案 | [笔记](./2026-06-24-thinking-to-recall.md) |

## 阅读模板

新建笔记时可参考：

```markdown
# 论文标题

- **作者 / 机构**：
- **链接**：
- **阅读日期**：

## 核心问题

## 方法要点

## 与 Agent 的关联

## 个人评价
```
