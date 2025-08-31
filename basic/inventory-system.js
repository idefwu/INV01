class InventorySystem {
    constructor() {
        this.products = [];
        this.customers = [];
        this.suppliers = [];
        this.purchaseOrders = [];
        this.salesOrders = [];
        this.inventoryAdjustments = [];
        this.nextProductId = 1;
        this.nextCustomerId = 1;
        this.nextSupplierId = 1;
        this.nextPurchaseOrderId = 1;
        this.nextSalesOrderId = 1;
        this.nextAdjustmentId = 1;
    }
}

class Product {
    constructor(id, code, name, spec, unit, salePrice, costPrice, safetyStock = 0) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.spec = spec;
        this.unit = unit;
        this.salePrice = salePrice;
        this.costPrice = costPrice;
        this.currentStock = 0;
        this.safetyStock = safetyStock;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

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

class PurchaseOrder {
    constructor(id, supplierId, orderDate, items) {
        this.id = id;
        this.supplierId = supplierId;
        this.orderDate = orderDate;
        this.items = items;
        this.totalAmount = this.calculateTotal();
        this.status = 'pending';
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    }
}

class SalesOrder {
    constructor(id, customerId, orderDate, items) {
        this.id = id;
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.items = items;
        this.totalAmount = this.calculateTotal();
        this.status = 'pending';
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    }
}

class InventoryAdjustment {
    constructor(id, productId, adjustmentType, quantity, reason, date) {
        this.id = id;
        this.productId = productId;
        this.adjustmentType = adjustmentType;
        this.quantity = quantity;
        this.reason = reason;
        this.date = date;
        this.createdAt = new Date();
    }
}

InventorySystem.prototype.addProduct = function(code, name, spec, unit, salePrice, costPrice, safetyStock) {
    const product = new Product(this.nextProductId++, code, name, spec, unit, salePrice, costPrice, safetyStock);
    this.products.push(product);
    return product;
};

InventorySystem.prototype.updateProduct = function(id, updates) {
    const product = this.products.find(p => p.id === id);
    if (!product) {
        throw new Error(`Product with ID ${id} not found`);
    }
    
    Object.keys(updates).forEach(key => {
        if (product.hasOwnProperty(key) && key !== 'id' && key !== 'createdAt') {
            product[key] = updates[key];
        }
    });
    
    product.updatedAt = new Date();
    return product;
};

InventorySystem.prototype.deleteProduct = function(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
        throw new Error(`Product with ID ${id} not found`);
    }
    
    return this.products.splice(index, 1)[0];
};

InventorySystem.prototype.getProduct = function(id) {
    return this.products.find(p => p.id === id);
};

InventorySystem.prototype.getProductByCode = function(code) {
    return this.products.find(p => p.code === code);
};


InventorySystem.prototype.getAllProducts = function() {
    return this.products;
};

InventorySystem.prototype.searchProducts = function(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.products.filter(p => 
        p.name.toLowerCase().includes(lowerKeyword) ||
        p.code.toLowerCase().includes(lowerKeyword) ||
        p.spec.toLowerCase().includes(lowerKeyword)
    );
};

InventorySystem.prototype.addCustomer = function(name, contact, phone, email, address) {
    const customer = new Customer(this.nextCustomerId++, name, contact, phone, email, address);
    this.customers.push(customer);
    return customer;
};

InventorySystem.prototype.updateCustomer = function(id, updates) {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) {
        throw new Error(`Customer with ID ${id} not found`);
    }
    
    Object.keys(updates).forEach(key => {
        if (customer.hasOwnProperty(key) && key !== 'id' && key !== 'createdAt') {
            customer[key] = updates[key];
        }
    });
    
    customer.updatedAt = new Date();
    return customer;
};

InventorySystem.prototype.deleteCustomer = function(id) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index === -1) {
        throw new Error(`Customer with ID ${id} not found`);
    }
    
    return this.customers.splice(index, 1)[0];
};

InventorySystem.prototype.getCustomer = function(id) {
    return this.customers.find(c => c.id === id);
};

InventorySystem.prototype.getAllCustomers = function() {
    return this.customers;
};

InventorySystem.prototype.addSupplier = function(name, contact, phone, email, address) {
    const supplier = new Supplier(this.nextSupplierId++, name, contact, phone, email, address);
    this.suppliers.push(supplier);
    return supplier;
};

InventorySystem.prototype.updateSupplier = function(id, updates) {
    const supplier = this.suppliers.find(s => s.id === id);
    if (!supplier) {
        throw new Error(`Supplier with ID ${id} not found`);
    }
    
    Object.keys(updates).forEach(key => {
        if (supplier.hasOwnProperty(key) && key !== 'id' && key !== 'createdAt') {
            supplier[key] = updates[key];
        }
    });
    
    supplier.updatedAt = new Date();
    return supplier;
};

