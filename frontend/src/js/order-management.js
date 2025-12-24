class OrderManagement {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.loadOrderStatistics();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.complete = e.target.value === 'completed' ? 'true' : 
                                             e.target.value === 'pending' ? 'false' : '';
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshOrders');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadOrders());
        }
    }

    async loadOrders() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                page_size: this.pageSize,
                ...this.currentFilters
            });

            const response = await fetch(`${this.apiBaseUrl}/orders/?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderOrders(data.results);
                this.renderPagination(data);
            } else {
                throw new Error('Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showError('Failed to load orders');
        }
    }

    renderOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        const cardContainer = document.getElementById('ordersCardContainer');
        
        if (tbody) {
            tbody.innerHTML = orders.map(order => `
                <tr class="hover:bg-gray-50 hover:bg-opacity-5">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        #${order.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${order.customer_name || 'Guest'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${order.get_cart_items} items
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ₹${parseFloat(order.get_cart_total).toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${
                            order.complete ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }">
                            ${order.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        ${new Date(order.date_ordered).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="orderManagement.viewOrder(${order.id})" 
                                class="text-purple-400 hover:text-purple-300 mr-3">
                            View
                        </button>
                        <button onclick="orderManagement.generateInvoice(${order.id})" 
                                class="text-green-400 hover:text-green-300 mr-3">
                            Invoice
                        </button>
                        <button onclick="orderManagement.updateOrderStatus(${order.id}, ${!order.complete})" 
                                class="text-blue-400 hover:text-blue-300">
                            ${order.complete ? 'Mark Pending' : 'Mark Complete'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        if (cardContainer) {
            cardContainer.innerHTML = orders.map(order => `
                <div style="background-color: #1a1a1f; padding: 1.25rem; border-radius: 0.5rem;">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <div class="text-white font-bold text-lg">#${order.id}</div>
                            <div class="text-gray-300 text-sm">${order.customer_name || 'Guest'}</div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${
                            order.complete ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }">
                            ${order.status}
                        </span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Items:</span>
                            <span class="text-white font-medium">${order.get_cart_items}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Amount:</span>
                            <span class="text-white font-medium">₹${parseFloat(order.get_cart_total).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Date:</span>
                            <span class="text-gray-400">${new Date(order.date_ordered).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="orderManagement.viewOrder(${order.id})" 
                                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                            View
                        </button>
                        <button onclick="orderManagement.generateInvoice(${order.id})" 
                                class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                            Invoice
                        </button>
                        <button onclick="orderManagement.updateOrderStatus(${order.id}, ${!order.complete})" 
                                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                            ${order.complete ? 'Pending' : 'Complete'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    renderPagination(data) {
        const pagination = document.getElementById('ordersPagination');
        if (!pagination) return;

        const totalPages = Math.ceil(data.count / this.pageSize);
        const currentPage = this.currentPage;

        pagination.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    Showing ${((currentPage - 1) * this.pageSize) + 1} to ${Math.min(currentPage * this.pageSize, data.count)} of ${data.count} orders
                </div>
                <div class="flex space-x-2">
                    <button ${currentPage === 1 ? 'disabled' : ''} 
                            onclick="orderManagement.goToPage(${currentPage - 1})"
                            class="px-3 py-1 border rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                        Previous
                    </button>
                    <span class="px-3 py-1 bg-blue-500 text-white rounded">
                        ${currentPage} of ${totalPages}
                    </span>
                    <button ${currentPage === totalPages ? 'disabled' : ''} 
                            onclick="orderManagement.goToPage(${currentPage + 1})"
                            class="px-3 py-1 border rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                        Next
                    </button>
                </div>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadOrders();
    }

    async loadOrderStatistics() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/statistics/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const stats = await response.json();
                this.updateStatistics(stats);
            }
        } catch (error) {
            console.error('Error loading order statistics:', error);
        }
    }

    updateStatistics(stats) {
        const elements = {
            'totalOrders': stats.total_orders,
            'completedOrders': stats.completed_orders,
            'pendingOrders': stats.pending_orders,
            'totalRevenue': `₹${parseFloat(stats.total_revenue).toFixed(2)}`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    async viewOrder(orderId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/${orderId}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const order = await response.json();
                this.showOrderModal(order);
            } else {
                throw new Error('Failed to load order details');
            }
        } catch (error) {
            console.error('Error loading order:', error);
            this.showError('Failed to load order details');
        }
    }

    showOrderModal(order) {
        const modal = document.getElementById('orderModal');
        const modalContent = document.getElementById('orderModalContent');
        
        if (!modal || !modalContent) return;

        modalContent.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-medium text-gray-900">Order #${order.id}</h3>
                        <button onclick="orderManagement.closeModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="px-6 py-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-medium text-gray-900 mb-2">Customer Information</h4>
                            <p><strong>Name:</strong> ${order.customer_name || 'Guest'}</p>
                            <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.date_ordered).toLocaleString()}</p>
                        </div>
                        
                        <div>
                            <h4 class="font-medium text-gray-900 mb-2">Order Summary</h4>
                            <p><strong>Status:</strong> 
                                <span class="px-2 py-1 text-xs rounded-full ${order.complete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                    ${order.status}
                                </span>
                            </p>
                            <p><strong>Total Items:</strong> ${order.get_cart_items}</p>
                            <p><strong>Total Amount:</strong> ₹${parseFloat(order.get_cart_total).toFixed(2)}</p>
                            <p><strong>Transaction ID:</strong> ${order.transaction_id || 'N/A'}</p>
                        </div>
                    </div>
                    
                    ${order.shipping_address && order.shipping_address.length > 0 ? `
                        <div class="mt-6">
                            <h4 class="font-medium text-gray-900 mb-2">Shipping Address</h4>
                            <div class="bg-gray-50 p-3 rounded">
                                ${order.shipping_address.map(addr => `
                                    <p>${addr.address}</p>
                                    <p>${addr.city}, ${addr.state} ${addr.zipcode}</p>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-6">
                        <h4 class="font-medium text-gray-900 mb-2">Order Items</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${order.items.map(item => `
                                        <tr>
                                            <td class="px-4 py-2 text-sm text-gray-900">${item.product_name}</td>
                                            <td class="px-4 py-2 text-sm text-gray-500">${item.quantity}</td>
                                            <td class="px-4 py-2 text-sm text-gray-900">₹${parseFloat(item.total_price).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button onclick="orderManagement.closeModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Close
                    </button>
                    <button onclick="orderManagement.generateInvoice(${order.id})" 
                            class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                        Generate Invoice
                    </button>
                    <button onclick="orderManagement.viewCustomerHistory(${order.user || 0})" 
                            class="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                        Customer History
                    </button>
                    <button onclick="orderManagement.updateOrderStatus(${order.id}, ${!order.complete})" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        ${order.complete ? 'Mark as Pending' : 'Mark as Complete'}
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    async updateOrderStatus(orderId, complete) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/${orderId}/update_status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: complete ? 'delivered' : 'pending'
                })
            });

            if (response.ok) {
                this.showSuccess('Order status updated successfully');
                this.loadOrders();
                this.loadOrderStatistics();
                this.closeModal();
            } else {
                throw new Error('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            this.showError('Failed to update order status');
        }
    }

    closeModal() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.classList.add('hidden');
    }

    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async generateInvoice(orderId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/${orderId}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const order = await response.json();
                this.createInvoicePDF(order);
            } else {
                throw new Error('Failed to load order for invoice');
            }
        } catch (error) {
            console.error('Error generating invoice:', error);
            this.showError('Failed to generate invoice');
        }
    }

    createInvoicePDF(order) {
        const invoiceWindow = window.open('', '_blank');
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #8b5cf6; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .customer-info, .order-info { width: 45%; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .items-table th { background-color: #f8f9fa; }
                    .total-section { text-align: right; margin-top: 20px; }
                    .total-amount { font-size: 18px; font-weight: bold; color: #8b5cf6; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">RADHIRRA DESIGNS</div>
                    <p>Fashion & Lifestyle</p>
                </div>
                
                <div class="invoice-details">
                    <div class="customer-info">
                        <h3>Bill To:</h3>
                        <p><strong>${order.customer_name || 'Guest Customer'}</strong></p>
                        <p>${order.customer_email || 'N/A'}</p>
                    </div>
                    
                    <div class="order-info">
                        <h3>Invoice Details:</h3>
                        <p><strong>Invoice #:</strong> INV-${order.id}</p>
                        <p><strong>Order #:</strong> ${order.id}</p>
                        <p><strong>Date:</strong> ${new Date(order.date_ordered).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>₹${(parseFloat(item.total_price) / item.quantity).toFixed(2)}</td>
                                <td>₹${parseFloat(item.total_price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <p><strong>Total Items: ${order.get_cart_items}</strong></p>
                    <p class="total-amount">Total Amount: ₹${parseFloat(order.get_cart_total).toFixed(2)}</p>
                </div>
                
                <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                    <p>Thank you for your business!</p>
                    <p>This is a computer-generated invoice.</p>
                </div>
            </body>
            </html>
        `;
        
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
        
        setTimeout(() => {
            invoiceWindow.print();
        }, 500);
    }

    async generateInvoice(orderId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/${orderId}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const order = await response.json();
                this.createInvoicePDF(order);
            } else {
                throw new Error('Failed to load order for invoice');
            }
        } catch (error) {
            console.error('Error generating invoice:', error);
            this.showError('Failed to generate invoice');
        }
    }

    createInvoicePDF(order) {
        // Create a new window for the invoice
        const invoiceWindow = window.open('', '_blank');
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #8b5cf6; }
                    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .customer-info, .order-info { width: 45%; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .items-table th { background-color: #f8f9fa; }
                    .total-section { text-align: right; margin-top: 20px; }
                    .total-amount { font-size: 18px; font-weight: bold; color: #8b5cf6; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">RADHIRRA DESIGNS</div>
                    <p>Fashion & Lifestyle</p>
                </div>
                
                <div class="invoice-details">
                    <div class="customer-info">
                        <h3>Bill To:</h3>
                        <p><strong>${order.customer_name || 'Guest Customer'}</strong></p>
                        <p>${order.customer_email || 'N/A'}</p>
                        ${order.shipping_address && order.shipping_address.length > 0 ? 
                            order.shipping_address.map(addr => `
                                <p>${addr.address}<br>
                                ${addr.city}, ${addr.state} ${addr.zipcode}</p>
                            `).join('') : '<p>No shipping address</p>'
                        }
                    </div>
                    
                    <div class="order-info">
                        <h3>Invoice Details:</h3>
                        <p><strong>Invoice #:</strong> INV-${order.id}</p>
                        <p><strong>Order #:</strong> ${order.id}</p>
                        <p><strong>Date:</strong> ${new Date(order.date_ordered).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        ${order.transaction_id ? `<p><strong>Transaction ID:</strong> ${order.transaction_id}</p>` : ''}
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>₹${(parseFloat(item.total_price) / item.quantity).toFixed(2)}</td>
                                <td>₹${parseFloat(item.total_price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <p><strong>Total Items: ${order.get_cart_items}</strong></p>
                    <p class="total-amount">Total Amount: ₹${parseFloat(order.get_cart_total).toFixed(2)}</p>
                </div>
                
                <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                    <p>Thank you for your business!</p>
                    <p>This is a computer-generated invoice.</p>
                </div>
            </body>
            </html>
        `;
        
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
        
        // Auto-print after a short delay
        setTimeout(() => {
            invoiceWindow.print();
        }, 500);
    }

    async viewCustomerHistory(customerId) {
        if (!customerId) {
            this.showError('No customer information available');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/customers/${customerId}/orders/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const orders = await response.json();
                this.showCustomerHistoryModal(customerId, orders);
            } else {
                throw new Error('Failed to load customer order history');
            }
        } catch (error) {
            console.error('Error loading customer history:', error);
            this.showError('Failed to load customer order history');
        }
    }

    showCustomerHistoryModal(customerId, orders) {
        const modal = document.getElementById('orderModal');
        const modalContent = document.getElementById('orderModalContent');
        
        if (!modal || !modalContent) return;

        modalContent.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-medium text-gray-900">Customer Order History</h3>
                        <button onclick="orderManagement.closeModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="px-6 py-4">
                    <div class="mb-4">
                        <h4 class="font-medium text-gray-900 mb-2">Customer Summary</h4>
                        <p><strong>Total Orders:</strong> ${orders.length}</p>
                        <p><strong>Total Spent:</strong> ₹${orders.reduce((sum, order) => sum + parseFloat(order.get_cart_total), 0).toFixed(2)}</p>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${orders.map(order => `
                                    <tr>
                                        <td class="px-4 py-2 text-sm text-gray-900">#${order.id}</td>
                                        <td class="px-4 py-2 text-sm text-gray-500">${new Date(order.date_ordered).toLocaleDateString()}</td>
                                        <td class="px-4 py-2 text-sm text-gray-500">${order.get_cart_items}</td>
                                        <td class="px-4 py-2 text-sm text-gray-900">₹${parseFloat(order.get_cart_total).toFixed(2)}</td>
                                        <td class="px-4 py-2 text-sm">
                                            <span class="px-2 py-1 text-xs rounded-full ${
                                                order.complete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }">
                                                ${order.status}
                                            </span>
                                        </td>
                                        <td class="px-4 py-2 text-sm">
                                            <button onclick="orderManagement.viewOrder(${order.id})" 
                                                    class="text-purple-600 hover:text-purple-900 mr-2">
                                                View
                                            </button>
                                            <button onclick="orderManagement.generateInvoice(${order.id})" 
                                                    class="text-green-600 hover:text-green-900">
                                                Invoice
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button onclick="orderManagement.closeModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orderManagement = new OrderManagement();
});