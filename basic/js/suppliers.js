// 庫存管理系統 - 供應商管理模組

class SupplierModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.editingSupplierId = null;
    }
    
    initialize() {
        this.bindEvents();
        this.loadSuppliers();
    }
    
    bindEvents() {
        const supplierForm = document.getElementById('supplier-form');
        if (supplierForm) {
            supplierForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }
    
    handleFormSubmit() {
        try {
            const formData = this.getFormData();
            
            if (this.editingSupplierId) {
                const supplier = this.system.suppliers.find(s => s.id === this.editingSupplierId);
                Object.assign(supplier, formData);
                supplier.updatedAt = new Date();
                showAlert('供應商更新成功！', 'success');
                this.editingSupplierId = null;
            } else {
                this.system.addSupplier(formData.name, formData.contact, formData.phone, formData.email, formData.address);
                showAlert('供應商新增成功！', 'success');
            }
            
            this.clearForm();
            this.loadSuppliers();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    getFormData() {
        return {
            name: document.getElementById('supplier-name').value.trim(),
            contact: document.getElementById('supplier-contact').value.trim(),
            phone: document.getElementById('supplier-phone').value.trim(),
            email: document.getElementById('supplier-email').value.trim(),
            address: document.getElementById('supplier-address').value.trim()
        };
    }
    
    loadSuppliers() {
        const tbody = document.getElementById('suppliers-table');
        if (!tbody) return;
        
        const suppliers = this.system.suppliers;
        tbody.innerHTML = suppliers.map(supplier => `
            <tr>
                <td>${supplier.name}</td>
                <td>${supplier.contact || '-'}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.email || '-'}</td>
                <td>${supplier.address || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="supplierModule.editSupplier('${supplier.id}')">編輯</button>
                    <button class="btn btn-sm btn-danger" onclick="supplierModule.deleteSupplier('${supplier.id}')">刪除</button>
                </td>
            </tr>
        `).join('');
    }
    
    editSupplier(supplierId) {
        const supplier = this.system.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;
        
        this.editingSupplierId = supplierId;
        document.getElementById('supplier-name').value = supplier.name;
        document.getElementById('supplier-contact').value = supplier.contact || '';
        document.getElementById('supplier-phone').value = supplier.phone || '';
        document.getElementById('supplier-email').value = supplier.email || '';
        document.getElementById('supplier-address').value = supplier.address || '';
    }
    
    deleteSupplier(supplierId) {
        if (confirm('確定要刪除此供應商嗎？')) {
            const index = this.system.suppliers.findIndex(s => s.id === supplierId);
            if (index !== -1) {
                this.system.suppliers.splice(index, 1);
                showAlert('供應商刪除成功', 'success');
                this.loadSuppliers();
            }
        }
    }
    
    clearForm() {
        document.getElementById('supplier-form').reset();
        this.editingSupplierId = null;
    }
}