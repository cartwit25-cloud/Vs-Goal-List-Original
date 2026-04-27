# 🌸 V's 2026 Goal List — 部署教學

完全免費、不需要 API Key，資料存在你自己的 Google Sheets 上。

---

## 📁 專案結構

```
goal-tracker/
├── index.html          # 主頁面
├── css/
│   └── style.css       # 所有樣式
├── js/
│   ├── config.js       # 常數 & 本地儲存
│   ├── api.js          # Google Sheets 串接
│   ├── ui.js           # UI 渲染元件
│   └── app.js          # 主邏輯
├── apps-script/
│   └── Code.gs         # Google Apps Script 程式碼
└── README.md
```

---

## 🚀 Step 1：部署到 GitHub Pages

1. 在 GitHub 建立新 repository（例如 `v-2026-goals`）
2. 將整個 `goal-tracker/` 資料夾的內容上傳（**不含 `goal-tracker/` 資料夾本身**，直接把 `index.html` 等放在根目錄）
3. 進入 repository → **Settings** → **Pages**
4. Source 選 `Deploy from a branch` → Branch 選 `main`，folder 選 `/ (root)`
5. 儲存後稍等幾分鐘，你的網址就是：`https://你的帳號.github.io/v-2026-goals/`

---

## 📊 Step 2：設定 Google Sheets + Apps Script

### 2-1. 建立 Google Sheets

1. 開啟 [Google Sheets](https://sheets.google.com)，新增一個空白試算表
2. 命名為「V's 2026 Goals」（隨意）
3. 第一個工作表不用動，Apps Script 會自動建立「主資料」分頁

### 2-2. 建立 Apps Script

1. 在 Google Sheets 點選 **擴充功能** → **Apps Script**
2. 把 `apps-script/Code.gs` 裡的所有程式碼**完整貼入**編輯器（取代原有內容）
3. 按 **儲存**（Ctrl+S）

### 2-3. 部署為 Web App

1. 點選右上角 **部署** → **新增部署**
2. 類型選 **網路應用程式**
3. 設定如下：
   - 說明：`V's Goal Manager`
   - 執行身分：**我**
   - 存取：**任何人**（重要！）
4. 按 **部署**，複製產生的 URL（格式：`https://script.google.com/macros/s/XXXXX/exec`）

> ⚠️ 之後若更新 Code.gs，要重新部署（新增部署 or 管理部署 → 編輯 → 版本選「新版本」）

### 2-4. 在網頁輸入 URL

1. 打開你的 GitHub Pages 網址
2. 點右上角 **⚙️ 設定** 按鈕
3. 貼入剛才複製的 Web App URL
4. 按 **儲存並連線**

完成！🎉 之後所有資料都會自動同步到 Google Sheets。

---

## 📅 月份自動備份設定（可選但建議）

### 設定每月自動觸發

1. 在 Apps Script 編輯器，點左側 ⏰ **觸發程序**
2. 右下角 **新增觸發程序**
3. 設定：
   - 執行函式：`runMonthlyBackup`
   - 部署方式：`主要`
   - 事件來源：`時間型觸發`
   - 類型：`每月計時器`
   - 日期：每月 **1 日**
4. 儲存

這樣每個月 1 號會自動把上個月的快照存成獨立分頁（例如「2026_1月」、「2026_2月」...），分頁設為警告保護，防止誤改。

---

## 🎨 如何修改樣式

所有樣式都在 `css/style.css`，使用 CSS 變數，方便修改：

```css
:root {
  --cream: #fdf8f0;          /* 背景主色 */
  --morandi-rose: #d4a5a5;   /* 主要強調色（粉） */
  --morandi-blue: #a5b5c8;   /* 次要強調色（藍） */
  /* ... */
}
```

### 常見修改

| 想改什麼 | 位置 |
|---------|------|
| 主標題顏色 | `.site-title` |
| Section 顏色主題 | `.section-card[data-cat="工作"] .section-header` 等 |
| 卡片圓角大小 | `--radius-md`, `--radius-lg` |
| 動畫速度 | `--transition` |
| 字體 | `<head>` 的 Google Fonts link + `body { font-family: ... }` |

---

## ✨ 功能說明

| 功能 | 說明 |
|------|------|
| ✅ 新增目標 | 每個區塊下方輸入框，按 Enter 或「＋ 新增」 |
| 🎚 進度條 | 拖拉 slider 即時更新，達 100% 提示完成 |
| ☑️ 勾選完成 | 自動移到最下方，文字加刪除線 |
| 🔴🟡🟢 優先順序 | 左側色條 + 徽章顯示，高優先排最上面 |
| 🎯 今日建議 | 每天隨機從未完成目標選3個（優先選高優先順序）|
| ⏰ 7天提醒 | 超過7天沒更新自動標示淡紅背景 |
| 💾 本地備份 | 即使沒有 Google Sheets，資料也存在瀏覽器 |
| 📊 月份備份 | 每月自動在 Sheets 建立快照分頁 |

---

## 🔧 常見問題

**Q: 部署後改了程式碼，資料不見了？**
A: 資料存在 Google Sheets，不會因為前端更新而消失。

**Q: 連線失敗 / 同步失敗？**
A: 確認 Apps Script 部署設定「存取」是「任何人」；若更新過 Code.gs，記得重新部署並複製新 URL。

**Q: 想在多個裝置使用？**
A: 只要每台裝置都設定同一個 Web App URL，就能共享同一份 Google Sheets 資料。

**Q: 可以分享給別人嗎？**
A: 可以，但對方看到的資料會和你一樣。這個系統設計為個人使用。

---

Made with 🌸 for V's 2026
