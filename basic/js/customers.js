// 庫存管理系統 - 客戶管理模組

class CustomerModule {
    constructor(inventorySystem) {
        this.system = inventorySystem;
        this.editingCustomerId = null;
    }
    
    initialize() {
        this.bindEvents();
        this.loadCustomers();
    }
    
    bindEvents() {
        const customerForm = document.getElementById('customer-form');
        if (customerForm) {
            customerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
    }
    
    handleFormSubmit() {
        try {
            const formData = this.getFormData();
            
            if (this.editingCustomerId) {
                this.system.customers.find(c => c.id === this.editingCustomerId && Object.assign(c, formData));
                showAlert('客戶更新成功！', 'success');
                this.editingCustomerId = null;
            } else {
                this.system.addCustomer(formData.name, formData.contact, formData.phone, formData.email, formData.address);
                showAlert('客戶新增成功！', 'success');
            }
            
            this.clearForm();
            this.loadCustomers();
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
    
    getFormData() {
        return {
            name: document.getElementById('customer-name').value.trim(),
            contact: document.getElementById('customer-contact').value.trim(),
            phone: document.getElementById('customer-phone').value.trim(),
            email: document.getElementById('customer-email').value.trim(),
            address: document.getElementById('customer-address').value.trim()
        };
    }
    
    loadCustomers() {
        const tbody = document.getElementById('customers-table');
        if (!tbody) return;
        
        const customers = this.system.customers;
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.contact || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.address || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="customerModule.editCustomer('${customer.id}')">編輯</button>
                    <button class="btn btn-sm btn-danger" onclick="customerModule.deleteCustomer('${customer.id}')">刪除</button>
                </td>
            </tr>
        `).join('');
    }
    
    editCustomer(customerId) {
        const customer = this.system.customers.find(c => c.id === customerId);
        if (!customer) return;
        
        this.editingCustomerId = customerId;
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-contact').value = customer.contact || '';
        document.getElementById('customer-phone').value = customer.phone || '';
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
    }
    
    deleteCustomer(customerId) {
        if (confirm('確定要刪除此客戶嗎？')) {
            const index = this.system.customers.findIndex(c => c.id === customerId);
            if (index !== -1) {
                this.system.customers.splice(index, 1);
                showAlert('客戶刪除成功', 'success');
                this.loadCustomers();
            }
        }
    }
    
    clearForm() {
        document.getElementById('customer-form').reset();
        this.editingCustomerId = null;
    }
}