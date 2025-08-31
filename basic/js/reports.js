// 庫存管理系統 - 報表模組

class ReportsModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
    }
    
    initialize() {
        this.bindEvents();
        this.setDefaultDates();
    }
    
    bindEvents() {
        const inventoryReportBtn = document.getElementById('generate-inventory-report');
        if (inventoryReportBtn) {
            inventoryReportBtn.addEventListener('click', () => this.generateInventoryReport());
        }
        
        const transactionReportBtn = document.getElementById('generate-transaction-report');
        if (transactionReportBtn) {
            transactionReportBtn.addEventListener('click', () => this.generateTransactionReport());
        }
    }
    
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        const startDateInput = document.getElementById('report-start-date');
        const endDateInput = document.getElementById('report-end-date');
        
        if (startDateInput) startDateInput.value = firstDayOfMonth;
        if (endDateInput) endDateInput.value = today;
    }
    
    generateInventoryReport() {
        try {
            const products = this.system.products;
            const totalValue = products.reduce((sum, p) => sum + p.getStockValue(), 0);
            const lowStockCount = products.filter(p => p.isLowStock()).length;
            
            const reportContent = `
                <div class="report-header">
                    <h3>庫存報表</h3>
                    <div class="report-summary">
                        <div class="summary-item">
                            <label>報表產生時間:</label>
                            <span>${new Date().toLocaleString('zh-TW')}</span>
                        </div>
                        <div class="summary-item">
                            <label>商品總數:</label>
                            <span>${products.length} 項</span>
                        </div>
                        <div class="summary-item">
                            <label>庫存總價值:</label>
                            <span>$${totalValue.toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <label>低庫存商品:</label>
                            <span class="text-warning">${lowStockCount} 項</span>
                        </div>
                    </div>
                </div>
                
                <table class="table report-table">
                    <thead>
                        <tr>
                            <th>商品編號</th>
                            <th>商品名稱</th>
                            <th>目前庫存</th>
                            <th>單位</th>
                            <th>成本價</th>
                            <th>庫存價值</th>
                            <th>狀態</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr class="${product.isLowStock() ? 'low-stock-row' : ''}">
                                <td>${product.code}</td>
                                <td>${product.name}</td>
                                <td>${product.currentStock}</td>
                                <td>${product.unit}</td>
                                <td>$${product.costPrice.toFixed(2)}</td>
                                <td>$${product.getStockValue().toLocaleString()}</td>
                                <td>
                                    ${product.isLowStock() ? 
                                        '<span class="status-badge status-warning">低庫存</span>' : 
                                        '<span class="status-badge status-completed">正常</span>'
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.exportInventoryReport()">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                    <button class="btn btn-secondary" onclick="window.print()">
                        <i class="fas fa-print"></i> 列印報表
                    </button>
                </div>
            `;
            
            document.getElementById('report-content').innerHTML = reportContent;
            showAlert('庫存報表產生成功', 'success');
            
        } catch (error) {
            showAlert('產生庫存報表失敗: ' + error.message, 'error');
        }
    }
    
    generateTransactionReport() {
        try {
            const startDate = new Date(document.getElementById('report-start-date').value);
            const endDate = new Date(document.getElementById('report-end-date').value);
            
            if (startDate > endDate) {
                throw new Error('開始日期不能晚於結束日期');
            }
            
            // 過濾期間內的交易
            const purchaseOrders = this.system.purchaseOrders.filter(po => {
                const orderDate = new Date(po.orderDate);
                return orderDate >= startDate && orderDate <= endDate && po.status === 'received';
            });
            
            const salesOrders = this.system.salesOrders.filter(so => {
                const orderDate = new Date(so.orderDate);
                return orderDate >= startDate && orderDate <= endDate;
            });
            
            const inventoryAdjustments = this.system.inventoryAdjustments.filter(adj => {
                const adjDate = new Date(adj.createdAt);
                return adjDate >= startDate && adjDate <= endDate;
            });
            
            // 計算統計數據
            const totalPurchaseAmount = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
            const totalSalesAmount = salesOrders.reduce((sum, so) => sum + so.totalAmount, 0);
            const netProfit = totalSalesAmount - totalPurchaseAmount;
            
            const reportContent = `
                <div class="report-header">
                    <h3>進銷存明細表</h3>
                    <div class="report-period">
                        <span>報表期間: ${Utils.formatDate(startDate)} ~ ${Utils.formatDate(endDate)}</span>
                    </div>
                    <div class="report-summary">
                        <div class="summary-grid">
                            <div class="summary-card">
                                <label>進貨筆數</label>
                                <span class="summary-value">${purchaseOrders.length}</span>
                            </div>
                            <div class="summary-card">
                                <label>進貨金額</label>
                                <span class="summary-value">$${totalPurchaseAmount.toLocaleString()}</span>
                            </div>
                            <div class="summary-card">
                                <label>銷貨筆數</label>
                                <span class="summary-value">${salesOrders.length}</span>
                            </div>
                            <div class="summary-card">
                                <label>銷貨金額</label>
                                <span class="summary-value">$${totalSalesAmount.toLocaleString()}</span>
                            </div>
                            <div class="summary-card">
                                <label>調整次數</label>
                                <span class="summary-value">${inventoryAdjustments.length}</span>
                            </div>
                            <div class="summary-card">
                                <label>淨收益</label>
                                <span class="summary-value ${netProfit >= 0 ? 'text-success' : 'text-danger'}">
                                    $${netProfit.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="report-sections">
                    <div class="report-section">
                        <h4>進貨明細</h4>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>進貨單號</th>
                                    <th>日期</th>
                                    <th>供應商</th>
                                    <th>金額</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${purchaseOrders.length > 0 ? 
                                    purchaseOrders.map(po => {
                                        const supplier = this.system.suppliers.find(s => s.id === po.supplierId);
                                        return `
                                            <tr>
                                                <td>${po.id}</td>
                                                <td>${Utils.formatDate(po.orderDate)}</td>
                                                <td>${supplier ? supplier.name : '未知供應商'}</td>
                                                <td>$${po.totalAmount.toLocaleString()}</td>
                                            </tr>
                                        `;
                                    }).join('') :
                                    '<tr><td colspan="4" class="text-center">此期間內無進貨記錄</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="report-section">
                        <h4>銷貨明細</h4>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>銷貨單號</th>
                                    <th>日期</th>
                                    <th>客戶</th>
                                    <th>金額</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${salesOrders.length > 0 ?
                                    salesOrders.map(so => {
                                        const customer = so.customerId ? this.system.customers.find(c => c.id === so.customerId) : null;
                                        return `
                                            <tr>
                                                <td>${so.id}</td>
                                                <td>${Utils.formatDate(so.orderDate)}</td>
                                                <td>${customer ? customer.name : '散客'}</td>
                                                <td>$${so.totalAmount.toLocaleString()}</td>
                                            </tr>
                                        `;
                                    }).join('') :
                                    '<tr><td colspan="4" class="text-center">此期間內無銷貨記錄</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                    
                    ${inventoryAdjustments.length > 0 ? `
                        <div class="report-section">
                            <h4>庫存調整明細</h4>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>調整單號</th>
                                        <th>日期</th>
                                        <th>商品</th>
                                        <th>類型</th>
                                        <th>數量</th>
                                        <th>原因</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${inventoryAdjustments.map(adj => {
                                        const product = this.system.products.find(p => p.id === adj.productId);
                                        return `
                                            <tr>
                                                <td>${adj.id}</td>
                                                <td>${Utils.formatDate(adj.createdAt)}</td>
                                                <td>${product ? product.name : '未知商品'}</td>
                                                <td>${adj.adjustmentType === 'increase' ? '增加' : adj.adjustmentType === 'decrease' ? '減少' : '設定'}</td>
                                                <td>${adj.quantity}</td>
                                                <td>${adj.reason}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}
                </div>
                
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.exportTransactionReport()">
                        <i class="fas fa-download"></i> 匯出報表
                    </button>
                    <button class="btn btn-secondary" onclick="window.print()">
                        <i class="fas fa-print"></i> 列印報表
                    </button>
                </div>
            `;
            
            document.getElementById('report-content').innerHTML = reportContent;
            showAlert('進銷存明細表產生成功', 'success');
            
        } catch (error) {
            showAlert('產生進銷存報表失敗: ' + error.message, 'error');
        }
    }
    
    exportInventoryReport() {
        const products = this.system.products;
        const reportData = [
            ['商品編號', '商品名稱', '目前庫存', '單位', '成本價', '庫存價值', '狀態'],
            ...products.map(p => [
                p.code, p.name, p.currentStock, p.unit, 
                p.costPrice, p.getStockValue(), p.isLowStock() ? '低庫存' : '正常'
            ])
        ];
        
        this.downloadCSV(reportData, `庫存報表_${new Date().toISOString().split('T')[0]}.csv`);
        showAlert('庫存報表已匯出', 'success');
    }
    
    exportTransactionReport() {
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;
        
        const reportData = [
            ['交易類型', '單號', '日期', '對象', '金額'],
            ...this.system.purchaseOrders
                .filter(po => po.orderDate >= startDate && po.orderDate <= endDate && po.status === 'received')
                .map(po => {
                    const supplier = this.system.suppliers.find(s => s.id === po.supplierId);
                    return ['進貨', po.id, po.orderDate, supplier ? supplier.name : '未知', po.totalAmount];
                }),
            ...this.system.salesOrders
                .filter(so => so.orderDate >= startDate && so.orderDate <= endDate)
                .map(so => {
                    const customer = so.customerId ? this.system.customers.find(c => c.id === so.customerId) : null;
                    return ['銷貨', so.id, so.orderDate, customer ? customer.name : '散客', so.totalAmount];
                })
        ];
        
        this.downloadCSV(reportData, `進銷存明細_${startDate}_${endDate}.csv`);
        showAlert('進銷存報表已匯出', 'success');
    }
    
    downloadCSV(data, filename) {
        const csvContent = data.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}