# 🏪 完整庫存管理系統 - INV01

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/idefwu/INV01)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

基於純前端JavaScript開發的完整商品進銷存管理系統，包含**ROP再訂購點模組**，提供現代化Web界面和完整的企業級庫存管理功能。

## 🚀 系統特色

### 🎯 核心功能
- ✅ **完整的進銷存管理**：從進貨到銷售的全流程管理
- ✅ **智能ROP系統**：自動檢測並提醒需要補貨的商品
- ✅ **實時庫存監控**：即時庫存數量和價值統計
- ✅ **多維度報表**：庫存分析、進銷存報表、缺貨清單
- ✅ **響應式設計**：支援桌面、平板、手機等多種裝置

### 🌟 技術亮點
- **零依賴純前端**：無需伺服器，直接在瀏覽器運行
- **模組化架構**：可擴展的組件式設計
- **TypeScript風格**：完整的類別定義和方法註解
- **現代化UI**：Material Design風格的使用者界面
- **完整測試**：包含多個測試頁面驗證功能

---

## 📋 完整功能清單

### 🏭 基礎資料管理
#### 商品管理 (`ProductsModule`)
- ✅ 新增/編輯/刪除商品
- ✅ 商品編號、名稱、規格、單位管理
- ✅ 售價與成本價分離設定
- ✅ 安全庫存與ROP設定
- ✅ 商品搜尋與篩選
- ✅ 快速庫存調整
- ✅ 商品詳細資訊檢視

#### 客戶管理 (`CustomersModule`)
- ✅ 客戶基本資料維護
- ✅ 聯絡方式管理
- ✅ 客戶銷售歷史查詢
- ✅ 客戶搜尋功能

#### 供應商管理 (`SupplierModule`)
- ✅ 供應商基本資料維護
- ✅ 供應商聯絡資訊管理
- ✅ 採購歷史查詢

### 🚛 交易管理
#### 進貨管理 (`PurchaseModule`)
- ✅ 建立進貨單
- ✅ 多商品批次進貨
- ✅ 收貨作業（自動更新庫存和成本）
- ✅ 進貨單狀態管理
- ✅ 進貨歷史查詢

#### 銷貨管理 (`SalesModule`)
- ✅ 建立銷貨單
- ✅ 庫存不足自動阻止銷售
- ✅ 自動扣減庫存
- ✅ 銷貨記錄查詢
- ✅ 客戶別銷售統計

### 📊 庫存管理
#### 庫存控制 (`InventoryModule`)
- ✅ 即時庫存數量查詢
- ✅ 庫存價值統計
- ✅ 手動庫存調整（增加/減少/設定）
- ✅ 庫存調整原因記錄
- ✅ 低庫存商品警示
- ✅ 庫存異動歷史追蹤

#### **🎯 ROP再訂購點系統 (`ROPModule`)**
- ✅ **自動缺貨檢測**：當庫存 ≤ 再訂購點時自動標記
- ✅ **智能補貨提醒**：即時顯示需要補貨的商品
- ✅ **缺貨清單生成**：包含商品編號、名稱、庫存、ROP、建議補貨量
- ✅ **預估成本計算**：自動計算補貨所需費用
- ✅ **一鍵建立進貨單**：從缺貨清單直接生成採購訂單
- ✅ **ROP設定管理**：可即時調整再訂購點和再訂購量
- ✅ **報表匯出功能**：CSV格式匯出缺貨報表
- ✅ **統計儀表板**：顯示需補貨商品數量和預估總成本

### 📈 報表分析 (`ReportsModule`)
- ✅ **庫存報表**：商品庫存數量、價值統計
- ✅ **進銷存明細表**：指定期間的交易分析
- ✅ **ROP缺貨報表**：需要補貨的商品清單
- ✅ **統計儀表板**：關鍵指標視覺化呈現

### 🎛️ 系統管理 (`DashboardModule`)
- ✅ **儀表板總覽**：系統關鍵數據統計
- ✅ **活動記錄**：完整的操作歷史追蹤
- ✅ **系統通知**：低庫存、ROP警告等提醒
- ✅ **快速操作**：常用功能快捷鍵

---

## 🏗️ 技術架構

### 📁 項目結構
```
INV01/
├── 📄 index.html                    # 主系統界面
├── 📄 working_system.html           # 簡化工作版本
├── 📁 basic/
│   ├── 📄 inventory-system.js       # 早期版本（保留）
│   └── 📁 js/                       # 核心JavaScript模組
│       ├── 📄 models.js             # 資料模型和核心系統
│       ├── 📄 dashboard.js          # 儀表板模組
│       ├── 📄 products.js           # 商品管理模組
│       ├── 📄 customers_enhanced.js # 客戶管理模組
│       ├── 📄 suppliers.js          # 供應商管理模組
│       ├── 📄 purchase.js           # 進貨管理模組
│       ├── 📄 sales.js              # 銷貨管理模組
│       ├── 📄 inventory.js          # 庫存管理模組
│       ├── 📄 rop.js                # ROP再訂購點模組 ⭐
│       ├── 📄 reports.js            # 報表管理模組
│       └── 📄 utils.js              # 工具函數庫
├── 📁 測試頁面/
│   ├── 📄 test_system.html          # 完整功能測試
│   ├── 📄 module_test.html          # 模組載入測試
│   ├── 📄 rop_test.html             # ROP專項測試
│   ├── 📄 debug.html                # 系統診斷頁面
│   └── 📄 test_getProductById.html  # 方法測試
├── 📁 文檔/
│   ├── 📄 README.md                 # 本文件
│   ├── 📄 ROP_使用說明.md           # ROP系統使用指南
│   ├── 📄 GitHub上傳教學.md         # Git操作指南
│   ├── 📄 庫存管理規格.md           # 原始需求規格
│   └── 📄 再訂購點(ROP)系統規格.md  # ROP需求規格
└── 📄 .gitignore                    # Git忽略設定
```

