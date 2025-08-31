// 庫存管理系統 - 再訂購點 (ROP) 模組

class ROPModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.lastCheckTime = null;
        this.alertThreshold = 0; // 提前提醒天數
    }
    
    initialize() {
        this.bindEvents();
        this.loadROPData();
    }
    
    bindEvents() {
        const ropForm = document.getElementById('rop-form');
        if (ropForm) {
            ropForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleROPSubmit();
            });
        }
        
        const refreshBtn = document.getElementById('refresh-reorder-list');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshReorderList();
            });
        }
        
        const exportBtn = document.getElementById('export-reorder-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReorderReport();
            });
        }
        
        const searchInput = document.getElementById('rop-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterROPTable(e.target.value);
            });
        }
    }
    
    loadROPData() {
        this.loadROPSettings();
        this.loadReorderList();
        this.updateROPStatistics();
    }
    
    // 載入ROP設定表格
    loadROPSettings() {
        const tbody = document.getElementById('rop-settings-table');
        if (!tbody) return;
        
        const products = this.system.products;
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td class="text-center">${product.currentStock}</td>
                <td class="text-center">
                    <input type="number" class="form-control form-control-sm" 
                           value="${product.reorderPoint}" 
                           onchange="ropModule.updateReorderPoint('${product.id}', this.value)"
                           min="0">
                </td>
                <td class="text-center">
                    <input type="number" class="form-control form-control-sm" 
                           value="${product.reorderQuantity}" 
                           onchange="ropModule.updateReorderQuantity('${product.id}', this.value)"
                           min="0">
                </td>
                <td class="text-center">
                    ${product.needsReorder() ? 
                        '<span class="status-badge status-warning">需要補貨</span>' : 
                        '<span class="status-badge status-completed">正常</span>'
                    }
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="ropModule.quickReorder('${product.id}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // 載入缺貨清單
    loadReorderList() {
        const tbody = document.getElementById('reorder-list-table');
        if (!tbody) return;
        
        const reorderList = this.system.getReorderList();
        
        if (reorderList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">目前沒有需要補貨的商品</td></tr>';
            return;
        }
        
        tbody.innerHTML = reorderList.map(item => {
            const product = this.system.products.find(p => p.id === item.productId);
            const estimatedCost = item.suggestedQuantity * (product ? product.costPrice : 0);
            
            return `
                <tr class="reorder-item">
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td class="text-center text-warning">${item.currentStock}</td>
                    <td class="text-center">${item.reorderPoint}</td>
                    <td class="text-center text-primary font-weight-bold">${item.suggestedQuantity}</td>
                    <td class="text-right">$${estimatedCost.toLocaleString()}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-success" 
                                onclick="ropModule.createPurchaseOrder('${item.productId}')">
                            <i class="fas fa-plus"></i> 建立進貨單
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // 更新統計資訊
    updateROPStatistics() {
        const reorderReport = this.system.generateReorderReport();
        
        const totalItemsElement = document.getElementById('total-reorder-items');
        const totalValueElement = document.getElementById('total-reorder-value');
        const lastUpdateElement = document.getElementById('last-update-time');
        
        if (totalItemsElement) {
            totalItemsElement.textContent = reorderReport.totalItems;
        }
        
        if (totalValueElement) {
            totalValueElement.textContent = `$${reorderReport.totalSuggestedValue.toLocaleString()}`;
        }
        
        if (lastUpdateElement) {
            lastUpdateElement.textContent = new Date().toLocaleString('zh-TW');
        }
    }
    
    // 更新商品的再訂購點
    updateReorderPoint(productId, newValue) {
        try {
            const product = this.system.products.find(p => p.id === productId);
            if (!product) throw new Error('商品不存在');
            
            const reorderPoint = parseInt(newValue) || 0;
            product.reorderPoint = reorderPoint;
            product.updatedAt = new Date();
            
            this.system.recordActivity('product', 
                `更新 ${product.name} 再訂購點: ${reorderPoint}`);
            
            // 刷新相關顯示
            this.loadROPSettings();
            this.loadReorderList();
            this.updateROPStatistics();
            
            showAlert(`${product.name} 再訂購點已更新為 ${reorderPoint}`, 'success');
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 更新商品的再訂購量
    updateReorderQuantity(productId, newValue) {
        try {
            const product = this.system.products.find(p => p.id === productId);
            if (!product) throw new Error('商品不存在');
            
            const reorderQuantity = parseInt(newValue) || 0;
            product.reorderQuantity = reorderQuantity;
            product.updatedAt = new Date();
            
            this.system.recordActivity('product', 
                `更新 ${product.name} 再訂購量: ${reorderQuantity}`);
            
            // 刷新相關顯示
            this.loadReorderList();
            this.updateROPStatistics();
            
            showAlert(`${product.name} 再訂購量已更新為 ${reorderQuantity}`, 'success');
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 快速重新訂購
    quickReorder(productId) {
        try {
            const product = this.system.products.find(p => p.id === productId);
            if (!product) throw new Error('商品不存在');
            
            if (!product.needsReorder()) {
                showAlert(`${product.name} 目前不需要補貨`, 'info');
                return;
            }
            
            if (product.reorderQuantity <= 0) {
                showAlert(`請先設定 ${product.name} 的再訂購量`, 'warning');
                return;
            }
            
            // 這裡可以整合進貨單創建功能
            const confirmed = confirm(
                `確定要為 ${product.name} 建立進貨單嗎？\n` +
                `建議數量: ${product.reorderQuantity} ${product.unit}\n` +
                `預估成本: $${(product.reorderQuantity * product.costPrice).toLocaleString()}`
            );
            
            if (confirmed) {
                this.createPurchaseOrder(productId);
            }
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 創建進貨單
    createPurchaseOrder(productId) {
        try {
            const product = this.system.products.find(p => p.id === productId);
            if (!product) throw new Error('商品不存在');
            
            // 檢查是否有供應商
            if (this.system.suppliers.length === 0) {
                showAlert('請先新增供應商才能建立進貨單', 'warning');
                return;
            }
            
            // 使用第一個供應商（實際應用中可以讓用戶選擇）
            const supplier = this.system.suppliers[0];
            const orderItems = [{
                productId: product.id,
                quantity: product.reorderQuantity,
                unitPrice: product.costPrice
            }];
            
            const purchaseOrder = this.system.createPurchaseOrder(
                supplier.id, 
                new Date(), 
                orderItems
            );
            
            showAlert(`已為 ${product.name} 建立進貨單 ${purchaseOrder.id}`, 'success');
            
            // 刷新顯示
            this.loadReorderList();
            this.updateROPStatistics();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 刷新缺貨清單
    refreshReorderList() {
        this.loadReorderList();
        this.updateROPStatistics();
        showAlert('缺貨清單已更新', 'success');
    }
    
    // 匯出缺貨報表
    exportReorderReport() {
        try {
            const reorderReport = this.system.generateReorderReport();
            
            if (reorderReport.reorderList.length === 0) {
                showAlert('目前沒有需要補貨的商品', 'info');
                return;
            }
            
            const csvHeaders = [
                '商品編號', '商品名稱', '目前庫存', '再訂購點', '建議進貨量', '預估成本'
            ];
            
            const csvData = reorderReport.reorderList.map(item => {
                const product = this.system.products.find(p => p.id === item.productId);
                const estimatedCost = item.suggestedQuantity * (product ? product.costPrice : 0);
                
                return [
                    item.code,
                    item.name,
                    item.currentStock,
                    item.reorderPoint,
                    item.suggestedQuantity,
                    estimatedCost
                ];
            });
            
            const csvContent = [
                csvHeaders.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');
            
            const blob = new Blob(['\ufeff' + csvContent], { 
                type: 'text/csv;charset=utf-8;' 
            });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `缺貨清單_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            showAlert('缺貨報表已匯出', 'success');
        } catch (error) {
            showAlert('匯出報表時發生錯誤: ' + error.message, 'error');
        }
    }
    
    // 過濾ROP設定表格
    filterROPTable(keyword) {
        const table = document.getElementById('rop-settings-table');
        if (!table) return;
        
        const rows = table.getElementsByTagName('tr');
        const lowerKeyword = keyword.toLowerCase();
        
        for (let row of rows) {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerKeyword) ? '' : 'none';
        }
    }
    
    // 批次設定ROP
    batchSetROP() {
        const modal = document.getElementById('batch-rop-modal');
        if (modal) {
            // 這裡可以實作批次設定的邏輯
            console.log('批次設定ROP功能待實作');
        }
    }
    
    // 獲取ROP建議設定（基於歷史消耗）
    getROPSuggestions(productId) {
        // 這是一個簡化版本，實際應用中會基於歷史資料分析
        const product = this.system.products.find(p => p.id === productId);
        if (!product) return null;
        
        // 基於安全庫存的建議設定
        const suggestedROP = Math.max(product.safetyStock * 1.2, 10);
        const suggestedQuantity = Math.max(product.safetyStock * 2, 50);
        
        return {
            reorderPoint: Math.round(suggestedROP),
            reorderQuantity: Math.round(suggestedQuantity),
            reasoning: '基於安全庫存計算的建議值'
        };
    }
    
    // 檢查ROP觸發
    checkROPTriggers() {
        const triggeredProducts = this.system.getReorderProducts();
        
        if (triggeredProducts.length > 0) {
            const message = `發現 ${triggeredProducts.length} 項商品需要補貨:\n` +
                triggeredProducts.map(p => `- ${p.name} (庫存: ${p.currentStock})`).join('\n');
            
            if (confirm(message + '\n\n是否要查看缺貨清單？')) {
                // 導航到ROP頁面
                if (typeof switchTab === 'function') {
                    switchTab('rop');
                }
            }
        }
        
        return triggeredProducts.length;
    }
}