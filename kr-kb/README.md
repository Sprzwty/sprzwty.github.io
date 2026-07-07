# KR Knowledge Base

Personal knowledge base for graduate research on **Knowledge Representation**, centered on the thesis:

> **Can large language model speak description language?**

## Scope

- Description Logic (DL), Manchester Syntax, OWL / Semantic Web
- Knowledge Graphs
- LLM × symbolic KR bridging (generation, parsing, verification)

## Structure

| Prefix | Domain |
|--------|--------|
| `00-meta` | Index, templates, tagging rules |
| `10-logic` | Logic foundations |
| `20-description-logic` | DL core |
| `30-syntax-layer` | Manchester / Functional-Style / serializations |
| `40-semantic-web` | OWL profiles, ontology engineering, reasoners |
| `50-knowledge-graph` | KG construction, embedding, QA |
| `60-llm` | LLM foundations (prompting, structured output) |
| `70-llm-kr-bridge` | Research core: NL↔DL, benchmarks, neuro-symbolic |
| `80-thesis` | RQs, experiments, writing assets |
| `90-glossary` | One term per card |

## Conventions

- One concept per note; front matter in YAML; body in Markdown.
- Use `[[wikilinks]]` for cross-references (Obsidian-compatible).
- Maturity: `seed` → `draft` → `evergreen`.
- Tag thesis-relevant notes with `thesis-relevant` in front matter.

## Workflow

1. Capture literature in Zotero → generate `paper-note` from template.
2. Extract 1–3 `concept` cards per paper.
3. Link concepts in domain MOC; update `00-meta/MOC-总索引.md`.
4. Commit via Git (Obsidian Git or manual).

## MVP roadmap

See `00-meta/MOC-总索引.md` for the prioritized 25-entry list.

## 发布到博客

需要同步到 Notion 博客的文章放在 [`notion-sync/`](../notion-sync/) 目录（按 front matter 配置）。`kr-kb/` 仅作本地知识库草稿区。