### 🧩 核心類別架構

#### 主要資料模型
```javascript
// 系統核心
class InventorySystem {
  // 商品、客戶、供應商管理
  // 進銷存交易處理
  // ROP系統整合
  // 統計報表生成
}

// 商品模型（含ROP功能）
class Product {
  constructor(id, code, name, spec, unit, salePrice, costPrice, 
              safetyStock, reorderPoint, reorderQuantity)
  needsReorder()          // 判斷是否需要補貨
  getReorderInfo()        // 獲取補貨資訊
  getSuggestedReorderQuantity() // 建議補貨量
}

// 交易模型
class PurchaseOrder { /* 進貨單 */ }
class SalesOrder { /* 銷貨單 */ }
class InventoryAdjustment { /* 庫存調整 */ }
```

#### 功能模組
```javascript
// UI控制模組
class DashboardModule   // 儀表板
class ProductsModule    // 商品管理
class CustomersModule   // 客戶管理
class SupplierModule    // 供應商管理
class PurchaseModule    // 進貨管理
class SalesModule       // 銷貨管理
class InventoryModule   // 庫存管理
class ROPModule         // ROP再訂購點 ⭐
class ReportsModule     // 報表管理
```

---

## 🎯 ROP再訂購點系統詳解

### 🔍 核心概念
**ROP (Reorder Point)** 是現代庫存管理的重要概念，當商品庫存降至設定的再訂購點時，系統會自動提醒需要補貨，避免缺貨影響營運。

### ⚡ ROP系統功能

#### 1. 自動檢測機制
```javascript
// 判斷邏輯：當庫存數量 ≤ 再訂購點時觸發
if (product.currentStock <= product.reorderPoint) {
    // 加入缺貨清單
    // 顯示補貨警告
    // 計算建議補貨量
}
```

#### 2. 缺貨清單生成
- **商品編號**：唯一識別碼
- **商品名稱**：完整品名
- **目前庫存**：即時庫存數量
- **再訂購點**：觸發補貨的臨界值
- **建議進貨量**：系統建議的補貨數量
- **預估成本**：補貨所需的預估費用

#### 3. 智能建議系統
- 基於歷史消耗分析
- 考慮供應商最小訂購量
- 優化倉儲成本
- 降低缺貨風險

### 📊 ROP實際應用範例

```
範例數據：
┌────────┬─────────┬──────┬──────┬────────┬───────────┐
│ 商品   │ 目前庫存│ ROP  │ 狀態 │ 建議量  │ 預估成本   │
├────────┼─────────┼──────┼──────┼────────┼───────────┤
│ A001   │   50    │  40  │ 正常 │   -    │     -     │
│ A002   │   20    │  30  │ 缺貨 │   80   │  $80      │
│ B001   │   12    │  50  │ 缺貨 │  200   │ $360,000  │
└────────┴─────────┴──────┴──────┴────────┴───────────┘
```

---

## 🚀 快速開始

### 💻 系統需求
- 現代化網頁瀏覽器（Chrome 80+、Firefox 75+、Safari 13+、Edge 80+）
- 無需安裝額外軟體或伺服器
- 支援本地離線運行

### 📥 安裝步驟
1. **下載專案**
   ```bash
   git clone https://github.com/idefwu/INV01.git
   cd INV01
   ```

2. **開啟系統**
   - 直接用瀏覽器開啟 `index.html`
   - 或使用本地伺服器：`python -m http.server 8080`

3. **開始使用**
   - 系統會自動載入範例數據
   - 可直接測試各項功能

### 🎮 基本操作流程

#### 第一次使用
1. **查看儀表板** - 了解系統概況
2. **檢查商品管理** - 熟悉商品資料結構
3. **測試ROP功能** - 查看「再訂購點管理」頁面
4. **嘗試基本操作** - 新增商品、調整庫存等

#### 日常操作
1. **每日開始** - 查看儀表板和ROP警告
2. **處理缺貨** - 查看缺貨清單，建立進貨單
3. **處理交易** - 錄入進貨和銷貨資料
4. **庫存管理** - 監控庫存狀況，必要時手動調整
5. **週期檢討** - 查看報表分析，調整ROP設定

---

## 🧪 測試與驗證

### 🔬 測試頁面
我們提供多個專門的測試頁面來驗證系統功能：

