// 庫存管理系統 - 商品管理模組

class ProductsModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.editingProductId = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchKeyword = '';
        this.sortField = 'code';
        this.sortDirection = 'asc';
    }
    
    // 初始化商品管理模組
    initialize() {
        this.bindEvents();
        this.loadProducts();
    }
    
    // 綁定事件
    bindEvents() {
        // 表單提交事件
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
        
        // 搜尋事件
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchKeyword = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }
        
        // 每頁顯示數量變更
        const itemsPerPageSelect = document.getElementById('items-per-page');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.loadProducts();
            });
        }
    }
    
    // 處理表單提交
    handleFormSubmit() {
        try {
            const formData = this.getFormData();
            
            if (this.editingProductId) {
                // 更新商品
                this.system.updateProduct(this.editingProductId, formData);
                showAlert('商品更新成功！', 'success');
                this.editingProductId = null;
            } else {
                // 新增商品
                this.system.addProduct(
                    formData.code,
                    formData.name,
                    formData.spec,
                    formData.unit,
                    formData.salePrice,
                    formData.costPrice,
                    formData.safetyStock
                );
                showAlert('商品新增成功！', 'success');
            }
            
            this.clearForm();
            this.loadProducts();
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 獲取表單數據
    getFormData() {
        const code = document.getElementById('product-code').value.trim();
        const name = document.getElementById('product-name').value.trim();
        const spec = document.getElementById('product-spec').value.trim();
        const unit = document.getElementById('product-unit').value.trim();
        const salePrice = parseFloat(document.getElementById('product-sale-price').value);
        const costPrice = parseFloat(document.getElementById('product-cost-price').value);
        const safetyStock = parseInt(document.getElementById('product-safety-stock').value) || 0;
        
        // 驗證必填欄位
        if (!code) throw new Error('商品編號為必填欄位');
        if (!name) throw new Error('商品名稱為必填欄位');
        if (!unit) throw new Error('單位為必填欄位');
        if (isNaN(salePrice) || salePrice < 0) throw new Error('請輸入有效的售價');
        if (isNaN(costPrice) || costPrice < 0) throw new Error('請輸入有效的成本價');
        
        // 檢查商品編號重複
        if (!this.editingProductId) {
            const existing = this.system.products.find(p => p.code === code);
            if (existing) throw new Error('商品編號已存在');
        } else {
            const existing = this.system.products.find(p => p.code === code && p.id !== this.editingProductId);
            if (existing) throw new Error('商品編號已存在');
        }
        
        return { code, name, spec, unit, salePrice, costPrice, safetyStock };
    }
    
    // 載入商品列表
    loadProducts() {
        try {
            let products = this.system.products;
            
            // 搜尋篩選
            if (this.searchKeyword) {
                products = this.system.searchProducts(this.searchKeyword);
            }
            
            // 排序
            products = this.sortProducts(products);
            
            // 分頁
            const totalItems = products.length;
            const totalPages = Math.ceil(totalItems / this.itemsPerPage);
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
            const pageProducts = products.slice(startIndex, endIndex);
            
            this.renderProductTable(pageProducts);
            this.renderPagination(totalPages, totalItems);
            
        } catch (error) {
            console.error('載入商品列表失敗:', error);
            showAlert('載入商品列表失敗', 'error');
        }
    }
    
    // 排序商品
    sortProducts(products) {
        return products.sort((a, b) => {
            let aValue = a[this.sortField];
            let bValue = b[this.sortField];
            
            // 處理不同數據類型
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            return this.sortDirection === 'desc' ? comparison * -1 : comparison;
        });
    }
    
    // 渲染商品表格
    renderProductTable(products) {
        const tbody = document.getElementById('products-table');
        if (!tbody) return;
        
        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>沒有找到符合條件的商品</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        const tableHtml = products.map(product => {
            const lowStock = product.isLowStock();
            const rowClass = lowStock ? 'low-stock-row' : '';
            
            return `
                <tr class="${rowClass}">
                    <td>${product.code}</td>
                    <td>
                        ${product.name}
                        ${lowStock ? '<i class="fas fa-exclamation-triangle text-warning" title="低庫存"></i>' : ''}
                    </td>
                    <td>${product.spec || '-'}</td>
                    <td>${product.unit}</td>
                    <td>$${product.salePrice.toFixed(2)}</td>
                    <td>$${product.costPrice.toFixed(2)}</td>
                    <td class="stock-cell">
                        <span class="${lowStock ? 'text-warning' : ''}">${product.currentStock}</span>
                        <small class="text-muted">/${product.safetyStock}</small>
                    </td>
                    <td>$${product.getStockValue().toLocaleString()}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary" onclick="productModule.editProduct('${product.id}')" title="編輯">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="productModule.showProductDetail('${product.id}')" title="詳情">
                                <i class="fas fa-info-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="productModule.adjustStock('${product.id}')" title="調整庫存">
                                <i class="fas fa-boxes"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="productModule.deleteProduct('${product.id}')" title="刪除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = tableHtml;
    }
    
    // 渲染分頁
    renderPagination(totalPages, totalItems) {
        const paginationContainer = document.getElementById('products-pagination');
        if (!paginationContainer) return;
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHtml = `
            <div class="pagination-info">
                顯示第 ${(this.currentPage - 1) * this.itemsPerPage + 1} - ${Math.min(this.currentPage * this.itemsPerPage, totalItems)} 項，共 ${totalItems} 項
            </div>
            <div class="pagination-controls">
        `;
        
        // 上一頁
        paginationHtml += `
            <button class="btn btn-sm ${this.currentPage === 1 ? 'btn-secondary' : 'btn-primary'}" 
                    ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="productModule.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 頁碼
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="productModule.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        // 下一頁
        paginationHtml += `
            <button class="btn btn-sm ${this.currentPage === totalPages ? 'btn-secondary' : 'btn-primary'}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="productModule.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationHtml += '</div>';
        paginationContainer.innerHTML = paginationHtml;
    }
    
    // 跳轉頁面
    goToPage(page) {
        this.currentPage = page;
        this.loadProducts();
    }
    
    // 編輯商品
    editProduct(productId) {
        const product = this.system.products.find(p => p.id === productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        this.editingProductId = productId;
        this.fillForm(product);
        
        // 捲動到表單
        const form = document.getElementById('product-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 更新表單標題
        const formTitle = document.querySelector('#products .section-title');
        if (formTitle) {
            formTitle.textContent = '編輯商品';
        }
    }
    
    // 填充表單
    fillForm(product) {
        document.getElementById('product-code').value = product.code;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-spec').value = product.spec || '';
        document.getElementById('product-unit').value = product.unit;
        document.getElementById('product-sale-price').value = product.salePrice;
        document.getElementById('product-cost-price').value = product.costPrice;
        document.getElementById('product-safety-stock').value = product.safetyStock;
    }
    
    // 清除表單
    clearForm() {
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
        }
        
        this.editingProductId = null;
        
        // 重置表單標題
        const formTitle = document.querySelector('#products .section-title');
        if (formTitle) {
            formTitle.textContent = '新增商品';
        }
    }
    
    // 刪除商品
    deleteProduct(productId) {
        const product = this.system.products.find(p => p.id === productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        if (confirm(`確定要刪除商品「${product.name}」嗎？此操作無法復原。`)) {
            try {
                this.system.deleteProduct(productId);
                showAlert('商品刪除成功', 'success');
                this.loadProducts();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    }
    
    // 顯示商品詳情
    showProductDetail(productId) {
        const product = this.system.products.find(p => p.id === productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        const content = `
            <div class="product-detail">
                <div class="detail-header">
                    <h4>${product.name}</h4>
                    <span class="product-code">${product.code}</span>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>規格:</label>
                        <span>${product.spec || '-'}</span>
                    </div>
                    <div class="detail-item">
                        <label>單位:</label>
                        <span>${product.unit}</span>
                    </div>
                    <div class="detail-item">
                        <label>售價:</label>
                        <span>$${product.salePrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <label>成本價:</label>
                        <span>$${product.costPrice.toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <label>目前庫存:</label>
                        <span class="${product.isLowStock() ? 'text-warning' : ''}">${product.currentStock} ${product.unit}</span>
                    </div>
                    <div class="detail-item">
                        <label>安全庫存:</label>
                        <span>${product.safetyStock} ${product.unit}</span>
                    </div>
                    <div class="detail-item">
                        <label>庫存價值:</label>
                        <span>$${product.getStockValue().toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <label>建立時間:</label>
                        <span>${product.createdAt.toLocaleString('zh-TW')}</span>
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="productModule.editProduct('${product.id}'); closeModal();">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                    <button class="btn btn-warning" onclick="productModule.adjustStock('${product.id}');">
                        <i class="fas fa-boxes"></i> 調整庫存
                    </button>
                </div>
            </div>
        `;
        
        openModal('商品詳情', content);
    }
    
    // 調整庫存
    adjustStock(productId) {
        const product = this.system.products.find(p => p.id === productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        const content = `
            <form id="stock-adjust-form">
                <div class="form-group">
                    <label>商品:</label>
                    <div class="product-info">${product.name} (${product.code})</div>
                    <small>目前庫存: ${product.currentStock} ${product.unit}</small>
                </div>
                
                <div class="form-group">
                    <label>調整類型:</label>
                    <select id="adjust-type" class="form-input" required>
                        <option value="">請選擇調整類型</option>
                        <option value="increase">增加</option>
                        <option value="decrease">減少</option>
                        <option value="set">設定</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>數量:</label>
                    <input type="number" id="adjust-quantity" class="form-input" min="0" required>
                </div>
                
                <div class="form-group">
                    <label>調整原因:</label>
                    <input type="text" id="adjust-reason" class="form-input" placeholder="請輸入調整原因" required>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">確認調整</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                </div>
            </form>
        `;
        
        openModal('調整庫存', content);
        
        // 綁定表單事件
        document.getElementById('stock-adjust-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStockAdjust(productId);
        });
    }
    
    // 處理庫存調整
    handleStockAdjust(productId) {
        try {
            const adjustType = document.getElementById('adjust-type').value;
            const quantity = parseInt(document.getElementById('adjust-quantity').value);
            const reason = document.getElementById('adjust-reason').value.trim();
            
            if (!adjustType) throw new Error('請選擇調整類型');
            if (isNaN(quantity) || quantity <= 0) throw new Error('請輸入有效的數量');
            if (!reason) throw new Error('請輸入調整原因');
            
            this.system.adjustInventory(productId, adjustType, quantity, reason);
            showAlert('庫存調整成功', 'success');
            this.loadProducts();
            closeModal();
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 批量操作
    batchDelete(productIds) {
        if (productIds.length === 0) {
            showAlert('請選擇要刪除的商品', 'warning');
            return;
        }
        
        if (confirm(`確定要刪除選中的 ${productIds.length} 個商品嗎？此操作無法復原。`)) {
            try {
                productIds.forEach(id => this.system.deleteProduct(id));
                showAlert(`已刪除 ${productIds.length} 個商品`, 'success');
                this.loadProducts();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    }
    
    // 匯出商品列表
    exportProducts() {
        const products = this.system.products;
        
        const csvContent = [
            ['商品編號', '商品名稱', '規格', '單位', '售價', '成本價', '目前庫存', '安全庫存', '庫存價值'],
            ...products.map(p => [
                p.code, p.name, p.spec || '', p.unit, 
                p.salePrice, p.costPrice, p.currentStock, p.safetyStock, p.getStockValue()
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `商品清單_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        showAlert('商品清單已匯出', 'success');
    }
    
    // 排序
    sortBy(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.loadProducts();
    }
}