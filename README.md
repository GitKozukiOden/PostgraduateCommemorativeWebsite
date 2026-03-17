<<<<<<< HEAD
# 研究生纪念网（GitHub Pages 版）

根据你的需求生成的静态网站版本，包含：

- 首页瀑布流展示（照片 + 名字）
- 点击进入详情页
- 维护者通过仓库数据文件添加人物
- 访客评论区（Giscus / GitHub Discussions）
=======
# 研究生纪念网
>>>>>>> 6a1d421880749bbbfe3cf33c0cee671756ac422f

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
<<<<<<< HEAD

## 如何添加人物（仅你可添加）

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

本项目已预留 Giscus 接入逻辑，修改 `js/detail.js` 里的 `giscusConfig`：

- `repo`
- `repoId`
- `categoryId`

获取方式：

1. 在仓库开启 **Discussions**。
2. 打开 [Giscus 官网](https://giscus.app/zh-CN) 生成配置参数。
3. 将参数填入 `js/detail.js`。

完成后，任何拥有 GitHub 账号的人都可在详情页评论。

## 部署到 GitHub Pages

1. 推送本项目到 GitHub 仓库。
2. 进入仓库 `Settings -> Pages`。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`（或你的默认分支）和 `/root`。
5. 保存后等待发布完成。

## 你是否需要云数据库？

这个版本不需要自建云数据库，原因：

- 人物资料放在仓库的 JSON 文件里
- 评论存储在 GitHub Discussions（由 Giscus 承载）

如果你后续想要下面能力，才建议接入云数据库（如 Supabase/Firebase）：

- 网页后台直接新增人物（不通过改仓库文件）
- 不登录 GitHub 也能评论
- 评论审核、举报、敏感词等自定义管理能力

## 本地预览

不要直接双击 HTML 打开（`file://` 下 `fetch` 会失败），建议启动本地静态服务：

```bash
python -m http.server 5500
```

然后访问 [http://localhost:5500](http://localhost:5500)。
=======
>>>>>>> 6a1d421880749bbbfe3cf33c0cee671756ac422f
