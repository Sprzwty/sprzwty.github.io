---
layout: page
home-title: 更新日志
description: 网站更新与变更记录
permalink: /logs.html
---

# 更新日志

## 2026

- **06-30** — 仓库架构重构（`0.1.0`）
  - 分离主题开发文件与博客内容
  - 合并双 `_config` 为单一配置文件
  - 升级全部前端依赖（webpack 5.108、sass 1.101、webpack-cli 7 等）
  - CI/CD 简化为单一部署流水线，加入 npm build 步骤
  - 加入版本锁文件（`Gemfile.lock`、`package-lock.json`）保证可复现构建
  - 新增操作文档 `docs/OPERATIONS.md`
  - 修复 CDN 版本不一致（PrismJS 统一至 1.29.0）

## 部署信息

| 托管方 | 域名 | 说明 |
|--------|------|------|
| GitHub Pages | [sprzwty.github.io](https://sprzwty.github.io) | 主站，CI 自动部署 |
