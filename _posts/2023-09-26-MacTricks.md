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
tags: 
- Experience
pin: true
---

# macOS通用命令
## 应用功能部分
### 1. 提示应用无法打开或开发者签名无效等问题

```
sudo xattr -rd com.apple.quarantine 
``` 
+
`应用路径`

例如：

```
sudo xattr -rd com.apple.quarantine /Applications/Safari Technology Preview.app
```

### 2. 打开任意来源安装应用
```
sudo spctl --master-disable
```

### 3. Time Machine 全速备份指令
```
sudo sysctl debug.lowpri\_throttle_enabled=0
```

### 4. 开盖开机
#### 4.1 开启开盖开机
```
sudo nvram AutoBoot=%03
```
#### 4.2 关闭开盖开机
```
sudo nvram AutoBoot=%00
```

### 5. 开机启动声音
#### 5.1 关闭开机启动声音
```
sudo nvram SystemAudioVolume=%00
```
#### 5.2 恢复开机启动声音
```
sudo nvram -d SystemAudioVolume
```
### 6. Macos清除更新角标
```
defaults write com.apple.appstored BadgeCount 0
killall Dock
rm ~/Library/Preferences/com.apple.appstored.plist
defaults write com.apple.systempreferences AttentionPrefBundleIDs 0
killall Dock
```
###  7. ⌘ +⇧ +5截图阴影开启&关闭指令
```
defaults write com.apple.screencapture disable-shadow -bool true&&killall SystemUIServer
defaults write com.apple.screencapture disable-shadow -bool false&&killall SystemUIServer
```
### 8. 虚拟内存
<!--mac电脑是将内存当作虚拟内存的，通常是不启用的，启用会降低电脑运行速度-->
#### 8.1 启用命令
```
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist
```
<!--虚拟内存容量无法设置。-->
#### 8.2 禁用命令
```
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist
```

### 9. macOS terminal默认shell为bash时自动加载.bashrc的方式
1. 在用户文件夹下找到`.bash_profile`文件
2. 打开并在最后插入以下代码
	```
	if [ -f ~/.bashrc ] 
	. ~/.bashrc
	fi
	```