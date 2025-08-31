# 📚 GitHub 上傳完整教學

## 🎯 目標
將本地的庫存管理系統專案上傳到 GitHub 倉庫：`https://github.com/idefwu/INV01`

---

## 📋 前置準備

### ✅ 已完成項目
- [x] Git 倉庫已初始化
- [x] 所有檔案已添加並提交
- [x] 遠程倉庫已設定
- [x] GitHub 倉庫已創建

### 🔍 確認狀態
在終端機執行以下命令確認當前狀態：
```bash
cd /mnt/e/INV20250830
git status
git log --oneline -n 1
git remote -v
```

應該看到：
- 工作目錄乾淨
- 有一個提交記錄
- origin 指向 GitHub 倉庫

---

## 🔐 方法一：使用 Personal Access Token（推薦）

### 步驟1：創建 Personal Access Token
1. **登入 GitHub**：https://github.com
2. **前往設定**：右上角頭像 → Settings
3. **開發者設定**：左側選單 → Developer settings
4. **Personal access tokens**：選擇 → Tokens (classic)
5. **生成新 token**：
   - 點擊「Generate new token」→「Generate new token (classic)」
   - **Note**：輸入 `INV01-upload-token`
   - **Expiration**：建議選擇 `90 days`
   - **權限設定**：勾選 `repo`（完整倉庫控制權限）
   - 點擊「Generate token」
6. **複製 Token**：⚠️ **重要**：Token 只顯示一次，請立即複製並保存

### 步驟2：使用 Token 推送
在終端機執行：
```bash
cd /mnt/e/INV20250830
git push -u origin main
```

當要求輸入認證信息時：
- **Username**：`idefwu`
- **Password**：貼上剛才複製的 Personal Access Token

### 步驟3：驗證上傳
訪問：https://github.com/idefwu/INV01
應該能看到所有檔案已成功上傳。

---

## 🔑 方法二：使用 SSH 金鑰（長期方案）

### 步驟1：使用現有 SSH 金鑰
我已經為你生成了 SSH 金鑰，公鑰內容如下：
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD52aTtCuHSicxkNewxKsJz10M0gN2sR9rF41k8Bl054mrmtF9Lhibht6+OP/Lk+KA186RQarmZz0cejJYB1a0aCV7KjpdiO3oJtx+n2MtRpgTN8YKjs4r0gWxLSmZqmcyIaHhHJ2u5PoqnjEV8MjnI8EYCoNP65HGblVQLJ3NXmLGDGV5lvxq66fKIkoiNNlnUukAs54xqg0g16Xf41irOwPI4W7tIBgUzA4PV1F6tg/kKZUGsVBd0g2phjdZ4QNYpg6ki/Eiqm/HoRWRGqgnsl+Wm46bIIxOAqC1glO7DsCdisqvzDLN1oCfXWJ514i07x4k3J+oB1+e43fILBclqFYJST5ZRBTwHAsn4B6iRZzQMkKGA4PQ9kEDXLOrYyQv6j4+Cp7T28yls2BLCDx+Dvs1FpROEbAGEksaJEVUh0ZFj7lsX+6217Vv8vPUXVIKqLDQ4KIRHRRw676zaEQADmoSz15vx/ambQM8TjuFwD5aHP99pOsubjYap2pwT0eSUZ96j1fSOQGKITi4zfBKedWeYuUtRKoQ9tNYKhvZSPrYrEqNhhXSqMQGulywDMXoQ2dYlO//lUkeSA7s4f5IBIPevurZVxzNStDHrTy2RLBUySv1Q9l4xgJV7hqOsMhO2ULxJtM6x+XwtZsMpKN3cI4DPUzvrKz7AYIZH83kBmQ== your-email@example.com
```

### 步驟2：添加 SSH 金鑰到 GitHub
1. **複製上面的公鑰**（整串文字）
2. **前往 GitHub SSH 設定**：https://github.com/settings/ssh
3. **新增 SSH 金鑰**：
   - 點擊「New SSH key」
   - **Title**：輸入 `INV01-SSH-Key`
   - **Key**：貼上複製的公鑰
   - 點擊「Add SSH key」
4. **輸入 GitHub 密碼**確認

### 步驟3：設定 SSH 遠程倉庫並推送
```bash
cd /mnt/e/INV20250830
git remote set-url origin git@github.com:idefwu/INV01.git
git push -u origin main
```

---

## 🖥️ 方法三：使用 GitHub Desktop（圖形化界面）

### 步驟1：下載並安裝
- 下載：https://desktop.github.com/
- 安裝並登入你的 GitHub 帳號

### 步驟2：添加現有倉庫
1. 開啟 GitHub Desktop
2. 選擇「Add an Existing Repository from your hard drive」
3. 瀏覽並選擇：`/mnt/e/INV20250830`
4. 點擊「Add repository」

### 步驟3：發布倉庫
1. 點擊「Publish repository」
2. 確認倉庫名稱：`INV01`
3. 取消勾選「Keep this code private」（如果要公開）
4. 點擊「Publish repository」

---

## 🔧 故障排除

### ❌ 問題1：Authentication failed
**解決方案**：
- 確認用戶名是 `idefwu`
- 確認使用的是 Personal Access Token 而不是密碼
- 檢查 Token 是否有 `repo` 權限

### ❌ 問題2：Permission denied (publickey)
**解決方案**：
- 確認 SSH 金鑰已正確添加到 GitHub
- 測試 SSH 連接：`ssh -T git@github.com`

### ❌ 問題3：Repository not found
**解決方案**：
- 確認倉庫名稱拼寫正確：`idefwu/INV01`
- 確認倉庫已在 GitHub 上創建

### ❌ 問題4：Git command not found
**解決方案**：
- 安裝 Git：https://git-scm.com/downloads
- 重新啟動終端機

---

## ✅ 驗證上傳成功

上傳完成後，請檢查以下項目：

1. **訪問倉庫**：https://github.com/idefwu/INV01
2. **確認檔案**：應該看到以下結構
   ```
   📁 basic/
     📁 js/
       📄 models.js
       📄 products.js
       📄 customers_enhanced.js
       📄 rop.js
       📄 ... (其他模組)
   📄 index.html
   📄 README.md
   📄 ROP_使用說明.md
   📄 working_system.html
   📄 ... (其他檔案)
   ```
3. **檢查提交信息**：應該顯示詳細的功能描述
4. **測試 GitHub Pages**（可選）：
   - 前往 Repository → Settings → Pages
   - Source 選擇 `Deploy from a branch`
   - Branch 選擇 `main`
   - 等待幾分鐘後，你的系統將可在線訪問

---

## 🎉 完成後的好處

### 📊 項目特色
- ✅ **完整的庫存管理系統**
- ✅ **ROP 再訂購點模組**
- ✅ **響應式設計**
- ✅ **模組化架構**
- ✅ **詳細文檔**

### 🌟 GitHub 倉庫優勢
- 📁 **版本控制**：完整的代碼歷史
- 🌐 **在線展示**：可啟用 GitHub Pages
- 🤝 **協作開發**：支援多人協作
- 💾 **備份安全**：雲端自動備份
- 📈 **持續改進**：支援後續功能擴展

---

## 📞 需要幫助？

如果在上傳過程中遇到任何問題，請：
1. 確認網絡連接正常
2. 檢查 GitHub 帳號狀態
3. 嘗試不同的認證方法
4. 查看錯誤訊息並搜尋解決方案

**記住**：所有檔案已經準備就緒，只需要完成認證和推送這最後一步！

---

*最後更新：2025-08-31*