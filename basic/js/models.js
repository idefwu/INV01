// 庫存管理系統 - 核心資料模型

class InventorySystem {
    constructor() {
        // 基本資料
        this.products = [];
        this.customers = [];
        this.suppliers = [];
        
        // 交易資料
        this.purchaseOrders = [];
        this.salesOrders = [];
        this.inventoryAdjustments = [];
        this.activities = [];
        
        // ID 計數器
        this.nextProductId = 1;
        this.nextCustomerId = 1;
        this.nextSupplierId = 1;
        this.nextPurchaseOrderId = 1;
        this.nextSalesOrderId = 1;
        this.nextAdjustmentId = 1;
        this.nextActivityId = 1;
        
        // 初始化範例數據
        this.initializeSampleData();
    }
    
    // 生成唯一ID
    generateId(type) {
        const ids = {
            product: () => `P${String(this.nextProductId++).padStart(4, '0')}`,
            customer: () => `C${String(this.nextCustomerId++).padStart(4, '0')}`,
            supplier: () => `S${String(this.nextSupplierId++).padStart(4, '0')}`,
            purchase: () => `PO${new Date().getFullYear()}${String(this.nextPurchaseOrderId++).padStart(3, '0')}`,
            sales: () => `SO${new Date().getFullYear()}${String(this.nextSalesOrderId++).padStart(3, '0')}`,
            adjustment: () => `ADJ${String(this.nextAdjustmentId++).padStart(4, '0')}`,
            activity: () => `ACT${String(this.nextActivityId++).padStart(4, '0')}`
        };
        return ids[type] ? ids[type]() : null;
    }
    
    // 記錄活動
    recordActivity(type, description, relatedId = null) {
        const activity = new Activity(
            this.generateId('activity'),
            type,
            description,
            relatedId,
            new Date()
        );
        this.activities.unshift(activity);
        
        // 保留最新50筆活動
        if (this.activities.length > 50) {
            this.activities = this.activities.slice(0, 50);
        }
        
        return activity;
    }
    
    // 初始化範例數據
    initializeSampleData() {
        // 新增範例供應商
        this.addSupplier('優質材料有限公司', '王經理', '02-1234-5678', 'wang@supplier1.com', '台北市信義區信義路1號');
        this.addSupplier('精品工具股份有限公司', '李主任', '04-2345-6789', 'li@supplier2.com', '台中市西屯區台灣大道100號');
        
        // 新增範例客戶
        this.addCustomer('ABC建設公司', '張經理', '02-9876-5432', 'zhang@abc.com', '台北市大安區敦化南路2段1號');
        this.addCustomer('XYZ工程行', '陳老闆', '07-3456-7890', 'chen@xyz.com', '高雄市前鎮區成功二路3號');
        
        // 新增範例商品 (包含ROP設定)
        this.addProduct('A001', '螺絲釘', '直徑5mm, 長度20mm', '個', 2.5, 1.8, 100, 40, 100);
        this.addProduct('A002', '鐵釘', '長度50mm', '支', 1.5, 1.0, 200, 30, 80);
        this.addProduct('B001', '電鑽', '18V無線電鑽', '台', 2500, 1800, 5, 50, 200);
        
        // 設定初始庫存 (模擬ROP觸發情況)
        this.products[0].currentStock = 50;  // 螺絲釘：50 > 40 (ROP) 不需補貨
        this.products[1].currentStock = 20;  // 鐵釘：20 ≤ 30 (ROP) 需要補貨
        this.products[2].currentStock = 12;  // 電鑽：12 ≤ 50 (ROP) 需要補貨
    }
    
    // 獲取統計數據
    getStatistics() {
        const totalInventoryValue = this.products.reduce((sum, product) => 
            sum + (product.currentStock * product.costPrice), 0);
            
        const lowStockCount = this.products.filter(p => 
            p.currentStock <= p.safetyStock).length;
        
        return {
            productCount: this.products.length,
            purchaseOrderCount: this.purchaseOrders.length,
            salesOrderCount: this.salesOrders.length,
            totalInventoryValue: totalInventoryValue,
            lowStockCount: lowStockCount,
            pendingPurchases: this.purchaseOrders.filter(po => po.status === 'pending').length,
            recentActivities: this.activities.slice(0, 5)
        };
    }
    
    // 商品管理方法
    addProduct(code, name, spec, unit, salePrice, costPrice, safetyStock, reorderPoint = 0, reorderQuantity = 0) {
        const product = new Product(
            this.generateId('product'),
            code, name, spec, unit, salePrice, costPrice, safetyStock, reorderPoint, reorderQuantity
        );
        this.products.push(product);
        this.recordActivity('product', `新增商品: ${name} (${code})`);
        return product;
    }
    
