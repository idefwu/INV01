// 庫存管理系統 - 庫存管理模組

class InventoryModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
    }
    
    initialize() {
        this.bindEvents();
        this.loadInventoryData();
    }
    
    bindEvents() {
        const adjustmentForm = document.getElementById('adjustment-form');
        if (adjustmentForm) {
            adjustmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdjustmentSubmit();
            });
        }
        
        const searchInput = document.getElementById('inventory-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterInventory(e.target.value);
            });
        }
    }
    
    loadInventoryData() {
        this.loadLowStockProducts();
        this.loadAdjustmentOptions();
        this.loadInventoryTable();
    }
    
    loadLowStockProducts() {
        const tbody = document.getElementById('low-stock-table');
        if (!tbody) return;
        
        const lowStockProducts = this.system.getLowStockProducts();
        
        if (lowStockProducts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">目前沒有低庫存商品</td></tr>';
            return;
        }
        
        tbody.innerHTML = lowStockProducts.map(product => `
            <tr class="low-stock-row">
                <td>${product.code}</td>
                <td>${product.name}</td>
                <td class="text-warning">${product.currentStock}</td>
                <td>${product.safetyStock}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="inventoryModule.quickAdjust('${product.id}')">
                        <i class="fas fa-plus"></i> 快速補貨
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    loadAdjustmentOptions() {
        const select = document.getElementById('adjustment-product');
        if (!select) return;
        
        select.innerHTML = '<option value="">請選擇商品</option>' +
            this.system.products.map(product => 
                `<option value="${product.id}">${product.code} - ${product.name} (庫存: ${product.currentStock})</option>`
            ).join('');
    }
    
    handleAdjustmentSubmit() {
        try {
            const productId = document.getElementById('adjustment-product').value;
            const adjustmentType = document.getElementById('adjustment-type').value;
            const quantity = parseInt(document.getElementById('adjustment-quantity').value);
            const reason = document.getElementById('adjustment-reason').value.trim();
            
            if (!productId) throw new Error('請選擇商品');
            if (!adjustmentType) throw new Error('請選擇調整類型');
            if (isNaN(quantity) || quantity <= 0) throw new Error('請輸入有效的數量');
            if (!reason) throw new Error('請輸入調整原因');
            
            this.system.adjustInventory(productId, adjustmentType, quantity, reason);
            showAlert('庫存調整成功！', 'success');
            
            this.clearAdjustmentForm();
            this.loadInventoryData();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    quickAdjust(productId) {
        const product = this.system.products.find(p => p.id === productId);
        if (!product) return;
        
        const suggestedQuantity = Math.max(product.safetyStock - product.currentStock, 1);
        const quantity = prompt(`建議補充數量: ${suggestedQuantity} ${product.unit}\n請輸入要補充的數量:`, suggestedQuantity);
        
        if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
            try {
                this.system.adjustInventory(productId, 'increase', parseInt(quantity), '低庫存自動補貨');
                showAlert(`已為 ${product.name} 補充 ${quantity} ${product.unit}`, 'success');
                this.loadInventoryData();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    }
    
    loadInventoryTable() {
        const tbody = document.getElementById('inventory-table');
        if (!tbody) return;
        
        const products = this.system.products;
        tbody.innerHTML = products.map(product => {
            const isLowStock = product.isLowStock();
            const rowClass = isLowStock ? 'low-stock-row' : '';
            
            return `
                <tr class="${rowClass}">
                    <td>${product.code}</td>
                    <td>${product.name}</td>
                    <td class="${isLowStock ? 'text-warning' : ''}">${product.currentStock}</td>
                    <td>${product.unit}</td>
                    <td>$${product.getStockValue().toLocaleString()}</td>
                    <td>${product.safetyStock}</td>
                    <td>
                        ${isLowStock ? 
                            '<span class="status-badge status-warning">低庫存</span>' : 
                            '<span class="status-badge status-completed">正常</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    filterInventory(keyword) {
        const tbody = document.getElementById('inventory-table');
        const rows = tbody.getElementsByTagName('tr');
        
        for (let row of rows) {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(keyword.toLowerCase()) ? '' : 'none';
        }
    }
    
    clearAdjustmentForm() {
        document.getElementById('adjustment-form').reset();
    }
    
    exportInventoryReport() {
        const products = this.system.products;
        const reportData = products.map(p => ({
            '商品編號': p.code,
            '商品名稱': p.name,
            '規格': p.spec || '',
            '單位': p.unit,
            '目前庫存': p.currentStock,
            '安全庫存': p.safetyStock,
            '成本價': p.costPrice,
            '庫存價值': p.getStockValue(),
            '狀態': p.isLowStock() ? '低庫存' : '正常'
        }));
        
        const csvContent = [
            Object.keys(reportData[0]).join(','),
            ...reportData.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `庫存報表_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showAlert('庫存報表已匯出', 'success');
    }
}