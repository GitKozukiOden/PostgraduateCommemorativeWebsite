# 研究生纪念网（GitHub Pages 版）

根据需求生成的静态网站版本，包含：

- 首页三列卡片展示（照片 + 名字）
- 点击进入详情页
- 维护者通过仓库数据文件添加人物
- 访客评论区（Giscus / GitHub Discussions）

## 目录结构

```text
.
├─ index.html
├─ detail.html
├─ styles.css
├─ js/
│  ├─ main.js
│  └─ detail.js
├─ data/
│  └─ students.json
└─ assets/photos/
   ├─ memory-1.svg
   ├─ memory-2.svg
   └─ memory-3.svg
```

## 如何添加人物（仅维护者可添加）

1. 把照片放到 `assets/photos/`。
2. 编辑 `data/students.json`，在 `students` 数组新增对象：

```json
{
  "id": "unique-id",
  "name": "姓名",
  "birthYear": 1998,
  "leaveYear": 2024,
  "summary": "首页简述",
  "photo": "assets/photos/your-photo.jpg",
  "story": ["段落1", "段落2", "段落3"]
}
```

只要仓库只有你有写权限，就满足“只有你可以添加人物”。

## 评论区（任何人可评论）

项目已预留 Giscus 接入逻辑，修改 `js/detail.js` 里的 `giscusConfig`：

- `repo`
- `repoId`
- `categoryId`

获取方式：

1. 在仓库开启 **Discussions**。
2. 打开 [Giscus 官网](https://giscus.app/zh-CN) 生成配置参数。
3. 将参数填入 `js/detail.js`。

## 部署到 GitHub Pages

1. 推送项目到 GitHub 仓库。
2. 进入仓库 `Settings -> Pages`。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main` 和 `/root`。
5. 保存后等待发布完成。

## 是否需要云数据库

当前版本不需要自建云数据库：

- 人物资料在仓库 `data/students.json`
- 评论存储在 GitHub Discussions（由 Giscus 承载）

如果后续要做网页后台新增、匿名评论、评论审核等，再接入 Supabase/Firebase。

## 本地预览

不要直接双击 HTML 打开（`file://` 下 `fetch` 会失败），建议启动本地静态服务：

```bash
python -m http.server 5500
```

然后访问 [http://localhost:5500](http://localhost:5500)。
