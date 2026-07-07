---
title: "Manchester Syntax Cheat Sheet"
title_zh: "Manchester Syntax 速查"
date: 2026-07-07
category: Research
tags: [KR, manchester-syntax, description-logic, thesis]
subtitle: "OWL 2 human-readable syntax keywords mapped to description logic constructors."
subtitle_zh: "OWL 2 面向人类的类表达式语法，与描述逻辑构造子对照速查。"
publish: true
pin: false
---

## 一句话定义

> Manchester Syntax 是 OWL 2 面向人类的类/属性表达式写法，用英文关键词（`some`, `only`, `and`, `or`, `not` 等）对应 DL 构造子。

## 为什么与研究相关

论文问的是 LLM 能否「说」描述语言 — Manchester 是最自然的 **human-facing description language**，是评测 LLM 形式语言能力的首选表面语法。

## 关键词对照（速查表）

| Manchester | DL 直觉 | 示例 |
|------------|---------|------|
| `some` | ∃ 存在限制 | `hasChild some Doctor` |
| `only` | ∀ 全称限制 | `hasChild only Person` |
| `and` | ⊓ 交集 | `Doctor and (hasChild some Person)` |
| `or` | ⊔ 并集 | `Doctor or Lawyer` |
| `not` | ¬ 否定 | `not Doctor` |
| `min`, `max`, `exactly` | 数量限制 | `hasChild min 2 Person` |
| `SubClassOf` | ⊑ | `Dog SubClassOf Animal` |
| `EquivalentTo` | ≡ | `Dog EquivalentTo Canine` |
| `DisjointWith` | 不相交 | `Cat DisjointWith Dog` |
| `Transitive`, `Functional`, … | 角色特性 | `hasPart Transitive` |

## 完整示例

```
Prefix: : <http://example.org/kr#>

Class: Doctor
    EquivalentTo: Person and (hasDegree some MedicalDegree)

Class: Parent
    EquivalentTo: Person and (hasChild some Person)

Class: DoctorParent
    EquivalentTo: Doctor and Parent
```

## LLM 常见错误模式（待实验填充）

- [ ] 混淆 `some` 与 `only`
- [ ] 括号/优先级错误
- [ ] 将 `SubClassOf` 与 `EquivalentTo` 混用
- [ ] 生成合法 Manchester 但语义与 NL 意图不符

## TODO

- [ ] 补全全部 Manchester 关键词
- [ ] 与 Functional-Style 逐条对照
- [ ] 导出为 LLM 评测 gold CSV

## 参考文献

- W3C OWL 2 Manchester Syntax
- Baader et al., *The Description Logic Handbook*