    updateProduct(id, updates) {
        const product = this.products.find(p => p.id === id);
        if (!product) throw new Error(`商品 ID ${id} 不存在`);
        
        Object.assign(product, updates);
        product.updatedAt = new Date();
        this.recordActivity('product', `更新商品: ${product.name}`);
        return product;
    }
    
    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`商品 ID ${id} 不存在`);
        
        const product = this.products.splice(index, 1)[0];
        this.recordActivity('product', `刪除商品: ${product.name}`);
        return product;
    }
    
    // 客戶管理方法
    addCustomer(name, contact, phone, email, address) {
        const customer = new Customer(
            this.generateId('customer'),
            name, contact, phone, email, address
        );
        this.customers.push(customer);
        this.recordActivity('customer', `新增客戶: ${name}`);
        return customer;
    }
    
    // 供應商管理方法
    addSupplier(name, contact, phone, email, address) {
        const supplier = new Supplier(
            this.generateId('supplier'),
            name, contact, phone, email, address
        );
        this.suppliers.push(supplier);
        this.recordActivity('supplier', `新增供應商: ${name}`);
        return supplier;
    }
    
    // 進貨管理方法
    createPurchaseOrder(supplierId, orderDate, items) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) throw new Error(`供應商 ID ${supplierId} 不存在`);
        
        // 驗證商品存在
        for (let item of items) {
            const product = this.products.find(p => p.id === item.productId);
            if (!product) throw new Error(`商品 ID ${item.productId} 不存在`);
        }
        
        const purchaseOrder = new PurchaseOrder(
            this.generateId('purchase'),
            supplierId, orderDate, items
        );
        this.purchaseOrders.push(purchaseOrder);
        this.recordActivity('purchase', `建立進貨單: ${purchaseOrder.id}`, purchaseOrder.id);
        return purchaseOrder;
    }
    
    receivePurchaseOrder(purchaseOrderId) {
        const po = this.purchaseOrders.find(p => p.id === purchaseOrderId);
        if (!po) throw new Error(`進貨單 ID ${purchaseOrderId} 不存在`);
        
        if (po.status === 'received') {
            throw new Error('此進貨單已完成收貨');
        }
        
        // 更新庫存和成本價
        po.items.forEach(item => {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                product.currentStock += item.quantity;
                product.costPrice = item.unitPrice;
                product.updatedAt = new Date();
            }
        });
        
        po.status = 'received';
        po.receivedDate = new Date();
        this.recordActivity('purchase', `完成收貨: ${po.id}`, po.id);
        return po;
    }
    
    // 銷貨管理方法
    createSalesOrder(customerId, orderDate, items) {
        if (customerId) {
            const customer = this.customers.find(c => c.id === customerId);
            if (!customer) throw new Error(`客戶 ID ${customerId} 不存在`);
        }
        
        // 驗證庫存足夠
        for (let item of items) {
            const product = this.products.find(p => p.id === item.productId);
            if (!product) throw new Error(`商品 ID ${item.productId} 不存在`);
            if (product.currentStock < item.quantity) {
                throw new Error(`商品 ${product.name} 庫存不足，目前庫存: ${product.currentStock}`);
            }
        }
        
        const salesOrder = new SalesOrder(
            this.generateId('sales'),
            customerId, orderDate, items
        );
        this.salesOrders.push(salesOrder);
        
        // 自動扣減庫存
        items.forEach(item => {
            const product = this.products.find(p => p.id === item.productId);
            if (product) {
                product.currentStock -= item.quantity;
                product.updatedAt = new Date();
            }
        });
        
        salesOrder.status = 'shipped';
        this.recordActivity('sales', `建立銷貨單: ${salesOrder.id}`, salesOrder.id);
        return salesOrder;
    }
    
    // 庫存調整方法
    adjustInventory(productId, adjustmentType, quantity, reason) {
        const product = this.products.find(p => p.id === productId);
        if (!product) throw new Error(`商品 ID ${productId} 不存在`);
        
        const originalStock = product.currentStock;
        
        switch (adjustmentType) {
            case 'increase':
                product.currentStock += quantity;
                break;
            case 'decrease':
                if (product.currentStock < quantity) {
                    throw new Error(`庫存不足，無法減少 ${quantity} 個`);
                }
                product.currentStock -= quantity;
                break;
            case 'set':
                product.currentStock = quantity;
                break;
            default:
                throw new Error('無效的調整類型');
        }
        
        const adjustment = new InventoryAdjustment(
            this.generateId('adjustment'),
            productId, adjustmentType, quantity, originalStock, product.currentStock, reason
        );
        this.inventoryAdjustments.push(adjustment);
        product.updatedAt = new Date();
        
        this.recordActivity('inventory', 
            `庫存調整: ${product.name} ${originalStock} → ${product.currentStock}`, 
            adjustment.id
        );
        
        return { product, adjustment };
    }
    
    // 獲取低庫存商品
    getLowStockProducts() {
        return this.products.filter(p => p.currentStock <= p.safetyStock);
    }
    
    // ROP系統相關方法
    getReorderProducts() {
        return this.products.filter(p => p.needsReorder());
    }
    
    getReorderList() {
        return this.getReorderProducts().map(p => p.getReorderInfo());
    }
    
    generateReorderReport() {
        const reorderList = this.getReorderList();
        
        return {
            reportDate: new Date(),
            totalItems: reorderList.length,
            reorderList: reorderList,
            totalSuggestedValue: reorderList.reduce((sum, item) => {
                const product = this.products.find(p => p.id === item.productId);
                return sum + (item.suggestedQuantity * (product ? product.costPrice : 0));
            }, 0)
        };
    }
    
    // 根據ID獲取各種資料
    getProductById(productId) {
        return this.products.find(p => p.id === productId);
    }
    
    getCustomerById(customerId) {
        return this.customers.find(c => c.id === customerId);
    }
    
    getSupplierById(supplierId) {
        return this.suppliers.find(s => s.id === supplierId);
    }
    
    getPurchaseOrderById(orderId) {
        return this.purchaseOrders.find(po => po.id === orderId);
    }
    
    getSalesOrderById(orderId) {
        return this.salesOrders.find(so => so.id === orderId);
    }
    
    // 搜尋商品
    searchProducts(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return this.products.filter(p => 
            p.code.toLowerCase().includes(lowerKeyword) ||
            p.name.toLowerCase().includes(lowerKeyword) ||
            p.spec.toLowerCase().includes(lowerKeyword)
        );
    }
}

