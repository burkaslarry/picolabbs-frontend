# PicoLabb AI CRM - Demo 操作手冊 🚀

這份手冊專為 PicoLabb 準備，協助您順利展示 AI CRM 的核心價值。系統已預設了符合 PicoLabb 實際業務場景的「母親節產品組合」及「分店自取」測試數據。

---

## 1. 系統登入與角色分配

為了展示系統的權限分配及工作流，系統預設了三個不同角色的示範帳號：

| 登入帳號 | 密碼 | 角色說明 | 負責場景 |
| :--- | :--- | :--- | :--- |
| `pladmin` | `root1234` | **Master Admin (主管/管理層)** | 擁有所有權限，可檢視跨分店數據、管理 Automation 規則及 RAG 知識庫。 |
| `plsales_001` | `root5678` | **前期 Sales (客服/網店跟進)** | 負責解答 WhatsApp 產品查詢、引導預約門市體驗、處理 Shopline 未付款訂單 (Unpaid)。 |
| `plsales_002` | `root5678` | **後期 Sales (門市/售後跟進)** | 負責處理 Shopline 已付款訂單 (Paid)、安排門市自取、以及售後跟進。 |

---

## 2. 建議 Demo 流程 (12 分鐘)

### Step 1: 痛點開場 (登入 `pladmin`)
*   **展示重點：** 一個平台統一管理 WhatsApp 及 Shopline，解決以往「資料割裂」及「漏跟進」的問題。
*   **操作：** 登入 `pladmin`，進入「**收件匣 (Inbox)**」。展示列表上同時顯示 WhatsApp 查詢及 Shopline 訂單，並且每條名單都有清晰的階段 (Stage) 及負責人 (Owner)。

### Step 2: 處理 WhatsApp 查詢 (登入 `plsales_001`)
*   **情境：** 客人查詢母親節 iRelief 組合，並詢問銅鑼灣門市存貨。
*   **操作：**
    1.  點擊進入 `Ms Chan` 的名單詳情。
    2.  展示 **AI 分類 (AI Triage)** 如何準確抓取意圖 (Purchase) 及關鍵字 (iRelief 組合, Causeway Bay)。
    3.  展示 **任務 (Tasks)**：系統已自動建立了一個「Draft WhatsApp reply for product inquiry (Check CWB stock)」的任務。
    4.  展示 **時間軸 (Timeline)**，讓 Sales 一目了然客人的對話歷史。

### Step 3: O2O 門市體驗預約 (登入 `plsales_001`)
*   **情境：** 客人想買 iKnee 俾媽媽，問可唔可以去中環試用。
*   **操作：**
    1.  點擊進入 `Lee Pui Yee` 的名單詳情。
    2.  展示 AI 建議的行動 (Arrange trial at Central Hub)。
    3.  示範如何一鍵生成「WhatsApp 草稿 (Draft)」，AI 會自動根據知識庫 (RAG) 內的產品資料及門市資訊，草擬一份專業、有禮貌的回覆，邀請客人提供偏好時間。

### Step 4: Shopline 訂單自取安排 (登入 `plsales_002`)
*   **情境：** 客人已在 Shopline 購買 The Shield Pro 組合，並選擇在尖沙咀門市自取。
*   **操作：**
    1.  登入 `plsales_002`，進入「**查詢處理 (Kanban)**」。
    2.  展示 Kanban 視圖，一秒看清所有處於 `Paid/Deposit` (已付款) 階段的訂單。
    3.  打開 `Mr Lau` 的名單，展示系統已自動建立任務：「聯絡客人安排尖沙咀門市自取時間」。
    4.  示範完成任務後，將卡片拖曳 (Drag & Drop) 到下一個階段 (例如 Booked / 完成)。

### Step 5: 自動化規則 (Automations)
*   **展示重點：** 解釋以上一切如何「自動發生」，節省人手派單時間。
*   **操作：**
    1.  進入「**自動化 (Automations)**」頁面。
    2.  向客人解釋系統預設的 PicoLabb 專屬規則：
        *   *WhatsApp 產品查詢自動派單俾前期 Sales 001*
        *   *Shopline 已付款訂單自動派單俾後期 Sales 002 跟進自取*
        *   *缺少分店偏好時，自動標記為「需補資料 (Needs Info)」*

### Step 6: 知識庫與數據中心 (Data)
*   **展示重點：** CRM 點解會識答 PicoLabb 嘅專利產品？
*   **操作：**
    1.  進入「**匯入中心 (Data)**」。
    2.  展示系統已匯入了 PicoLabb 的核心產品 (iWand 6, iRelief, The Shield Pro 等)。
    3.  解釋未來如果有新產品或新 promotion，只需上傳 CSV 或 PDF，AI 就會自動學習並用於草擬 WhatsApp 回覆。

---

## 3. 故障排除 (Troubleshooting)

*   **如果 Frontend 沒有回應 / 顯示白屏：** 檢查 Terminal 確保 `localhost:3000` 正在運行。
*   **如果顯示 Backend Offline：** 檢查 Terminal 確保 `localhost:3001` 正在運行，並且 Terminal 內沒有紅色 Error (這代表無法連線到 Remote PostgreSQL)。
*   **如果需要重新啟動系統：** 在 Terminal 執行 `bash scripts/run-local.sh`（專案根目錄）。若已設定 `scripts/.env.render.local` 內的 `DATABASE_URL`，會自動連線雲端 PostgreSQL；否則使用本機 H2。
