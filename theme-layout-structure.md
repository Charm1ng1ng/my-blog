# Hexo Landscape 主题模板结构说明

## 重要 layout 文件

| 文件 | 功能 |
|------|------|
| **layout.ejs** | 主布局模板，定义页面整体结构（head、header、content、sidebar、footer） |
| **index.ejs** | 首页，调用 archive 模板显示所有文章列表 |
| **archive.ejs** | 归档页，按年份分组显示文章列表 |
| **post.ejs** | 文章详情页，显示完整文章内容和评论区 |
| **page.ejs** | 独立页面（如 about 关于页） |
| **category.ejs** | 分类页，按分类筛选显示文章 |
| **tag.ejs** | 标签页，按标签筛选显示文章 |
| **search.ejs** | 搜索结果页 |

## 常用 partial 组件

| 文件 | 功能 |
|------|------|
| **_partial/article.ejs** | 文章组件，用于列表页和详情页 |
| **_partial/archive-post.ejs** | 归档列表中的单篇文章预览 |
| **_partial/archive.ejs** | 归档列表（展开/折叠两种模式） |
| **_partial/post/tag.ejs** | 文章标签显示 |
| **_partial/post/category.ejs** | 文章分类显示 |
| **_partial/post/title.ejs** | 文章标题 |
| **_partial/post/date.ejs** | 文章日期 |
| **_partial/header.ejs** | 顶部导航栏 |
| **_partial/footer.ejs** | 底部版权信息 |

## 结构理解

- **layout.ejs** 是"骨架"，定义页面整体框架
- 其他 xxx.ejs 是"血肉"，填充具体内容
- **partial** 是可复用的"组件"
