// 庫存管理系統 - 進貨管理模組

class PurchaseModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.purchaseItems = [{ productId: '', quantity: '', unitPrice: '' }];
    }
    
    initialize() {
        this.bindEvents();
        this.loadSupplierOptions();
        this.loadProductOptions();
        this.loadPurchaseOrders();
        this.renderPurchaseItems();
    }
    
    bindEvents() {
        const purchaseForm = document.getElementById('purchase-form');
        if (purchaseForm) {
            purchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }
    
    handleFormSubmit() {
        try {
            const supplierId = document.getElementById('purchase-supplier').value;
            const orderDate = document.getElementById('purchase-date').value;
            
            if (!supplierId) throw new Error('請選擇供應商');
            if (!orderDate) throw new Error('請選擇進貨日期');
            
            const validItems = this.purchaseItems.filter(item => 
                item.productId && item.quantity > 0 && item.unitPrice > 0
            );
            
            if (validItems.length === 0) throw new Error('請至少新增一個有效的進貨項目');
            
            this.system.createPurchaseOrder(supplierId, orderDate, validItems);
            showAlert('進貨單建立成功！', 'success');
            
            this.clearForm();
            this.loadPurchaseOrders();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    addPurchaseItem() {
        this.purchaseItems.push({ productId: '', quantity: '', unitPrice: '' });
        this.renderPurchaseItems();
    }
    
    removePurchaseItem(index) {
        if (this.purchaseItems.length > 1) {
            this.purchaseItems.splice(index, 1);
            this.renderPurchaseItems();
        }
    }
    
    renderPurchaseItems() {
        const container = document.getElementById('purchase-items');
        if (!container) return;
        
        const itemsHtml = this.purchaseItems.map((item, index) => `
            <div class="purchase-item">
                <div class="form-row">
                    <div class="form-group">
                        <select class="form-input" onchange="purchaseModule.updateItem(${index}, 'productId', this.value)">
                            <option value="">請選擇商品</option>
                            ${this.system.products.map(p => 
                                `<option value="${p.id}" ${item.productId === p.id ? 'selected' : ''}>
                                    ${p.code} - ${p.name}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-input" placeholder="數量" min="1" 
                               value="${item.quantity}" 
                               onchange="purchaseModule.updateItem(${index}, 'quantity', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <input type="number" class="form-input" placeholder="單價" min="0" step="0.01" 
                               value="${item.unitPrice}" 
                               onchange="purchaseModule.updateItem(${index}, 'unitPrice', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        ${this.purchaseItems.length > 1 ? 
                            `<button type="button" class="btn btn-danger" onclick="purchaseModule.removePurchaseItem(${index})">移除</button>` : 
                            ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = itemsHtml;
    }
    
    updateItem(index, field, value) {
        this.purchaseItems[index][field] = value;
    }
    
    loadSupplierOptions() {
        const select = document.getElementById('purchase-supplier');
        if (!select) return;
        
        select.innerHTML = '<option value="">請選擇供應商</option>' +
            this.system.suppliers.map(supplier => 
                `<option value="${supplier.id}">${supplier.name}</option>`
            ).join('');
    }
    
    loadProductOptions() {
        // 在 renderPurchaseItems 中處理
    }
    
    loadPurchaseOrders() {
        const tbody = document.getElementById('purchase-orders-table');
        if (!tbody) return;
        
        const orders = this.system.purchaseOrders;
        tbody.innerHTML = orders.map(order => {
            const supplier = this.system.suppliers.find(s => s.id === order.supplierId);
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${supplier ? supplier.name : '未知供應商'}</td>
                    <td>${Utils.formatDate(order.orderDate)}</td>
                    <td>$${order.totalAmount.toLocaleString()}</td>
                    <td>
                        <span class="status-badge ${Utils.getStatusClass(order.status)}">
                            ${Utils.getStatusText(order.status, 'purchase')}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="purchaseModule.viewOrder('${order.id}')">檢視</button>
                        ${order.status === 'pending' ? 
                            `<button class="btn btn-sm btn-success" onclick="purchaseModule.receiveOrder('${order.id}')">收貨</button>` : 
                            ''
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    viewOrder(orderId) {
        const order = this.system.purchaseOrders.find(o => o.id === orderId);
        if (!order) return;
        
        const supplier = this.system.suppliers.find(s => s.id === order.supplierId);
        
        const content = `
            <h4>進貨單 ${order.id}</h4>
            <div class="order-info">
                <p><strong>供應商:</strong> ${supplier ? supplier.name : '未知'}</p>
                <p><strong>下單日期:</strong> ${Utils.formatDate(order.orderDate)}</p>
                <p><strong>狀態:</strong> ${Utils.getStatusText(order.status, 'purchase')}</p>
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
        
        openModal('進貨單詳情', content);
    }
    
    receiveOrder(orderId) {
        if (confirm('確定要執行收貨作業嗎？這將會更新商品庫存。')) {
            try {
                this.system.receivePurchaseOrder(orderId);
                showAlert('收貨完成！庫存已更新。', 'success');
                this.loadPurchaseOrders();
            } catch (error) {
                showAlert(error.message, 'error');
            }
        }
    }
    
    clearForm() {
        document.getElementById('purchase-form').reset();
        this.purchaseItems = [{ productId: '', quantity: '', unitPrice: '' }];
        this.renderPurchaseItems();
        document.getElementById('purchase-date').value = new Date().toISOString().split('T')[0];
    }
}