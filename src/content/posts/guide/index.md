---
title: Mizuki简易指南
published: 2015-11-11
description: "如何使用这个博客模板."
image: "./cover.png"
tags: ["Markdown"]
category: 文章示例
draft: false
pinned: true
---



此博客模板是使用[Astro](https://astro.build/)构建的. 对于本指南中未提及的内容,您可以在[Astro Docs](https://docs.astro.build/)中找到答案.

## 文章的Front-matter

```yaml
---
title: 我的第一篇博客文章
published: 1970-01-01
description: 这是我新 Astro 博客的第一篇文章。
image: ./cover.jpg
tags: ["Markdown"]
category: 文章示例
draft: false
---
```




| 属性          | 描述                                                                                                                                                                                                 |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `title`       | 文章标题。                                                                                                                                                                                          |
| `published`   | 文章发布日期。                                                                                                                                                                                      |
| `pinned`      | 是否将此文章置顶在文章列表顶部。                                                                                                                                                                    |
| `description` | 文章的简短描述。显示在首页上。                                                                                                                                                                      |
| `image`       | 文章封面图片路径。<br/>1. 以 `http://` 或 `https://` 开头：使用网络图片<br/>2. 以 `/` 开头：`public` 目录中的图片<br/>3. 不带任何前缀：相对于 markdown 文件的路径 |
| `tags`        | 文章标签。                                                                                                                                                                                          |
| `category`    | 文章分类。                                                                                                                                                                                          |
| `licenseName` | 文章内容的许可证名称。                                                                                                                                                                              |
| `author`      | 文章作者。                                                                                                                                                                                          |
| `sourceLink`  | 文章内容的来源链接或参考。                                                                                                                                                                          |
| `draft`       | 如果这篇文章仍是草稿，则不会显示。                                                                                                                                                                  |

## 文章文件的放置位置

您的文章文件应放置在 `src/content/posts/` 目录中。您也可以创建子目录来更好地组织您的文章和资源。

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.png
    └── index.md
```