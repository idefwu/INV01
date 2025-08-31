// 庫存管理系統 - 銷貨管理模組

class SalesModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.salesItems = [{ productId: '', quantity: '', unitPrice: '' }];
    }
    
    initialize() {
        this.bindEvents();
        this.loadCustomerOptions();
        this.loadSalesOrders();
        this.renderSalesItems();
    }
    
    bindEvents() {
        const salesForm = document.getElementById('sales-form');
        if (salesForm) {
            salesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }
    
    handleFormSubmit() {
        try {
            const customerId = document.getElementById('sales-customer').value || null;
            const orderDate = document.getElementById('sales-date').value;
            
            if (!orderDate) throw new Error('請選擇銷貨日期');
            
            const validItems = this.salesItems.filter(item => 
                item.productId && item.quantity > 0 && item.unitPrice > 0
            );
            
            if (validItems.length === 0) throw new Error('請至少新增一個有效的銷貨項目');
            
            this.system.createSalesOrder(customerId, orderDate, validItems);
            showAlert('銷貨單建立成功！庫存已自動扣減。', 'success');
            
            this.clearForm();
            this.loadSalesOrders();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    addSalesItem() {
        this.salesItems.push({ productId: '', quantity: '', unitPrice: '' });
        this.renderSalesItems();
    }
    
    removeSalesItem(index) {
        if (this.salesItems.length > 1) {
            this.salesItems.splice(index, 1);
            this.renderSalesItems();
        }
    }
    
    renderSalesItems() {
        const container = document.getElementById('sales-items');
        if (!container) return;
        
        const itemsHtml = this.salesItems.map((item, index) => `
            <div class="sales-item">
                <div class="form-row">
                    <div class="form-group">
                        <select class="form-input" onchange="salesModule.updateItem(${index}, 'productId', this.value); salesModule.updatePriceFromProduct(${index});">
                            <option value="">請選擇商品</option>
                            ${this.system.products.filter(p => p.currentStock > 0).map(p => 
                                `<option value="${p.id}" ${item.productId === p.id ? 'selected' : ''}>
                                    ${p.code} - ${p.name} (庫存: ${p.currentStock})
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-input" placeholder="數量" min="1" 
                               value="${item.quantity}" 
                               onchange="salesModule.updateItem(${index}, 'quantity', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-input" placeholder="單價" min="0" step="0.01" 
                               value="${item.unitPrice}" 
                               onchange="salesModule.updateItem(${index}, 'unitPrice', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        ${this.salesItems.length > 1 ? 
                            `<button type="button" class="btn btn-danger" onclick="salesModule.removeSalesItem(${index})">移除</button>` : 
                            ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = itemsHtml;
    }
    
    updateItem(index, field, value) {
        this.salesItems[index][field] = value;
    }
    
    updatePriceFromProduct(index) {
        const productId = this.salesItems[index].productId;
        const product = this.system.products.find(p => p.id === productId);
        if (product) {
            this.salesItems[index].unitPrice = product.salePrice;
            this.renderSalesItems();
        }
    }
    
    loadCustomerOptions() {
        const select = document.getElementById('sales-customer');
        if (!select) return;
        
        select.innerHTML = '<option value="">散客</option>' +
            this.system.customers.map(customer => 
                `<option value="${customer.id}">${customer.name}</option>`
            ).join('');
    }
    
    loadSalesOrders() {
        const tbody = document.getElementById('sales-orders-table');
        if (!tbody) return;
        
        const orders = this.system.salesOrders;
        tbody.innerHTML = orders.map(order => {
            const customer = order.customerId ? this.system.customers.find(c => c.id === order.customerId) : null;
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${customer ? customer.name : '散客'}</td>
                    <td>${Utils.formatDate(order.orderDate)}</td>
                    <td>$${order.totalAmount.toLocaleString()}</td>
                    <td>
                        <span class="status-badge ${Utils.getStatusClass(order.status)}">
                            ${Utils.getStatusText(order.status, 'sales')}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="salesModule.viewOrder('${order.id}')">檢視</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    viewOrder(orderId) {
        const order = this.system.salesOrders.find(o => o.id === orderId);
        if (!order) return;
        
        const customer = order.customerId ? this.system.customers.find(c => c.id === order.customerId) : null;
        
        const content = `
            <h4>銷貨單 ${order.id}</h4>
            <div class="order-info">
                <p><strong>客戶:</strong> ${customer ? customer.name : '散客'}</p>
                <p><strong>銷貨日期:</strong> ${Utils.formatDate(order.orderDate)}</p>
                <p><strong>狀態:</strong> ${Utils.getStatusText(order.status, 'sales')}</p>
                <p><strong>總金額:</strong> $${order.totalAmount.toLocaleString()}</p>
            </div>
            <h5>項目明細</h5>
            <table class="table">
                <thead>
                    <tr><th>商品</th><th>數量</th><th>單價</th><th>小計</th></tr>
                </thead>
                <tbody>
                    ${order.items.map(item => {
                        const product = this.system.products.find(p => p.id === item.productId);
                        return `
                            <tr>
                                <td>${product ? product.name : '未知商品'}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.unitPrice.toFixed(2)}</td>
                                <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        openModal('銷貨單詳情', content);
    }
    
    clearForm() {
        document.getElementById('sales-form').reset();
        this.salesItems = [{ productId: '', quantity: '', unitPrice: '' }];
        this.renderSalesItems();
        document.getElementById('sales-date').value = new Date().toISOString().split('T')[0];
    }
}