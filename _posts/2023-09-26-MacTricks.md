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

```zsh
sudo xattr -rd com.apple.quarantine /Applications/Safari Technology Preview.app
```

### 2. 打开任意来源安装应用
```zsh
sudo spctl --master-disable
```

### 3. Time Machine 全速备份指令
```zsh
sudo sysctl debug.lowpri\_throttle_enabled=0
```

### 4. 开盖开机
#### 4.1 开启开盖开机
```zsh
sudo nvram AutoBoot=%03
```
#### 4.2 关闭开盖开机
```zsh
sudo nvram AutoBoot=%00
```

### 5. 开机启动声音
#### 5.1 关闭开机启动声音
```zsh
sudo nvram SystemAudioVolume=%00
```
#### 5.2 恢复开机启动声音
```zsh
sudo nvram -d SystemAudioVolume
```
### 6. Macos清除更新角标
```zsh
defaults write com.apple.appstored BadgeCount 0
killall Dock
rm ~/Library/Preferences/com.apple.appstored.plist
defaults write com.apple.systempreferences AttentionPrefBundleIDs 0
killall Dock
```
###  7. ⌘ +⇧ +5截图阴影开启&关闭指令
```zsh
defaults write com.apple.screencapture disable-shadow -bool true&&killall SystemUIServer
defaults write com.apple.screencapture disable-shadow -bool false&&killall SystemUIServer
```
### 8. 虚拟内存
<!--mac电脑是将内存当作虚拟内存的，通常是不启用的，启用会降低电脑运行速度-->
#### 8.1 启用命令
```zsh
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist
```
<!--虚拟内存容量无法设置。-->
#### 8.2 禁用命令
```zsh
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist
```

### 9. macOS terminal默认shell为bash时自动加载.bashrc的方式
1. 在用户文件夹下找到`.bash_profile`文件
2. 打开并在最后插入以下代码
	```zsh
	if [ -f ~/.bashrc ] 
	. ~/.bashrc
	fi
	```
	
### 10. 解决mds_store占用高资源CPU—关闭md服务
```zsh
sudo mdutil -a -i off
sudo nvram boot-args="serverperfmode=1 $(nvram boot-args 2>/dev/null | cut -f 2-)"
change nvram to server performanc emode
就是serverinfo —setperfmode 1
```

### 11. Mac防止自动激活conda环境
```zsh
conda config --set auto_activate_base false
```

### 12. 刷新quicklook列表
```zsh
qlmanage -r
```
### 13. 打开App Store debug目录
```zsh
defaults write com.apple.appstore ShowDebugMenu -bool true
```

### 14. 去掉资源库文件夹的隐藏属性

#### 14.1 关闭隐藏属性：
```zsh
chflags nohidden ~/Library/
```
#### 14.2 打开隐藏属性：
```zsh
chflags hidden ~/Library/
```
### 15. 去除（base）字样而不影响使用conda
【通过.condarc文件来控制显示（此文件在~/.condarc下）】
在文件最后加入「`changeps1: False`」

### 16. 开启Touch ID强认证模式
```file
/private/etc/pam.d/sudo
```

这个文件中添加

```zsh
auth sufficient pam_tid.so
```

### 17. TXT文件字数统计
```zsh
wc -lc 文档.txt
```

### 18. 正则表达式处理TXT
#### 18.1 最前面添加东西：使用「＾」符号进行替换
#### 18.2 最后面添加东西：使用「$」符号进行替换

### 19. 下载各个版本的macos

#### —————App Store—————
* [macOS Big Sur version 11](https://apps.apple.com/gb/app/macos-big-sur/id1526878132?mt=12)

* [macOS Catalina 10.15](https://apps.apple.com/gb/app/macos-catalina/id1466841314?mt=12)


* [macOS Mojave 10.14](https://apps.apple.com/gb/app/macos-mojave/id1398502828?mt=12)


* [macOS High Sierra 10.13](https://apps.apple.com/us/app/macos-high-sierra/id1246284741?mt=12)


#### * —————直链——————
* [macOS 10.10 Yosemite](http://updates-http.cdn-apple.com/2019/cert/061-41343-20191023-02465f92-3ab5-4c92-bfe2-b725447a070d/InstallMacOSX.dmg)


* [macOS 10.11 El Capitan](http://updates-http.cdn-apple.com/2019/cert/061-41424-20191024-218af9ec-cf50-4516-9011-228c78eda3d2/InstallMacOSX.dmg)


* [macOS 10.12 Sierra](http://updates-http.cdn-apple.com/2019/cert/061-39476-20191023-48f365f4-0015-4c41-9f44-39d3d2aca067/InstallOS.dmg)
