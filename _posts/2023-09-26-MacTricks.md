---

layout: post
title: 2023.09.25-MacTricks
subtitle: "随时更新，不断丰富"
date: 2023-09-25
categories: Experience
author: Wang Tongyu
cover: https://images.unsplash.com/photo-1577609703810-dd98726bf6a8
cover_author: 'Kalen Emsley'
cover_author_link: 'https://unsplash.com/@kalenemsley'
tags: Experience
pin: true

---

# macOS通用命令
##应用功能部分
### 1. 提示应用无法打开或开发者签名无效等问题

`sudo xattr -rd com.apple.quarantine `+应用路径

例如：`sudo xattr -rd com.apple.quarantine /Applications/Safari Technology Preview.app`

### 2. 打开任意来源安装应用
`sudo spctl --master-disable`

### 3. Time Machine 全速备份指令
`sudo sysctl debug.lowpri\_throttle_enabled=0`