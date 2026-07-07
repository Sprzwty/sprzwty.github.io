---
id: KR-80-001
title: "RQ LLM speak DL 三层定义"
type: concept
domain: [thesis, llm-kr-bridge]
tags: [thesis-relevant, type/concept, status/seed]
status: seed
created: 2026-07-07
updated: 2026-07-07
related:
  - "[[Manchester-Syntax-速查]]"
  - "[[评测指标-语法-逻辑等价-推理一致性]]"
  - "[[Neuro-symbolic-验证回路]]"
thesis-link: core
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

- L1/L2 依赖 [[MOC-Syntax-Layer]] 的多语法对照表作为 gold
- L3 依赖 [[四大推理任务]] + HermiT/ELK 等作为 oracle
- 实验记录用 `00-meta/模板/experiment.md`

## TODO

- [ ] 正式写进 proposal 的 RQ 表述
- [ ] 选定 baseline 模型与 benchmark
- [ ] 定义各层 metric 计算公式