InventorySystem.prototype.deleteSupplier = function(id) {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) {
        throw new Error(`Supplier with ID ${id} not found`);
    }
    
    return this.suppliers.splice(index, 1)[0];
};

InventorySystem.prototype.getSupplier = function(id) {
    return this.suppliers.find(s => s.id === id);
};

InventorySystem.prototype.getAllSuppliers = function() {
    return this.suppliers;
};

InventorySystem.prototype.createPurchaseOrder = function(supplierId, orderDate, items) {
    const supplier = this.getSupplier(supplierId);
    if (!supplier) {
        throw new Error(`Supplier with ID ${supplierId} not found`);
    }

    for (let item of items) {
        const product = this.getProduct(item.productId);
        if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
        }
    }

    const purchaseOrder = new PurchaseOrder(this.nextPurchaseOrderId++, supplierId, orderDate, items);
    this.purchaseOrders.push(purchaseOrder);
    return purchaseOrder;
};

InventorySystem.prototype.receivePurchaseOrder = function(purchaseOrderId) {
    const purchaseOrder = this.purchaseOrders.find(po => po.id === purchaseOrderId);
    if (!purchaseOrder) {
        throw new Error(`Purchase order with ID ${purchaseOrderId} not found`);
    }

    if (purchaseOrder.status === 'received') {
        throw new Error(`Purchase order ${purchaseOrderId} has already been received`);
    }

    purchaseOrder.items.forEach(item => {
        const product = this.getProduct(item.productId);
        if (product) {
            product.currentStock += item.quantity;
            product.costPrice = item.unitPrice;
            product.updatedAt = new Date();
        }
    });

    purchaseOrder.status = 'received';
    purchaseOrder.updatedAt = new Date();
    return purchaseOrder;
};

InventorySystem.prototype.getPurchaseOrder = function(id) {
    return this.purchaseOrders.find(po => po.id === id);
};

InventorySystem.prototype.getAllPurchaseOrders = function() {
    return this.purchaseOrders;
};

InventorySystem.prototype.getPurchaseOrdersBySupplier = function(supplierId) {
    return this.purchaseOrders.filter(po => po.supplierId === supplierId);
};

InventorySystem.prototype.getPurchaseOrdersByDate = function(startDate, endDate) {
    return this.purchaseOrders.filter(po => {
        const orderDate = new Date(po.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
    });
};

InventorySystem.prototype.createSalesOrder = function(customerId, orderDate, items) {
    const customer = this.getCustomer(customerId);
    if (!customer) {
        throw new Error(`Customer with ID ${customerId} not found`);
    }

    for (let item of items) {
        const product = this.getProduct(item.productId);
        if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
        }
        
        if (product.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
        }
    }

    const salesOrder = new SalesOrder(this.nextSalesOrderId++, customerId, orderDate, items);
    this.salesOrders.push(salesOrder);
    return salesOrder;
};

InventorySystem.prototype.fulfillSalesOrder = function(salesOrderId) {
    const salesOrder = this.salesOrders.find(so => so.id === salesOrderId);
    if (!salesOrder) {
        throw new Error(`Sales order with ID ${salesOrderId} not found`);
    }

    if (salesOrder.status === 'fulfilled') {
        throw new Error(`Sales order ${salesOrderId} has already been fulfilled`);
    }

    salesOrder.items.forEach(item => {
        const product = this.getProduct(item.productId);
        if (product) {
            if (product.currentStock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
            }
            product.currentStock -= item.quantity;
            product.updatedAt = new Date();
        }
    });

    salesOrder.status = 'fulfilled';
    salesOrder.updatedAt = new Date();
    return salesOrder;
};

InventorySystem.prototype.getSalesOrder = function(id) {
    return this.salesOrders.find(so => so.id === id);
};

InventorySystem.prototype.getAllSalesOrders = function() {
    return this.salesOrders;
};

InventorySystem.prototype.getSalesOrdersByCustomer = function(customerId) {
    return this.salesOrders.filter(so => so.customerId === customerId);
};

InventorySystem.prototype.getSalesOrdersByDate = function(startDate, endDate) {
    return this.salesOrders.filter(so => {
        const orderDate = new Date(so.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
    });
};

InventorySystem.prototype.getCurrentStock = function(productId) {
    const product = this.getProduct(productId);
    if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
    }
    return product.currentStock;
};

