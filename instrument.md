# 部落格範本

這是一個簡單的靜態部落格模板，採用黑色背景、薰衣草紫主題色，並支援 Markdown 文章內容。

## 使用方式

1. 在 `index.html` 中引入 `styles.css` 與 `script.js`。
2. 將文章放入 `posts/` 目錄，預設會載入 `posts/post.md`。
3. 如果要瀏覽所有文章，請開啟 `archive.html`，或點選頁面右上角的「文章瀏覽」。
4. 你可以使用網址參數載入其他文章，例如：
   - `index.html?post=article-1` 會載入 `posts/article-1.md`
5. 若要讓文章出現在瀏覽頁面，請在 `posts/posts.json` 中新增文章條目，格式如下：
   ```json
   {
     "slug": "article-1",
     "title": "文章標題",
     "subtitle": "文章摘要",
     "published": "2026-06-06",
     "updated": "2026-06-06",
     "tags": ["標籤1", "標籤2"],
     "banner": "images/banner.jpg"
   }
   ```
5. 在 Markdown 檔案前端加入 metadata：
   ```yaml
   ---
   title: 文章標題
   subtitle: 文章副標題
   published: 2026-06-06
   updated: 2026-06-06
   tags: 標籤1, 標籤2
   banner: images/banner.jpg
   ---
   ```
6. 要加入圖片，請放在 `images/` 目錄，並在 Markdown 中使用：
   - `![說明文字](images/your-photo.jpg)`
   - 可以設定大小：`![說明文字](images/your-photo.jpg){width=480}` 或 `![說明文字](images/your-photo.jpg){width=80%}`
   - 也可以同時設定寬高：`![說明文字](images/your-photo.jpg){width=480 height=300}`

## 自動生成文章清單

你現在可以改用 `generate-posts.js` 自動建立 `posts/posts.json`：

```bash
node generate-posts.js
```

- 每次新增或修改 `posts/*.md` 後，執行一次即可。
- 這個腳本會掃描 `posts/` 下所有 `.md` 檔，讀取前端 metadata，並寫入 `posts/posts.json`。

## 說明

- `script.js` 會解析前端 metadata 與 Markdown 內容。
- 若 `banner` metadata 存在，頁面最上方 Banner 會自動使用。
- 文章會置中顯示在一個浮動的卡片上。