// 商品類別
class Product {
    constructor(id, code, name, spec, unit, salePrice, costPrice, safetyStock = 0, reorderPoint = 0, reorderQuantity = 0) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.spec = spec;
        this.unit = unit;
        this.salePrice = salePrice;
        this.costPrice = costPrice;
        this.currentStock = 0;
        this.safetyStock = safetyStock;
        this.reorderPoint = reorderPoint; // 再訂購點 (ROP)
        this.reorderQuantity = reorderQuantity; // 再訂購量
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    getStockValue() {
        return this.currentStock * this.costPrice;
    }
    
    isLowStock() {
        return this.currentStock <= this.safetyStock;
    }
    
    // ROP相關方法
    needsReorder() {
        return this.currentStock <= this.reorderPoint;
    }
    
    getSuggestedReorderQuantity() {
        return this.reorderQuantity || 0;
    }
    
    getReorderInfo() {
        return {
            productId: this.id,
            code: this.code,
            name: this.name,
            currentStock: this.currentStock,
            reorderPoint: this.reorderPoint,
            suggestedQuantity: this.reorderQuantity,
            needsReorder: this.needsReorder()
        };
    }
}

// 客戶類別
class Customer {
    constructor(id, name, contact, phone, email, address) {
        this.id = id;
        this.name = name;
        this.contact = contact;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

// 供應商類別
class Supplier {
    constructor(id, name, contact, phone, email, address) {
        this.id = id;
        this.name = name;
        this.contact = contact;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

// 進貨單類別
class PurchaseOrder {
    constructor(id, supplierId, orderDate, items) {
        this.id = id;
        this.supplierId = supplierId;
        this.orderDate = orderDate;
        this.items = items; // [{productId, quantity, unitPrice}]
        this.status = 'pending'; // pending, received
        this.receivedDate = null;
        this.totalAmount = this.calculateTotal();
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    calculateTotal() {
        return this.items.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0);
    }
}

// 銷貨單類別
class SalesOrder {
    constructor(id, customerId, orderDate, items) {
        this.id = id;
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.items = items; // [{productId, quantity, unitPrice}]
        this.status = 'pending'; // pending, shipped
        this.shippedDate = null;
        this.totalAmount = this.calculateTotal();
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    calculateTotal() {
        return this.items.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0);
    }
}

// 庫存調整類別
class InventoryAdjustment {
    constructor(id, productId, adjustmentType, quantity, originalStock, newStock, reason) {
        this.id = id;
        this.productId = productId;
        this.adjustmentType = adjustmentType; // increase, decrease, set
        this.quantity = quantity;
        this.originalStock = originalStock;
        this.newStock = newStock;
        this.reason = reason;
        this.createdAt = new Date();
    }
}

// 活動記錄類別
class Activity {
    constructor(id, type, description, relatedId, timestamp) {
        this.id = id;
        this.type = type; // product, customer, supplier, purchase, sales, inventory
        this.description = description;
        this.relatedId = relatedId;
        this.timestamp = timestamp;
    }
    
    getTimeAgo() {
        const now = new Date();
        const diff = now - this.timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小時前`;
        if (minutes > 0) return `${minutes}分鐘前`;
        return '剛剛';
    }
}

// 工具函數
class Utils {
    static formatCurrency(amount) {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(0)}K`;
        } else {
            return amount.toLocaleString('zh-TW');
        }
    }
    
    static formatDate(date) {
        if (typeof date === 'string') date = new Date(date);
        return date.toLocaleDateString('zh-TW');
    }
    
    static getStatusText(status, type) {
        const statusTexts = {
            purchase: {
                'pending': '待收貨',
                'received': '已收貨'
            },
            sales: {
                'pending': '待出貨',
                'shipped': '已出貨'
            }
        };
        
        return statusTexts[type] ? statusTexts[type][status] : status;
    }
    
    static getStatusClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'received': 'status-completed',
            'shipped': 'status-completed'
        };
        
        return statusClasses[status] || 'status-pending';
    }
}