# Charm1ng 个人博客

- 基于 Hexo + Landscape 主题构建的个人博客系统。
- 主要参考：
  - Hexo 官方文档：https://hexo.io/zh-cn/docs/
  - Landscape [项目地址](https://github.com/hexojs/hexo-theme-landscape) || [主题预览](https://hexojs.github.io/hexo-theme-landscape/)
  - waline评论区实现：[waline快速上手](https://waline.js.org/guide/get-started/)

## 博客地址

- 主站：https://www.charm1ng.top
- 评论区：https://comment.charm1ng.top

## 技术栈

| 技术 | 说明 |
|------|------|
| Hexo | 静态博客框架 |
| Landscape | Hexo 官方主题 |
| Waline | 评论系统（Vercel 部署 + SQLite 数据库） |
| 不蒜子 | 网站访问统计 |

## 本地开发

### 安装依赖

```bash
pnpm install
```

### 常用命令

```bash
# 删除构建缓存
hexo clean

# 构建静态文件
hexo generate

# 运行本地服务器（默认 http://localhost:4000）
hexo server

# 一键构建并预览
hexo clean && hexo generate && hexo server
```

### 调试页面

使用无头 Chromium 查看页面：
```bash
/home/charm/3rdApp/chromium/chromium/linux-1585581/chrome-linux/chrome --headless --disable-gpu --virtual-time-budget=5000 --dump-dom http://localhost:4000
```

## 项目结构

```
my-blog/
├── source/              # 博客源文件
│   ├── _posts/         # 文章目录
│   ├── about/          # 关于页面
│   ├── images/         # 图片资源
│   └── waline/         # Waline 静态文件
├── themes/landscape/   # 主题文件
│   ├── layout/         # 模板文件
│   ├── source/         # 主题静态资源
│   └── _config.yml     # 主题配置
├── scripts/            # 自定义脚本
│   ├── projects-generator.js   # 项目页生成器
│   └── documents-generator.js  # 笔记页生成器
├── _config.yml         # 博客配置
└── package.json        # 项目依赖
```

## 文章类型

博客支持两种文章类型：

### 1. 项目 (projects)

在 Front-matter 中设置 `type: projects`：

```markdown
---
title: 我的项目
date: 2026-01-15
type: projects
categories: 项目
tags: [嵌入式, IoT]
---

项目内容...
```

### 2. 文档/笔记 (documents)

在 Front-matter 中设置 `type: documents`：

```markdown
---
title: 学习笔记
date: 2026-01-15
type: documents
categories: 嵌入式
tags: [STM32, C语言]
---

笔记内容...
```

### Read More 摘要

在文章中使用 `<!--more-->` 标记分隔摘要和正文：

```markdown
---
title: 文章标题
---

这里是摘要部分，会在列表页显示。

<!--more-->

这里是正文内容，只有点击"阅读全文"后才能看到。
```

## 主题配置

### 导航菜单 (themes/landscape/_config.yml)

```yaml
menu:
  首页: /
  关于: /about
  归档: /archives
  项目: /projects
  笔记: /documents
```

### 社交链接

```yaml
links:
  github: https://github.com/yourname
  douyin: https://www.douyin.com/yourid
  bilibili: https://space.bilibili.com/yourid
```

### 首页封面

```yaml
banner: "/images/header/banner.jpg"
avatar: "/images/header/best1.jpg"
```

## 功能说明

### 评论区 (Waline)

- 服务端部署在 Vercel
- 客户端集成在主题中 (`themes/landscape/layout/_partial/article.ejs`)
- 评论数据存储在 SQLite 数据库

### 访问统计 (不蒜子)

统计代码位于 `themes/landscape/layout/_partial/footer.ejs`

### 图片灯箱 (Fancybox)

主题集成了 Fancybox，文章中的图片支持点击放大查看。

## 部署

### 方式一：推送到 GitHub

```bash
# 创建 main 分支并推送
git branch -M main
git push -u origin main
```

### 方式二：GitHub Actions 自动部署

推送到 GitHub 后，可以在 GitHub Actions 中配置自动构建。

## 博客配置 (_config.yml)

```yaml
# 基本信息
title: Charm1ng
subtitle: '欢迎来到Charm1ng小站，这里有好东西'
author: Charm1ng1ng
language: zh-CN
timezone: 'Asia/Shanghai'

# URL
url: https://www.charm1ng.top
permalink: :year/:month/:day/:title/

# 分页
per_page: 10

# 主题
theme: landscape
```

## 许可证

本项目仅供个人学习使用。
