# D&D 冒險日誌系統

將 D&D 冒險聯盟（AL）紙本冒險記錄表數位化，提供可搜尋、結構化的網頁應用程式，支援 PWA（可安裝至桌面）。

## 技術選型

| 層級 | 技術 | 部署位置 |
|---|---|---|
| 前端 | Angular + PWA | Zeabur（靜態網站）|
| 後端 | Spring Boot（Java）| Zeabur |
| 資料庫 | PostgreSQL | Supabase（永久免費）|
| API 風格 | REST | — |

## 專案結構

```
dnd-adventure-log/
├── frontend/        # Angular 前端專案
├── backend/         # Spring Boot 後端專案
└── README.md
```

## 本機開發環境需求

- Node.js 22+
- Angular CLI 22+
- Java 17+
- Maven 3.9+

## 本機啟動方式

### 前端
```bash
cd frontend
npm install
ng serve
```
前端預設執行於：http://localhost:4200

### 後端
```bash
cd backend
./mvnw spring-boot:run
```
後端預設執行於：http://localhost:8080

## 環境變數設定（後端）

在 `backend/src/main/resources/` 建立 `application-local.properties`：

```properties
spring.datasource.url=jdbc:postgresql://<supabase-host>:5432/postgres
spring.datasource.username=<username>
spring.datasource.password=<password>
```

> ⚠️ 此檔案含機密資訊，已加入 `.gitignore`，請勿 commit。

## 功能範圍（MVP）

- 多角色管理（Character）
- 冒險日誌 CRUD（Adventure Entry）
- 自動帶入邏輯：金幣、休假天數、魔法物品
- 搜尋與篩選
- PWA 可安裝至桌面
