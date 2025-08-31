// 庫存管理系統 - 儀表板模組

class DashboardModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.refreshInterval = null;
    }
    
    // 初始化儀表板
    initialize() {
        this.loadDashboard();
        this.startAutoRefresh();
        this.bindEvents();
    }
    
    // 載入儀表板數據
    loadDashboard() {
        try {
            const stats = this.system.getStatistics();
            this.updateStatisticCards(stats);
            this.loadRecentActivities();
            this.loadPendingTasks();
        } catch (error) {
            console.error('載入儀表板失敗:', error);
            this.showError('載入儀表板數據失敗');
        }
    }
    
    // 更新統計卡片
    updateStatisticCards(stats) {
        // 商品總數
        this.updateCard('product-count', stats.productCount, '商品總數');
        
        // 進貨單總數
        this.updateCard('purchase-count', stats.purchaseOrderCount, '進貨單總數');
        
        // 銷貨單總數
        this.updateCard('sales-count', stats.salesOrderCount, '銷貨單總數');
        
        // 庫存總價值
        this.updateCard('inventory-value', Utils.formatCurrency(stats.totalInventoryValue), '庫存總價值');
    }
    
    // 更新單一卡片
    updateCard(elementId, value, label) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
        
        // 更新卡片標籤
        const labelElement = document.querySelector(`#${elementId}`);
        if (labelElement && labelElement.nextElementSibling) {
            labelElement.nextElementSibling.textContent = label;
        }
    }
    
    // 載入近期活動
    loadRecentActivities() {
        const activitiesContainer = document.getElementById('recent-activities');
        if (!activitiesContainer) return;
        
        const activities = this.system.activities.slice(0, 10);
        
        if (activities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>目前沒有活動記錄</p>
                </div>
            `;
            return;
        }
        
        const activitiesHtml = activities.map(activity => `
            <div class="activity-item" onclick="dashboard.showActivityDetail('${activity.id}')">
                <div class="activity-icon">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.getTimeAgo()}</div>
                </div>
            </div>
        `).join('');
        
        activitiesContainer.innerHTML = activitiesHtml;
    }
    
    // 載入待處理事項
    loadPendingTasks() {
        const tasksContainer = document.getElementById('pending-tasks');
        if (!tasksContainer) return;
        
        const tasks = this.generatePendingTasks();
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>沒有待處理事項</p>
                </div>
            `;
            return;
        }
        
        const tasksHtml = tasks.map(task => `
            <div class="task-item ${task.priority}" onclick="dashboard.handleTask('${task.id}', '${task.action}')">
                <div class="task-icon">
                    <i class="fas ${task.icon}"></i>
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-count">${task.count}</div>
                </div>
                <div class="task-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `).join('');
        
        tasksContainer.innerHTML = tasksHtml;
    }
    
    // 產生待處理事項
    generatePendingTasks() {
        const tasks = [];
        
        // 低庫存警示
        const lowStockProducts = this.system.getLowStockProducts();
        if (lowStockProducts.length > 0) {
            tasks.push({
                id: 'low-stock',
                title: '低庫存警示',
                count: `${lowStockProducts.length} 個商品`,
                icon: 'fa-exclamation-triangle',
                priority: 'high',
                action: 'showLowStock'
            });
        }
        
        // 待收貨項目
        const pendingPurchases = this.system.purchaseOrders.filter(po => po.status === 'pending');
        if (pendingPurchases.length > 0) {
            tasks.push({
                id: 'pending-purchases',
                title: '待收貨項目',
                count: `${pendingPurchases.length} 張進貨單`,
                icon: 'fa-truck',
                priority: 'medium',
                action: 'showPendingPurchases'
            });
        }
        
        // 庫存異常 (負庫存)
        const negativeStock = this.system.products.filter(p => p.currentStock < 0);
        if (negativeStock.length > 0) {
            tasks.push({
                id: 'negative-stock',
                title: '庫存異常',
                count: `${negativeStock.length} 個商品`,
                icon: 'fa-exclamation-circle',
                priority: 'high',
                action: 'showNegativeStock'
            });
        }
        
        return tasks;
    }
    
    // 獲取活動圖示
    getActivityIcon(type) {
        const icons = {
            'product': 'fa-box',
            'customer': 'fa-user',
            'supplier': 'fa-building',
            'purchase': 'fa-shopping-cart',
            'sales': 'fa-cash-register',
            'inventory': 'fa-warehouse'
        };
        return icons[type] || 'fa-info-circle';
    }
    
    // 處理任務點擊
    handleTask(taskId, action) {
        switch (action) {
            case 'showLowStock':
                this.showLowStockDialog();
                break;
            case 'showPendingPurchases':
                this.showPendingPurchasesDialog();
                break;
            case 'showNegativeStock':
                this.showNegativeStockDialog();
                break;
        }
    }
    
    // 顯示低庫存對話框
    showLowStockDialog() {
        const lowStockProducts = this.system.getLowStockProducts();
        
        const content = `
            <h4>低庫存商品清單</h4>
            <div class="low-stock-list">
                ${lowStockProducts.map(product => `
                    <div class="stock-item">
                        <div class="product-info">
                            <strong>${product.name}</strong> (${product.code})
                            <br>
                            <small>目前庫存: ${product.currentStock} ${product.unit} | 安全庫存: ${product.safetyStock} ${product.unit}</small>
                        </div>
                        <div class="stock-actions">
                            <button class="btn btn-sm btn-primary" onclick="dashboard.quickAdjustStock('${product.id}')">
                                <i class="fas fa-plus"></i> 補貨
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="dialog-actions">
                <button class="btn btn-primary" onclick="app.showSection('inventory')">前往庫存管理</button>
                <button class="btn btn-secondary" onclick="closeModal()">關閉</button>
            </div>
        `;
        
        openModal('低庫存警示', content);
    }
    
    // 顯示待收貨對話框
    showPendingPurchasesDialog() {
        const pendingPurchases = this.system.purchaseOrders.filter(po => po.status === 'pending');
        
        const content = `
            <h4>待收貨進貨單</h4>
            <div class="pending-list">
                ${pendingPurchases.map(po => {
                    const supplier = this.system.suppliers.find(s => s.id === po.supplierId);
                    return `
                        <div class="order-item">
                            <div class="order-info">
                                <strong>${po.id}</strong>
                                <br>
                                供應商: ${supplier ? supplier.name : '未知'}
                                <br>
                                金額: $${po.totalAmount.toLocaleString()}
                                <br>
                                下單日期: ${Utils.formatDate(po.orderDate)}
                            </div>
                            <div class="order-actions">
                                <button class="btn btn-sm btn-success" onclick="dashboard.quickReceive('${po.id}')">
                                    <i class="fas fa-check"></i> 收貨
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="dialog-actions">
                <button class="btn btn-primary" onclick="app.showSection('purchase')">前往進貨管理</button>
                <button class="btn btn-secondary" onclick="closeModal()">關閉</button>
            </div>
        `;
        
        openModal('待收貨項目', content);
    }
    
    // 快速收貨
    quickReceive(purchaseOrderId) {
        try {
            this.system.receivePurchaseOrder(purchaseOrderId);
            showAlert('收貨完成！', 'success');
            this.loadDashboard();
            closeModal();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    // 快速調整庫存
    quickAdjustStock(productId) {
        const product = this.system.products.find(p => p.id === productId);
        if (!product) return;
        
        const quantity = prompt(`請輸入要補充的數量 (${product.unit}):`);
        if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
            try {
                this.system.adjustInventory(productId, 'increase', parseInt(quantity), '低庫存補貨');
                showAlert(`已為 ${product.name} 補充 ${quantity} ${product.unit}`, 'success');
                this.loadDashboard();
                closeModal();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    }
    
    // 顯示活動詳情
    showActivityDetail(activityId) {
        const activity = this.system.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        const content = `
            <h4>活動詳情</h4>
            <div class="activity-detail">
                <div class="detail-row">
                    <label>類型:</label>
                    <span>${this.getActivityTypeName(activity.type)}</span>
                </div>
                <div class="detail-row">
                    <label>描述:</label>
                    <span>${activity.description}</span>
                </div>
                <div class="detail-row">
                    <label>時間:</label>
                    <span>${activity.timestamp.toLocaleString('zh-TW')}</span>
                </div>
                ${activity.relatedId ? `
                    <div class="detail-row">
                        <label>相關ID:</label>
                        <span>${activity.relatedId}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        openModal('活動詳情', content);
    }
    
    // 獲取活動類型名稱
    getActivityTypeName(type) {
        const typeNames = {
            'product': '商品管理',
            'customer': '客戶管理',
            'supplier': '供應商管理',
            'purchase': '進貨管理',
            'sales': '銷貨管理',
            'inventory': '庫存管理'
        };
        return typeNames[type] || type;
    }
    
    // 開始自動重新整理
    startAutoRefresh() {
        // 每30秒重新整理一次
        this.refreshInterval = setInterval(() => {
            this.loadDashboard();
        }, 30000);
    }
    
    // 停止自動重新整理
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    // 綁定事件
    bindEvents() {
        // 手動重新整理按鈕
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboard();
                showAlert('儀表板已更新', 'success');
            });
        }
        
        // 卡片點擊事件
        this.bindCardEvents();
    }
    
    // 綁定卡片點擊事件
    bindCardEvents() {
        const cards = document.querySelectorAll('.dashboard-card');
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const sections = ['products', 'purchase', 'sales', 'inventory'];
                if (sections[index] && typeof app !== 'undefined') {
                    app.showSection(sections[index]);
                }
            });
        });
    }
    
    // 顯示錯誤
    showError(message) {
        const errorContainer = document.getElementById('dashboard-error');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-circle"></i>
                    ${message}
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    }
    
    // 清除錯誤
    clearError() {
        const errorContainer = document.getElementById('dashboard-error');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    }
    
    // 匯出統計數據
    exportStatistics() {
        const stats = this.system.getStatistics();
        const data = {
            exportDate: new Date().toLocaleString('zh-TW'),
            statistics: stats,
            lowStockProducts: this.system.getLowStockProducts(),
            recentActivities: this.system.activities.slice(0, 20)
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `庫存統計_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showAlert('統計數據已匯出', 'success');
    }
    
    // 銷毀模組
    destroy() {
        this.stopAutoRefresh();
    }
}