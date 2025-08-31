// 庫存管理系統 - 增強版商品管理模組

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
        this.loadProductData();
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
                this.loadProductData();
            });
        }
        
        // 排序事件
        this.bindSortEvents();
        
        // 表單欄位變化事件
        this.bindFormEvents();
    }
    
    // 綁定排序事件
    bindSortEvents() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.field;
                if (this.sortField === field) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortDirection = 'asc';
                }
                this.loadProductData();
            });
        });
    }
    
    // 綁定表單事件
    bindFormEvents() {
        // 成本價變化自動建議售價
        const costPriceInput = document.getElementById('product-cost');
        const salePriceInput = document.getElementById('product-sale-price');
        
        if (costPriceInput && salePriceInput) {
            costPriceInput.addEventListener('input', (e) => {
                const costPrice = parseFloat(e.target.value);
                if (!isNaN(costPrice) && costPrice > 0) {
                    // 建議售價為成本價的1.2倍
                    const suggestedPrice = Math.ceil(costPrice * 1.2);
                    if (!salePriceInput.value) {
                        salePriceInput.value = suggestedPrice;
                    }
                }
            });
        }
        
        // 商品編號輸入時檢查重複
        const codeInput = document.getElementById('product-code');
        if (codeInput) {
            codeInput.addEventListener('blur', (e) => {
                this.checkProductCodeDuplicate(e.target.value);
            });
        }
    }
    
    // 檢查商品編號重複
    checkProductCodeDuplicate(code) {
        if (!code.trim()) return;
        
        const existing = this.system.products.find(p => 
            p.code === code.trim() && p.id !== this.editingProductId
        );
        
        const codeInput = document.getElementById('product-code');
        const feedbackDiv = document.getElementById('code-feedback');
        
        if (existing) {
            codeInput.classList.add('is-invalid');
            if (feedbackDiv) {
                feedbackDiv.textContent = '商品編號已存在';
                feedbackDiv.style.color = '#dc3545';
            }
        } else {
            codeInput.classList.remove('is-invalid');
            codeInput.classList.add('is-valid');
            if (feedbackDiv) {
                feedbackDiv.textContent = '商品編號可用';
                feedbackDiv.style.color = '#28a745';
            }
        }
    }
    
    // 處理表單提交
    handleFormSubmit() {
        try {
            const formData = this.getFormData();
            
            if (this.editingProductId) {
                // 更新商品
                this.updateProduct(formData);
            } else {
                // 新增商品
                this.addProduct(formData);
            }
            
            this.clearForm();
            this.loadProductData();
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 新增商品
    addProduct(formData) {
        const product = this.system.addProduct(
            formData.code,
            formData.name,
            formData.spec,
            formData.unit,
            formData.costPrice,
            formData.salePrice,
            formData.safetyStock,
            formData.initialStock
        );
        
        showAlert(`商品 ${product.name} 新增成功！`, 'success');
        
        // 記錄活動
        this.system.recordActivity(
            'product', 
            `新增商品: ${product.name} (${product.code})`,
            product.id
        );
    }
    
    // 更新商品
    updateProduct(formData) {
        const product = this.system.getProductById(this.editingProductId);
        if (!product) throw new Error('商品不存在');
        
        const oldName = product.name;
        
        // 更新商品資訊
        Object.assign(product, formData);
        
        showAlert(`商品 ${product.name} 更新成功！`, 'success');
        
        // 記錄活動
        this.system.recordActivity(
            'product', 
            `更新商品: ${oldName} → ${product.name}`,
            product.id
        );
        
        this.editingProductId = null;
    }
    
    // 獲取表單數據
    getFormData() {
        const code = document.getElementById('product-code').value.trim();
        const name = document.getElementById('product-name').value.trim();
        const spec = document.getElementById('product-spec').value.trim();
        const unit = document.getElementById('product-unit').value.trim();
        const salePrice = parseFloat(document.getElementById('product-sale-price').value);
        const costPrice = parseFloat(document.getElementById('product-cost').value);
        const safetyStock = parseInt(document.getElementById('product-safety-stock').value) || 0;
        const initialStock = parseInt(document.getElementById('product-initial-stock').value) || 0;
        
        // 驗證必填欄位
        this.validateFormData({ code, name, unit, salePrice, costPrice });
        
        return { code, name, spec, unit, salePrice, costPrice, safetyStock, initialStock };
    }
    
    // 驗證表單數據
    validateFormData(data) {
        if (!data.code) throw new Error('商品編號為必填欄位');
        if (!data.name) throw new Error('商品名稱為必填欄位');
        if (!data.unit) throw new Error('單位為必填欄位');
        if (isNaN(data.salePrice) || data.salePrice < 0) throw new Error('請輸入有效的售價');
        if (isNaN(data.costPrice) || data.costPrice < 0) throw new Error('請輸入有效的成本價');
        
        // 檢查商品編號重複
        const existing = this.system.products.find(p => 
            p.code === data.code && p.id !== this.editingProductId
        );
        if (existing) throw new Error('商品編號已存在');
    }
    
    // 載入商品數據
    loadProductData() {
        try {
            let products = [...this.system.products];
            
            // 搜尋篩選
            if (this.searchKeyword) {
                products = this.filterProducts(products, this.searchKeyword);
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
            this.updateProductStats(this.system.products);
            
        } catch (error) {
            console.error('載入商品列表失敗:', error);
            showAlert('載入商品列表失敗', 'error');
        }
    }
    
    // 篩選商品
    filterProducts(products, keyword) {
        const searchTerm = keyword.toLowerCase();
        return products.filter(product => 
            product.code.toLowerCase().includes(searchTerm) ||
            product.name.toLowerCase().includes(searchTerm) ||
            (product.spec && product.spec.toLowerCase().includes(searchTerm)) ||
            product.unit.toLowerCase().includes(searchTerm)
        );
    }
    
    // 排序商品
    sortProducts(products) {
        return products.sort((a, b) => {
            let aValue = a[this.sortField];
            let bValue = b[this.sortField];
            
            // 處理特殊字段
            if (this.sortField === 'stockValue') {
                aValue = a.getStockValue();
                bValue = b.getStockValue();
            } else if (this.sortField === 'lowStock') {
                aValue = a.isLowStock() ? 1 : 0;
                bValue = b.isLowStock() ? 1 : 0;
            }
            
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
                            ${this.searchKeyword ? 
                                `<button class="btn btn-secondary" onclick="productsModule.clearSearch()">清除搜尋</button>` : 
                                `<button class="btn btn-primary" onclick="showSection('products')">新增商品</button>`
                            }
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        const tableHtml = products.map(product => {
            const lowStock = product.isLowStock();
            const rowClass = lowStock ? 'low-stock-row' : '';
            const stockStatus = this.getStockStatus(product);
            
            return `
                <tr class="${rowClass}" data-product-id="${product.id}">
                    <td>
                        <div class="product-code">
                            ${product.code}
                            ${lowStock ? '<i class="fas fa-exclamation-triangle text-warning" title="低庫存警示"></i>' : ''}
                        </div>
                    </td>
                    <td>
                        <div class="product-name">
                            <strong>${product.name}</strong>
                            ${product.spec ? `<br><small class="text-muted">${product.spec}</small>` : ''}
                        </div>
                    </td>
                    <td>${product.unit}</td>
                    <td>$${product.costPrice.toFixed(2)}</td>
                    <td>$${product.salePrice.toFixed(2)}</td>
                    <td class="stock-cell">
                        <span class="${stockStatus.class}" title="${stockStatus.title}">
                            ${product.currentStock}
                        </span>
                        <small class="text-muted">/${product.safetyStock}</small>
                    </td>
                    <td>
                        <span class="${stockStatus.badgeClass}">${stockStatus.text}</span>
                    </td>
                    <td>$${product.getStockValue().toLocaleString()}</td>
                    <td>
                        <div class="btn-group-sm">
                            <button class="btn btn-sm btn-primary" onclick="productsModule.editProduct('${product.id}')" title="編輯商品">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-info" onclick="productsModule.showProductDetail('${product.id}')" title="商品詳情">
                                <i class="fas fa-info-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="productsModule.quickAdjustStock('${product.id}')" title="調整庫存">
                                <i class="fas fa-boxes"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="productsModule.confirmDeleteProduct('${product.id}')" title="刪除商品">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = tableHtml;
    }
    
    // 獲取庫存狀態
    getStockStatus(product) {
        if (product.currentStock <= 0) {
            return {
                class: 'text-danger',
                badgeClass: 'status-badge status-warning',
                text: '缺貨',
                title: '庫存為零或負數'
            };
        } else if (product.isLowStock()) {
            return {
                class: 'text-warning',
                badgeClass: 'status-badge status-warning',
                text: '低庫存',
                title: '庫存低於安全庫存'
            };
        } else {
            return {
                class: 'text-success',
                badgeClass: 'status-badge status-completed',
                text: '正常',
                title: '庫存充足'
            };
        }
    }
    
    // 更新商品統計
    updateProductStats(products) {
        const statsContainer = document.getElementById('product-stats');
        if (!statsContainer) return;
        
        const totalProducts = products.length;
        const lowStockCount = products.filter(p => p.isLowStock()).length;
        const outOfStockCount = products.filter(p => p.currentStock <= 0).length;
        const totalValue = products.reduce((sum, p) => sum + p.getStockValue(), 0);
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${totalProducts}</div>
                    <div class="stat-label">總商品數</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value text-warning">${lowStockCount}</div>
                    <div class="stat-label">低庫存</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value text-danger">${outOfStockCount}</div>
                    <div class="stat-label">缺貨</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Utils.formatCurrency(totalValue)}</div>
                    <div class="stat-label">庫存總值</div>
                </div>
            </div>
        `;
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
                    onclick="productsModule.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i> 上一頁
            </button>
        `;
        
        // 頁碼
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<button class="btn btn-sm btn-outline-primary" onclick="productsModule.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHtml += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-outline-primary'}" 
                        onclick="productsModule.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHtml += `<button class="btn btn-sm btn-outline-primary" onclick="productsModule.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // 下一頁
        paginationHtml += `
            <button class="btn btn-sm ${this.currentPage === totalPages ? 'btn-secondary' : 'btn-primary'}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="productsModule.goToPage(${this.currentPage + 1})">
                下一頁 <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationHtml += '</div>';
        paginationContainer.innerHTML = paginationHtml;
    }
    
    // 跳轉頁面
    goToPage(page) {
        this.currentPage = page;
        this.loadProductData();
    }
    
    // 編輯商品
    editProduct(productId) {
        const product = this.system.getProductById(productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        this.editingProductId = productId;
        this.fillForm(product);
        
        // 捲動到表單並高亮
        const form = document.getElementById('product-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            form.classList.add('editing-mode');
            
            // 更新表單標題
            const formTitle = form.querySelector('.section-title');
            if (formTitle) {
                formTitle.textContent = '編輯商品';
            }
            
            // 更新提交按鈕文字
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> 更新商品';
            }
        }
        
        showAlert(`正在編輯商品: ${product.name}`, 'info');
    }
    
    // 填充表單
    fillForm(product) {
        const fields = {
            'product-code': product.code,
            'product-name': product.name,
            'product-spec': product.spec || '',
            'product-unit': product.unit,
            'product-cost': product.costPrice,
            'product-sale-price': product.salePrice,
            'product-safety-stock': product.safetyStock,
            'product-initial-stock': product.currentStock
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
    }
    
    // 顯示商品詳情
    showProductDetail(productId) {
        const product = this.system.getProductById(productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        // 獲取相關交易記錄
        const purchaseRecords = this.system.purchaseOrders
            .filter(po => po.items.some(item => item.productId === productId))
            .slice(0, 5);
            
        const salesRecords = this.system.salesOrders
            .filter(so => so.items.some(item => item.productId === productId))
            .slice(0, 5);
            
        const adjustmentRecords = this.system.inventoryAdjustments
            .filter(adj => adj.productId === productId)
            .slice(0, 5);
        
        const stockStatus = this.getStockStatus(product);
        
        const content = `
            <div class="product-detail">
                <div class="detail-header">
                    <h4>${product.name}</h4>
                    <span class="${stockStatus.badgeClass}">${stockStatus.text}</span>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-section">
                        <h5>基本資訊</h5>
                        <div class="detail-row">
                            <label>商品編號:</label>
                            <span>${product.code}</span>
                        </div>
                        <div class="detail-row">
                            <label>商品名稱:</label>
                            <span>${product.name}</span>
                        </div>
                        <div class="detail-row">
                            <label>規格:</label>
                            <span>${product.spec || '-'}</span>
                        </div>
                        <div class="detail-row">
                            <label>單位:</label>
                            <span>${product.unit}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>價格資訊</h5>
                        <div class="detail-row">
                            <label>成本價:</label>
                            <span>$${product.costPrice.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <label>售價:</label>
                            <span>$${product.salePrice.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <label>毛利率:</label>
                            <span>${(((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>庫存資訊</h5>
                        <div class="detail-row">
                            <label>目前庫存:</label>
                            <span class="${stockStatus.class}">${product.currentStock} ${product.unit}</span>
                        </div>
                        <div class="detail-row">
                            <label>安全庫存:</label>
                            <span>${product.safetyStock} ${product.unit}</span>
                        </div>
                        <div class="detail-row">
                            <label>庫存價值:</label>
                            <span>$${product.getStockValue().toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="transaction-history">
                    <div class="history-tabs">
                        <button class="tab-btn active" onclick="productsModule.showTab('purchase')">進貨記錄</button>
                        <button class="tab-btn" onclick="productsModule.showTab('sales')">銷貨記錄</button>
                        <button class="tab-btn" onclick="productsModule.showTab('adjustments')">調整記錄</button>
                    </div>
                    
                    <div id="purchase-tab" class="tab-content active">
                        ${purchaseRecords.length > 0 ? `
                            <table class="table table-sm">
                                <thead>
                                    <tr><th>單號</th><th>日期</th><th>數量</th><th>單價</th></tr>
                                </thead>
                                <tbody>
                                    ${purchaseRecords.map(po => {
                                        const item = po.items.find(item => item.productId === productId);
                                        return `
                                            <tr>
                                                <td>${po.id}</td>
                                                <td>${Utils.formatDate(po.orderDate)}</td>
                                                <td>+${item.quantity}</td>
                                                <td>$${item.unitPrice.toFixed(2)}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        ` : '<p class="text-muted">無進貨記錄</p>'}
                    </div>
                    
                    <div id="sales-tab" class="tab-content">
                        ${salesRecords.length > 0 ? `
                            <table class="table table-sm">
                                <thead>
                                    <tr><th>單號</th><th>日期</th><th>數量</th><th>單價</th></tr>
                                </thead>
                                <tbody>
                                    ${salesRecords.map(so => {
                                        const item = so.items.find(item => item.productId === productId);
                                        return `
                                            <tr>
                                                <td>${so.id}</td>
                                                <td>${Utils.formatDate(so.orderDate)}</td>
                                                <td>-${item.quantity}</td>
                                                <td>$${item.unitPrice.toFixed(2)}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        ` : '<p class="text-muted">無銷貨記錄</p>'}
                    </div>
                    
                    <div id="adjustments-tab" class="tab-content">
                        ${adjustmentRecords.length > 0 ? `
                            <table class="table table-sm">
                                <thead>
                                    <tr><th>類型</th><th>數量</th><th>原因</th><th>日期</th></tr>
                                </thead>
                                <tbody>
                                    ${adjustmentRecords.map(adj => `
                                        <tr>
                                            <td>${adj.adjustmentType === 'increase' ? '增加' : adj.adjustmentType === 'decrease' ? '減少' : '設定'}</td>
                                            <td>${adj.adjustmentType === 'increase' ? '+' : adj.adjustmentType === 'decrease' ? '-' : ''}${adj.quantity}</td>
                                            <td>${adj.reason}</td>
                                            <td>${Utils.formatDate(adj.createdAt)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p class="text-muted">無調整記錄</p>'}
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="productsModule.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> 編輯商品
                    </button>
                    <button class="btn btn-warning" onclick="productsModule.quickAdjustStock('${product.id}')">
                        <i class="fas fa-boxes"></i> 調整庫存
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> 關閉
                    </button>
                </div>
            </div>
        `;
        
        openModal(`商品詳情 - ${product.name}`, content);
    }
    
    // 切換詳情頁籤
    showTab(tabName) {
        // 更新按鈕狀態
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // 更新內容顯示
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    // 快速調整庫存
    quickAdjustStock(productId) {
        const product = this.system.getProductById(productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        const content = `
            <div class="quick-adjust-form">
                <h4>調整庫存 - ${product.name}</h4>
                <div class="current-stock">
                    <label>目前庫存:</label>
                    <span class="stock-value">${product.currentStock} ${product.unit}</span>
                </div>
                
                <form id="quick-adjust-form">
                    <div class="form-group">
                        <label class="form-label">調整類型</label>
                        <select class="form-input" id="adjust-type" required>
                            <option value="">請選擇調整類型</option>
                            <option value="increase">增加</option>
                            <option value="decrease">減少</option>
                            <option value="set">設定</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">數量</label>
                        <input type="number" class="form-input" id="adjust-quantity" min="1" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">調整原因</label>
                        <input type="text" class="form-input" id="adjust-reason" placeholder="請輸入調整原因" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-check"></i> 確認調整
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">
                            <i class="fas fa-times"></i> 取消
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        openModal('調整庫存', content);
        
        // 綁定表單提交事件
        document.getElementById('quick-adjust-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickAdjust(productId);
        });
    }
    
    // 處理快速調整
    handleQuickAdjust(productId) {
        try {
            const adjustType = document.getElementById('adjust-type').value;
            const quantity = parseInt(document.getElementById('adjust-quantity').value);
            const reason = document.getElementById('adjust-reason').value.trim();
            
            if (!adjustType) throw new Error('請選擇調整類型');
            if (isNaN(quantity) || quantity <= 0) throw new Error('請輸入有效的數量');
            if (!reason) throw new Error('請輸入調整原因');
            
            this.system.adjustInventory(productId, adjustType, quantity, reason);
            
            const product = this.system.getProductById(productId);
            showAlert(`庫存調整成功！${product.name} 目前庫存: ${product.currentStock}`, 'success');
            
            this.loadProductData();
            closeModal();
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 確認刪除商品
    confirmDeleteProduct(productId) {
        const product = this.system.getProductById(productId);
        if (!product) {
            showAlert('商品不存在', 'error');
            return;
        }
        
        // 檢查是否有相關交易記錄
        const hasTransactions = this.system.purchaseOrders.some(po => 
            po.items.some(item => item.productId === productId)
        ) || this.system.salesOrders.some(so => 
            so.items.some(item => item.productId === productId)
        );
        
        const warningMessage = hasTransactions ? 
            '⚠️ 此商品有交易記錄，刪除後將無法復原！' : 
            '確定要刪除此商品嗎？此操作無法復原！';
        
        if (confirm(`${warningMessage}\n\n商品: ${product.name} (${product.code})`)) {
            this.deleteProduct(productId);
        }
    }
    
    // 刪除商品
    deleteProduct(productId) {
        try {
            const product = this.system.getProductById(productId);
            const productName = product.name;
            
            // 從系統中移除商品
            this.system.products = this.system.products.filter(p => p.id !== productId);
            
            // 記錄活動
            this.system.recordActivity(
                'product', 
                `刪除商品: ${productName}`,
                productId
            );
            
            showAlert(`商品 ${productName} 已刪除`, 'success');
            this.loadProductData();
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 清除表單
    clearForm() {
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
            form.classList.remove('editing-mode');
            
            // 重置表單標題和按鈕
            const formTitle = form.querySelector('.section-title');
            if (formTitle) {
                formTitle.textContent = '新增商品';
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> 新增商品';
            }
            
            // 清除驗證樣式
            form.querySelectorAll('.is-valid, .is-invalid').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            
            const feedbackDiv = document.getElementById('code-feedback');
            if (feedbackDiv) {
                feedbackDiv.textContent = '';
            }
        }
        
        this.editingProductId = null;
    }
    
    // 清除搜尋
    clearSearch() {
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = '';
        }
        this.searchKeyword = '';
        this.currentPage = 1;
        this.loadProductData();
    }
    
    // 匯出商品列表
    exportProducts() {
        try {
            const products = this.system.products;
            if (products.length === 0) {
                showAlert('無商品資料可匯出', 'warning');
                return;
            }
            
            const csvData = products.map(product => ({
                '商品編號': product.code,
                '商品名稱': product.name,
                '規格': product.spec || '',
                '單位': product.unit,
                '成本價': product.costPrice,
                '售價': product.salePrice,
                '目前庫存': product.currentStock,
                '安全庫存': product.safetyStock,
                '庫存價值': product.getStockValue(),
                '狀態': product.isLowStock() ? '低庫存' : '正常'
            }));
            
            Utils.exportToCSV(csvData, `商品列表_${new Date().toISOString().split('T')[0]}.csv`);
            showAlert('商品列表已匯出', 'success');
            
        } catch (error) {
            showAlert('匯出失敗: ' + error.message, 'error');
        }
    }
}