InventorySystem.prototype.adjustInventory = function(productId, adjustmentType, quantity, reason) {
    const product = this.getProduct(productId);
    if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
    }

    if (adjustmentType === 'increase') {
        product.currentStock += quantity;
    } else if (adjustmentType === 'decrease') {
        if (product.currentStock < quantity) {
            throw new Error(`Cannot decrease stock by ${quantity}. Current stock is ${product.currentStock}`);
        }
        product.currentStock -= quantity;
    } else if (adjustmentType === 'set') {
        product.currentStock = quantity;
    } else {
        throw new Error(`Invalid adjustment type: ${adjustmentType}. Use 'increase', 'decrease', or 'set'`);
    }

    product.updatedAt = new Date();

    const adjustment = new InventoryAdjustment(
        this.nextAdjustmentId++,
        productId,
        adjustmentType,
        quantity,
        reason,
        new Date()
    );
    this.inventoryAdjustments.push(adjustment);

    return { product, adjustment };
};

InventorySystem.prototype.getLowStockProducts = function() {
    return this.products.filter(p => p.currentStock <= p.safetyStock);
};

InventorySystem.prototype.getInventoryAdjustments = function(productId) {
    if (productId) {
        return this.inventoryAdjustments.filter(adj => adj.productId === productId);
    }
    return this.inventoryAdjustments;
};

InventorySystem.prototype.getInventoryAdjustmentsByDate = function(startDate, endDate) {
    return this.inventoryAdjustments.filter(adj => {
        const adjDate = new Date(adj.date);
        return adjDate >= startDate && adjDate <= endDate;
    });
};

InventorySystem.prototype.generateInventoryReport = function() {
    return this.products.map(product => ({
        id: product.id,
        code: product.code,
        name: product.name,
        currentStock: product.currentStock,
        unit: product.unit,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        stockValue: product.currentStock * product.costPrice,
        safetyStock: product.safetyStock,
        lowStock: product.currentStock <= product.safetyStock
    }));
};

InventorySystem.prototype.generateTransactionReport = function(startDate, endDate) {
    const purchases = this.getPurchaseOrdersByDate(startDate, endDate)
        .filter(po => po.status === 'received')
        .map(po => ({
            type: 'purchase',
            id: po.id,
            date: po.orderDate,
            supplierId: po.supplierId,
            totalAmount: po.totalAmount,
            items: po.items
        }));

    const sales = this.getSalesOrdersByDate(startDate, endDate)
        .filter(so => so.status === 'fulfilled')
        .map(so => ({
            type: 'sale',
            id: so.id,
            date: so.orderDate,
            customerId: so.customerId,
            totalAmount: so.totalAmount,
            items: so.items
        }));

    const adjustments = this.getInventoryAdjustmentsByDate(startDate, endDate)
        .map(adj => ({
            type: 'adjustment',
            id: adj.id,
            date: adj.date,
            productId: adj.productId,
            adjustmentType: adj.adjustmentType,
            quantity: adj.quantity,
            reason: adj.reason
        }));

    return {
        purchases,
        sales,
        adjustments,
        summary: {
            totalPurchases: purchases.length,
            totalSales: sales.length,
            totalAdjustments: adjustments.length,
            totalPurchaseAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
            totalSalesAmount: sales.reduce((sum, s) => sum + s.totalAmount, 0)
        }
    };
};

InventorySystem.prototype.getProductMovement = function(productId, startDate, endDate) {
    const product = this.getProduct(productId);
    if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
    }

    const movements = [];

    this.getPurchaseOrdersByDate(startDate, endDate)
        .filter(po => po.status === 'received')
        .forEach(po => {
            po.items.forEach(item => {
                if (item.productId === productId) {
                    movements.push({
                        type: 'purchase',
                        date: po.orderDate,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalAmount: item.quantity * item.unitPrice,
                        reference: `PO-${po.id}`
                    });
                }
            });
        });

    this.getSalesOrdersByDate(startDate, endDate)
        .filter(so => so.status === 'fulfilled')
        .forEach(so => {
            so.items.forEach(item => {
                if (item.productId === productId) {
                    movements.push({
                        type: 'sale',
                        date: so.orderDate,
                        quantity: -item.quantity,
                        unitPrice: item.unitPrice,
                        totalAmount: -(item.quantity * item.unitPrice),
                        reference: `SO-${so.id}`
                    });
                }
            });
        });

    this.getInventoryAdjustmentsByDate(startDate, endDate)
        .filter(adj => adj.productId === productId)
        .forEach(adj => {
            let quantity = adj.quantity;
            if (adj.adjustmentType === 'decrease') {
                quantity = -quantity;
            }
            movements.push({
                type: 'adjustment',
                date: adj.date,
                quantity: quantity,
                unitPrice: 0,
                totalAmount: 0,
                reference: `ADJ-${adj.id}`,
                reason: adj.reason
            });
        });

    movements.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        product: {
            id: product.id,
            code: product.code,
            name: product.name,
            unit: product.unit
        },
        movements,
        summary: {
            totalIn: movements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0),
            totalOut: Math.abs(movements.filter(m => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0)),
            netMovement: movements.reduce((sum, m) => sum + m.quantity, 0)
        }
    };
};