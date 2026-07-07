---
title: "Can LLM Speak Description Language? — Three Levels"
title_zh: "LLM 能否说描述语言？— 三层研究框架"
date: 2026-07-07
category: Research
tags: [KR, thesis, LLM, description-logic]
subtitle: "Parse, generate, and reason — a three-level framework for evaluating LLM formal language ability."
subtitle_zh: "读懂、生成、推理 — 评测 LLM 形式语言能力的三个层次。"
publish: true
pin: false
---

## 研究标题

**Can large language model speak description language?**

## 核心问题分解

「会说」描述语言可拆成三个层次，由浅到深：

| 层次 | 能力 | 评测方式 | 通过标准（草案） |
|------|------|----------|------------------|
| **L1 Parse** | 读懂 Manchester/DL，解释或转写 | NL → 解释；Manchester → DL 记号 | 语义一致 |
| **L2 Generate** | 按意图生成合法描述语言 | NL/competency question → axiom | 语法正确 + 语义忠实 |
| **L3 Reason** | 在描述逻辑层面做推理 | 给定 TBox/ABox，回答 subsumption 等 | 与 reasoner 一致 |

## 假设（待 refine）

- H1: LLM 在 L1 上明显强于 L3
- H2: Manchester 表面语法正确率 ≠ 逻辑语义正确率
- H3: Reasoner-in-the-loop 可显著提升 L2/L3

## 与知识库的关系

- L1/L2 依赖语法层多语法对照表作为 gold
- L3 依赖四大推理任务 + HermiT/ELK 等作为 oracle

## TODO

- [ ] 正式写进 proposal 的 RQ 表述
- [ ] 选定 baseline 模型与 benchmark
- [ ] 定义各层 metric 计算公式
