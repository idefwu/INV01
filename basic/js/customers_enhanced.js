// 庫存管理系統 - 增強版客戶管理模組

class CustomersModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.editingCustomerId = null;
        this.searchKeyword = '';
        this.sortField = 'name';
        this.sortDirection = 'asc';
    }
    
    // 初始化客戶管理模組
    initialize() {
        this.bindEvents();
        this.loadCustomers();
    }
    
    // 綁定事件
    bindEvents() {
        // 表單提交事件
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
        
        // 搜尋事件
        const searchInput = document.getElementById('customer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchKeyword = e.target.value;
                this.loadCustomers();
            });
        }
        
        // 表單驗證事件
        this.bindValidationEvents();
    }
    
    // 綁定驗證事件
    bindValidationEvents() {
        // Email 格式驗證
        const emailInput = document.getElementById('customer-email');
        if (emailInput) {
            emailInput.addEventListener('blur', (e) => {
                this.validateEmail(e.target.value, e.target);
            });
        }
        
        // 電話格式驗證
        const phoneInput = document.getElementById('customer-phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', (e) => {
                this.validatePhone(e.target.value, e.target);
            });
        }
    }
    
    // 驗證Email格式
    validateEmail(email, inputElement) {
        if (!email) return true; // 非必填，空值視為有效
        
        if (Utils.validateEmail(email)) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        } else {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
            return false;
        }
    }
    
    // 驗證電話格式
    validatePhone(phone, inputElement) {
        if (!phone) return true; // 非必填，空值視為有效
        
        if (Utils.validatePhone(phone)) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            return true;
        } else {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
            return false;
        }
    }
    
    // 處理表單提交
    handleFormSubmit() {
        try {
            const formData = this.getFormData();
            
            if (this.editingCustomerId) {
                // 更新客戶
                this.updateCustomer(formData);
            } else {
                // 新增客戶
                this.addCustomer(formData);
            }
            
            this.clearForm();
            this.loadCustomers();
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 新增客戶
    addCustomer(formData) {
        const customer = this.system.addCustomer(
            formData.name,
            formData.phone,
            formData.email,
            formData.address
        );
        
        showAlert(`客戶 ${customer.name} 新增成功！`, 'success');
        
        // 記錄活動
        this.system.recordActivity(
            'customer',
            `新增客戶: ${customer.name}`,
            customer.id
        );
    }
    
    // 更新客戶
    updateCustomer(formData) {
        const customer = this.system.customers.find(c => c.id === this.editingCustomerId);
        if (!customer) throw new Error('客戶不存在');
        
        const oldName = customer.name;
        
        // 更新客戶資訊
        Object.assign(customer, formData);
        
        showAlert(`客戶 ${customer.name} 更新成功！`, 'success');
        
        // 記錄活動
        this.system.recordActivity(
            'customer',
            `更新客戶: ${oldName} → ${customer.name}`,
            customer.id
        );
        
        this.editingCustomerId = null;
    }
    
    // 獲取表單數據
    getFormData() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const address = document.getElementById('customer-address').value.trim();
        
        // 驗證必填欄位
        this.validateFormData({ name, phone, email });
        
        return { name, phone, email, address };
    }
    
    // 驗證表單數據
    validateFormData(data) {
        if (!data.name) throw new Error('客戶姓名為必填欄位');
        
        // 檢查客戶名稱重複
        const existing = this.system.customers.find(c => 
            c.name === data.name && c.id !== this.editingCustomerId
        );
        if (existing) throw new Error('客戶姓名已存在');
        
        // 驗證Email格式（如果有輸入）
        if (data.email && !Utils.validateEmail(data.email)) {
            throw new Error('電子郵件格式不正確');
        }
        
        // 驗證電話格式（如果有輸入）
        if (data.phone && !Utils.validatePhone(data.phone)) {
            throw new Error('電話號碼格式不正確');
        }
    }
    
    // 載入客戶列表
    loadCustomers() {
        try {
            let customers = [...this.system.customers];
            
            // 搜尋篩選
            if (this.searchKeyword) {
                customers = this.filterCustomers(customers, this.searchKeyword);
            }
            
            // 排序
            customers = this.sortCustomers(customers);
            
            this.renderCustomerTable(customers);
            this.updateCustomerStats(this.system.customers);
            
        } catch (error) {
            console.error('載入客戶列表失敗:', error);
            showAlert('載入客戶列表失敗', 'error');
        }
    }
    
    // 篩選客戶
    filterCustomers(customers, keyword) {
        const searchTerm = keyword.toLowerCase();
        return customers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) ||
            (customer.phone && customer.phone.toLowerCase().includes(searchTerm)) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
            (customer.address && customer.address.toLowerCase().includes(searchTerm))
        );
    }
    
    // 排序客戶
    sortCustomers(customers) {
        return customers.sort((a, b) => {
            let aValue = a[this.sortField] || '';
            let bValue = b[this.sortField] || '';
            
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
    
    // 渲染客戶表格
    renderCustomerTable(customers) {
        const tbody = document.getElementById('customers-table');
        if (!tbody) return;
        
        if (customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-user-plus"></i>
                            <p>沒有找到符合條件的客戶</p>
                            ${this.searchKeyword ? 
                                `<button class="btn btn-secondary" onclick="customersModule.clearSearch()">清除搜尋</button>` : 
                                `<button class="btn btn-primary" onclick="showSection('customers')">新增客戶</button>`
                            }
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        const tableHtml = customers.map(customer => {
            const salesStats = this.getCustomerSalesStats(customer.id);
            
            return `
                <tr data-customer-id="${customer.id}">
                    <td>
                        <div class="customer-info">
                            <strong>${customer.name}</strong>
                            ${salesStats.totalOrders > 0 ? 
                                `<br><small class="text-muted">交易 ${salesStats.totalOrders} 次</small>` : 
                                '<br><small class="text-muted text-warning">尚未交易</small>'
                            }
                        </div>
                    </td>
                    <td>${customer.phone || '-'}</td>
                    <td>${customer.email || '-'}</td>
                    <td>
                        <div class="address-cell">
                            ${customer.address ? 
                                (customer.address.length > 20 ? 
                                    customer.address.substring(0, 20) + '...' : 
                                    customer.address
                                ) : '-'
                            }
                        </div>
                    </td>
                    <td>
                        <div class="sales-stats">
                            <div class="stat-value">${Utils.formatCurrency(salesStats.totalAmount)}</div>
                            <small class="text-muted">${salesStats.totalOrders} 筆訂單</small>
                        </div>
                    </td>
                    <td>
                        <div class="btn-group-sm">
                            <button class="btn btn-sm btn-info" onclick="customersModule.showCustomerDetail('${customer.id}')" title="客戶詳情">
                                <i class="fas fa-info-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="customersModule.editCustomer('${customer.id}')" title="編輯客戶">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-success" onclick="customersModule.createSalesOrder('${customer.id}')" title="建立訂單">
                                <i class="fas fa-plus-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="customersModule.confirmDeleteCustomer('${customer.id}')" title="刪除客戶">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = tableHtml;
    }
    
    // 獲取客戶銷售統計
    getCustomerSalesStats(customerId) {
        const customerOrders = this.system.salesOrders.filter(order => order.customerId === customerId);
        
        return {
            totalOrders: customerOrders.length,
            totalAmount: customerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            lastOrderDate: customerOrders.length > 0 ? 
                Math.max(...customerOrders.map(order => new Date(order.orderDate).getTime())) : null
        };
    }
    
    // 更新客戶統計
    updateCustomerStats(customers) {
        const statsContainer = document.getElementById('customer-stats');
        if (!statsContainer) return;
        
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter(c => {
            const stats = this.getCustomerSalesStats(c.id);
            return stats.totalOrders > 0;
        }).length;
        
        const totalSalesAmount = customers.reduce((sum, customer) => {
            const stats = this.getCustomerSalesStats(customer.id);
            return sum + stats.totalAmount;
        }, 0);
        
        const avgOrderValue = activeCustomers > 0 ? totalSalesAmount / activeCustomers : 0;
        
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${totalCustomers}</div>
                    <div class="stat-label">總客戶數</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value text-success">${activeCustomers}</div>
                    <div class="stat-label">活躍客戶</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Utils.formatCurrency(totalSalesAmount)}</div>
                    <div class="stat-label">總銷售額</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Utils.formatCurrency(avgOrderValue)}</div>
                    <div class="stat-label">平均客單價</div>
                </div>
            </div>
        `;
    }
    
    // 顯示客戶詳情
    showCustomerDetail(customerId) {
        const customer = this.system.customers.find(c => c.id === customerId);
        if (!customer) {
            showAlert('客戶不存在', 'error');
            return;
        }
        
        const salesStats = this.getCustomerSalesStats(customerId);
        const customerOrders = this.system.salesOrders
            .filter(order => order.customerId === customerId)
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 10);
        
        const content = `
            <div class="customer-detail">
                <div class="detail-header">
                    <h4>${customer.name}</h4>
                    <span class="badge ${salesStats.totalOrders > 0 ? 'bg-success' : 'bg-secondary'}">
                        ${salesStats.totalOrders > 0 ? '活躍客戶' : '新客戶'}
                    </span>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-section">
                        <h5>基本資訊</h5>
                        <div class="detail-row">
                            <label>客戶姓名:</label>
                            <span>${customer.name}</span>
                        </div>
                        <div class="detail-row">
                            <label>聯絡電話:</label>
                            <span>${customer.phone || '-'}</span>
                        </div>
                        <div class="detail-row">
                            <label>電子郵件:</label>
                            <span>${customer.email || '-'}</span>
                        </div>
                        <div class="detail-row">
                            <label>地址:</label>
                            <span>${customer.address || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>交易統計</h5>
                        <div class="detail-row">
                            <label>總訂單數:</label>
                            <span>${salesStats.totalOrders} 筆</span>
                        </div>
                        <div class="detail-row">
                            <label>總消費金額:</label>
                            <span>${Utils.formatCurrency(salesStats.totalAmount)}</span>
                        </div>
                        <div class="detail-row">
                            <label>平均訂單金額:</label>
                            <span>${salesStats.totalOrders > 0 ? Utils.formatCurrency(salesStats.totalAmount / salesStats.totalOrders) : '-'}</span>
                        </div>
                        <div class="detail-row">
                            <label>最後交易日期:</label>
                            <span>${salesStats.lastOrderDate ? Utils.formatDate(new Date(salesStats.lastOrderDate)) : '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="transaction-history">
                    <h5>最近交易記錄</h5>
                    ${customerOrders.length > 0 ? `
                        <div class="orders-list">
                            ${customerOrders.map(order => `
                                <div class="order-item">
                                    <div class="order-header">
                                        <span class="order-id">${order.id}</span>
                                        <span class="order-date">${Utils.formatDate(order.orderDate)}</span>
                                        <span class="order-amount">${Utils.formatCurrency(order.totalAmount)}</span>
                                    </div>
                                    <div class="order-items">
                                        ${order.items.map(item => {
                                            const product = this.system.products.find(p => p.id === item.productId);
                                            return `
                                                <span class="order-product">
                                                    ${product ? product.name : '未知商品'} × ${item.quantity}
                                                </span>
                                            `;
                                        }).join(', ')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="text-muted">暫無交易記錄</p>'}
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-success" onclick="customersModule.createSalesOrder('${customer.id}')">
                        <i class="fas fa-plus-circle"></i> 建立訂單
                    </button>
                    <button class="btn btn-primary" onclick="customersModule.editCustomer('${customer.id}')">
                        <i class="fas fa-edit"></i> 編輯客戶
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i> 關閉
                    </button>
                </div>
            </div>
        `;
        
        openModal(`客戶詳情 - ${customer.name}`, content);
    }
    
    // 編輯客戶
    editCustomer(customerId) {
        const customer = this.system.customers.find(c => c.id === customerId);
        if (!customer) {
            showAlert('客戶不存在', 'error');
            return;
        }
        
        this.editingCustomerId = customerId;
        this.fillForm(customer);
        
        // 捲動到表單並高亮
        const form = document.getElementById('customer-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            form.classList.add('editing-mode');
            
            // 更新表單標題
            const formTitle = form.querySelector('.section-title');
            if (formTitle) {
                formTitle.textContent = '編輯客戶';
            }
            
            // 更新提交按鈕文字
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> 更新客戶';
            }
        }
        
        showAlert(`正在編輯客戶: ${customer.name}`, 'info');
    }
    
    // 填充表單
    fillForm(customer) {
        const fields = {
            'customer-name': customer.name,
            'customer-phone': customer.phone || '',
            'customer-email': customer.email || '',
            'customer-address': customer.address || ''
        };
        
        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
    }
    
    // 建立銷貨單
    createSalesOrder(customerId) {
        const customer = this.system.customers.find(c => c.id === customerId);
        if (!customer) {
            showAlert('客戶不存在', 'error');
            return;
        }
        
        // 關閉詳情對話框
        closeModal();
        
        // 切換到銷貨管理頁面
        if (typeof showSection === 'function') {
            showSection('sales');
        }
        
        // 預選客戶
        setTimeout(() => {
            const customerSelect = document.getElementById('sales-customer');
            if (customerSelect) {
                customerSelect.value = customerId;
            }
        }, 100);
        
        showAlert(`已切換到銷貨管理，客戶 ${customer.name} 已預選`, 'info');
    }
    
    // 確認刪除客戶
    confirmDeleteCustomer(customerId) {
        const customer = this.system.customers.find(c => c.id === customerId);
        if (!customer) {
            showAlert('客戶不存在', 'error');
            return;
        }
        
        // 檢查是否有相關交易記錄
        const hasOrders = this.system.salesOrders.some(order => order.customerId === customerId);
        
        const warningMessage = hasOrders ? 
            '⚠️ 此客戶有交易記錄，刪除後將無法復原！' : 
            '確定要刪除此客戶嗎？此操作無法復原！';
        
        if (confirm(`${warningMessage}\n\n客戶: ${customer.name}`)) {
            this.deleteCustomer(customerId);
        }
    }
    
    // 刪除客戶
    deleteCustomer(customerId) {
        try {
            const customer = this.system.customers.find(c => c.id === customerId);
            const customerName = customer.name;
            
            // 從系統中移除客戶
            this.system.customers = this.system.customers.filter(c => c.id !== customerId);
            
            // 記錄活動
            this.system.recordActivity(
                'customer',
                `刪除客戶: ${customerName}`,
                customerId
            );
            
            showAlert(`客戶 ${customerName} 已刪除`, 'success');
            this.loadCustomers();
            
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 清除表單
    clearForm() {
        const form = document.getElementById('customer-form');
        if (form) {
            form.reset();
            form.classList.remove('editing-mode');
            
            // 重置表單標題和按鈕
            const formTitle = form.querySelector('.section-title');
            if (formTitle) {
                formTitle.textContent = '新增客戶';
            }
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> 新增客戶';
            }
            
            // 清除驗證樣式
            form.querySelectorAll('.is-valid, .is-invalid').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        }
        
        this.editingCustomerId = null;
    }
    
    // 清除搜尋
    clearSearch() {
        const searchInput = document.getElementById('customer-search');
        if (searchInput) {
            searchInput.value = '';
        }
        this.searchKeyword = '';
        this.loadCustomers();
    }
    
    // 匯出客戶列表
    exportCustomers() {
        try {
            const customers = this.system.customers;
            if (customers.length === 0) {
                showAlert('無客戶資料可匯出', 'warning');
                return;
            }
            
            const csvData = customers.map(customer => {
                const salesStats = this.getCustomerSalesStats(customer.id);
                return {
                    '客戶姓名': customer.name,
                    '聯絡電話': customer.phone || '',
                    '電子郵件': customer.email || '',
                    '地址': customer.address || '',
                    '總訂單數': salesStats.totalOrders,
                    '總消費金額': salesStats.totalAmount,
                    '最後交易日期': salesStats.lastOrderDate ? Utils.formatDate(new Date(salesStats.lastOrderDate)) : ''
                };
            });
            
            Utils.exportToCSV(csvData, `客戶列表_${new Date().toISOString().split('T')[0]}.csv`);
            showAlert('客戶列表已匯出', 'success');
            
        } catch (error) {
            showAlert('匯出失敗: ' + error.message, 'error');
        }
    }
}