1. **`test_system.html`** - 完整功能測試
   - 系統初始化驗證
   - 商品操作測試
   - ROP功能驗證

2. **`module_test.html`** - 模組載入測試
   - 檢查所有JavaScript模組
   - 驗證模組相依性

3. **`rop_test.html`** - ROP專項測試
   - Product模型ROP功能
   - 缺貨清單生成
   - 報表功能驗證

4. **`debug.html`** - 系統診斷
   - JavaScript錯誤監控
   - 效能分析
   - 模組狀態檢查

### ✅ 功能驗證檢查清單
- [ ] 系統正常載入，顯示初始化成功訊息
- [ ] 所有導航選單都能正常切換
- [ ] 商品管理的按鈕都能正常點擊
- [ ] ROP頁面顯示缺貨清單（A002、B001）
- [ ] 統計數據正確顯示（3個商品，2個需補貨）
- [ ] 報表可以正常匯出CSV格式

---

## 🛠️ 開發指南

### 🔧 自訂與擴展

#### 新增功能模組
```javascript
// 1. 建立新的模組類別
class CustomModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
    }
    
    initialize() {
        this.bindEvents();
        this.loadData();
    }
}

// 2. 在index.html中載入和初始化
customModule = new CustomModule(inventorySystem);
customModule.initialize();
```

#### 修改ROP邏輯
```javascript
// 在models.js的Product類別中修改
needsReorder() {
    // 自訂補貨邏輯
    return this.currentStock <= this.reorderPoint;
}
```

#### 新增報表類型
```javascript
// 在reports.js中添加新的報表方法
generateCustomReport() {
    // 自訂報表邏輯
    return { /* 報表資料 */ };
}
```

### 📝 程式碼規範
- 使用ES6+語法
- 採用駝峰命名法
- 詳細的函數註解
- 錯誤處理機制
- 模組化設計原則

---

## 🐛 故障排除

### 常見問題

**Q: 商品管理按鈕點擊沒有反應**
A: 檢查瀏覽器控制台是否有JavaScript錯誤，確認所有模組都已正確載入。

**Q: ROP頁面顯示空白**
A: 確認`rop.js`檔案已正確載入，檢查`showSection`函數是否包含ROP case。

**Q: 系統初始化失敗**
A: 檢查所有JavaScript檔案的載入順序，確認`models.js`最先載入。

**Q: 報表匯出功能無法使用**
A: 確認瀏覽器支援Blob下載功能，嘗試更換瀏覽器測試。

### 除錯工具
- 使用`debug.html`進行系統診斷
- 開啟瀏覽器開發者工具查看錯誤
- 檢查網路標籤確認檔案載入狀態

---

## 🤝 貢獻指南

### 參與開發
1. Fork本專案到你的GitHub
2. 建立功能分支：`git checkout -b feature/new-feature`
3. 提交變更：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 建立Pull Request

### 回報問題
- 使用GitHub Issues回報錯誤
- 提供詳細的錯誤重現步驟
- 包含瀏覽器版本和錯誤訊息

---

## 📜 版本歷史

### v2.0.0 (2025-08-31) - ROP系統版本 🎯
- ✨ **新增ROP再訂購點系統**
- ✨ 完整的缺貨檢測和補貨提醒
- ✨ 智能補貨建議算法
- ✨ CSV報表匯出功能
- 🔧 修復商品管理按鈕事件問題
- 🔧 優化模組載入和初始化流程
- 📚 新增詳細的測試頁面和文檔

### v1.0.0 (2025-08-30) - 基礎系統版本
- 🎉 完整的進銷存管理功能
- 📊 基礎報表和統計功能
- 🎨 響應式Web界面設計
- 💾 本地資料處理能力

---

## 📄 授權資訊

本專案採用MIT授權條款，您可以自由使用、修改和分發。

```
MIT License

Copyright (c) 2025 idefwu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙋‍♂️ 技術支援

### 文檔資源
- 📖 [ROP使用說明](ROP_使用說明.md)
- 📖 [GitHub上傳教學](GitHub上傳教學.md)
- 📖 [系統需求規格](庫存管理規格.md)

### 聯繫方式
- 💌 GitHub Issues: [https://github.com/idefwu/INV01/issues](https://github.com/idefwu/INV01/issues)
- 📧 Email: 透過GitHub聯繫
- 📋 Wiki: 查看專案Wiki獲取更多資訊

### 開發團隊
- 🤖 **系統架構與開發**: Claude Code AI
- 👤 **專案管理**: idefwu
- 🎨 **UI/UX設計**: Material Design + 自訂樣式

---

## 🌟 致謝

感謝所有參與測試和提供建議的用戶，您的回饋讓這個系統變得更好！

特別感謝：
- **JavaScript社群**：提供豐富的開發資源
- **Material Design**：優秀的UI設計規範
- **GitHub**：優秀的代碼託管平台

---

**🎯 專案目標**：打造最實用的中小企業庫存管理解決方案！

**⭐ 如果這個專案對您有幫助，請給我們一個星星！**

---

*最後更新：2025-08-31 | 版本：2.0.0*