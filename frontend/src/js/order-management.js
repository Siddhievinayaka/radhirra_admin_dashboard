class OrderManagement {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentFilters = {};
        this.selectedOrders = new Set();
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
                this.currentFilters.order_status = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        // Type filter
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.currentFilters.order_type = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshOrders');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadOrders());
        }

        // Bulk actions
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            bulkActions.addEventListener('change', (e) => {
                if (e.target.value && this.selectedOrders.size > 0) {
                    this.performBulkAction(e.target.value);
                    e.target.value = '';
                }
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }
    }

    async loadOrders() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                page_size: this.pageSize,
                ...this.currentFilters
            });

            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.apiBaseUrl}/orders/?${params}`
            );

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
        
        const getStatusColor = (status) => {
            switch(status) {
                case 'pending': return 'bg-yellow-500/20 text-yellow-400';
                case 'confirmed': return 'bg-blue-500/20 text-blue-400';
                case 'completed': return 'bg-green-500/20 text-green-400';
                case 'cancelled': return 'bg-red-500/20 text-red-400';
                default: return 'bg-gray-500/20 text-gray-400';
            }
        };
        
        if (tbody) {
            tbody.innerHTML = orders.map(order => `
                <tr class="hover:bg-gray-50 hover:bg-opacity-5">
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <input type="checkbox" class="order-checkbox rounded border-gray-600 bg-gray-700 text-purple-600" 
                               data-order-id="${order.id}" 
                               ${this.selectedOrders.has(order.id) ? 'checked' : ''}>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        #${order.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span class="px-2 py-1 rounded text-xs ${order.order_type === 'whatsapp' ? 'bg-green-600' : 'bg-blue-600'} text-white">
                            ${order.order_type || 'N/A'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${order.contact_value || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${order.user_id || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${order.get_cart_items || 0}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        ₹${parseFloat(order.total_amount || order.get_cart_total || 0).toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status || 'pending')}">
                            ${(order.order_status || 'pending').charAt(0).toUpperCase() + (order.order_status || 'pending').slice(1)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        ${new Date(order.date_ordered).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        ${order.transaction_id || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="orderManagement.viewOrder(${order.id})" 
                                class="text-purple-400 hover:text-purple-300 mr-3">
                            View
                        </button>
                        ${(order.order_status || 'pending') === 'pending' ? `
                            <button onclick="orderManagement.confirmOrder(${order.id})" 
                                    class="text-blue-400 hover:text-blue-300 mr-3">
                                Confirm
                            </button>
                        ` : ''}
                        ${(order.order_status || 'pending') === 'confirmed' ? `
                            <button onclick="orderManagement.completeOrder(${order.id})" 
                                    class="text-green-400 hover:text-green-300 mr-3">
                                Complete
                            </button>
                        ` : ''}
                        ${(order.order_status || 'pending') !== 'cancelled' && (order.order_status || 'pending') !== 'completed' ? `
                            <button onclick="orderManagement.cancelOrder(${order.id})" 
                                    class="text-red-400 hover:text-red-300">
                                Cancel
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `).join('');
        }
        
        // Add event listeners to checkboxes
        this.attachOrderEventListeners();
        if (cardContainer) {
            cardContainer.innerHTML = orders.map(order => `
                <div style="background-color: #1a1a1f; padding: 1.25rem; border-radius: 0.5rem;">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <div class="text-white font-bold text-lg">#${order.id}</div>
                            <div class="text-gray-300 text-sm">
                                <span class="px-2 py-1 rounded text-xs ${order.order_type === 'whatsapp' ? 'bg-green-600' : 'bg-blue-600'} text-white mr-2">
                                    ${order.order_type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                                </span>
                                User: ${order.user_id || 'N/A'}
                            </div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}">
                            ${order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </span>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Contact:</span>
                            <span class="text-white font-medium">${order.contact_value || 'N/A'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Items:</span>
                            <span class="text-white font-medium">${order.get_cart_items}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Amount:</span>
                            <span class="text-white font-medium">₹${parseFloat(order.total_amount || order.get_cart_total).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Date:</span>
                            <span class="text-gray-400">${new Date(order.date_ordered).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Transaction ID:</span>
                            <span class="text-gray-400">${order.transaction_id || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="orderManagement.viewOrder(${order.id})" 
                                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                            View
                        </button>
                        ${order.order_status === 'pending' ? `
                            <button onclick="orderManagement.confirmOrder(${order.id})" 
                                    class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                                Confirm
                            </button>
                        ` : ''}
                        ${order.order_status === 'confirmed' ? `
                            <button onclick="orderManagement.completeOrder(${order.id})" 
                                    class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                                Complete
                            </button>
                        ` : ''}
                        ${order.order_status !== 'cancelled' && order.order_status !== 'completed' ? `
                            <button onclick="orderManagement.cancelOrder(${order.id})" 
                                    class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                                Cancel
                            </button>
                        ` : ''}
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
            'pendingOrders': stats.pending_orders,
            'confirmedOrders': stats.confirmed_orders || 0,
            'completedOrders': stats.completed_orders,
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
            <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto max-h-screen overflow-y-auto">
                <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg sm:text-xl font-medium text-gray-900">Order #${order.id}</h3>
                        <button onclick="orderManagement.closeModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="px-4 sm:px-6 py-4">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">Customer Information</h4>
                            <div class="space-y-1 text-xs sm:text-sm">
                                <p style="color: black"><strong>Name:</strong> ${order.customer_name || 'Guest'}</p>
                                <p style="color: black"><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
                                <p style="color: black"><strong>Order Date:</strong> ${new Date(order.date_ordered).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">Order Summary</h4>
                            <div class="space-y-1 text-xs sm:text-sm">
                                <p style="color: black"><strong>Status:</strong> 
                                    <span class="px-2 py-1 text-xs rounded-full ${(order.order_status || 'pending') === 'completed' ? 'bg-green-100 text-green-800' : (order.order_status || 'pending') === 'confirmed' ? 'bg-blue-100 text-blue-800' : (order.order_status || 'pending') === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                        ${(order.order_status || 'pending').charAt(0).toUpperCase() + (order.order_status || 'pending').slice(1)}
                                    </span>
                                </p>
                                <p style="color: black"><strong>Order Type:</strong> ${(order.order_type || 'N/A').charAt(0).toUpperCase() + (order.order_type || 'N/A').slice(1)}</p>
                                <p style="color: black"><strong>Contact:</strong> ${order.contact_value || 'N/A'}</p>
                                <p style="color: black"><strong>Total Items:</strong> ${order.get_cart_items || 0}</p>
                                <p style="color: black"><strong>Total Amount:</strong> ₹${parseFloat(order.total_amount || order.get_cart_total || 0).toFixed(2)}</p>
                                <p style="color: black"><strong>Transaction ID:</strong> ${order.transaction_id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    ${order.shipping_address && order.shipping_address.length > 0 ? `
                        <div class="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">Shipping Address</h4>
                                <div class="bg-gray-50 p-3 rounded text-xs sm:text-sm">
                                    ${order.shipping_address.map(addr => `
                                        <p style="color: black">${addr.address}</p>
                                        <p style="color: black">${addr.city}, ${addr.state} ${addr.zipcode}</p>
                                    `).join('')}
                                </div>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">User Notes</h4>
                                <div class="bg-gray-50 p-3 rounded text-xs sm:text-sm">
                                    ${(order.items || []).filter(item => item.user_note && item.user_note.trim()).length > 0 ? 
                                        (order.items || []).filter(item => item.user_note && item.user_note.trim()).map(item => `
                                            <p style="color: black"><strong>${item.product_name}:</strong> ${item.user_note}</p>
                                        `).join('') : 
                                        '<p class="text-gray-500">No user notes</p>'
                                    }
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="mt-4 sm:mt-6">
                            <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">User Notes</h4>
                            <div class="bg-gray-50 p-3 rounded text-xs sm:text-sm">
                                ${(order.items || []).filter(item => item.user_note && item.user_note.trim()).length > 0 ? 
                                    (order.items || []).filter(item => item.user_note && item.user_note.trim()).map(item => `
                                        <p style="color: black"><strong>${item.product_name}:</strong> ${item.user_note}</p>
                                    `).join('') : 
                                    '<p class="text-gray-500">No user notes</p>'
                                }
                            </div>
                        </div>
                    `}
                    
                    <div class="mt-4 sm:mt-6">
                        <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">Order Items</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${(order.items || []).map(item => `
                                        <tr>
                                            <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">${item.product_name || 'N/A'}</td>
                                            <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-500">${item.quantity || 0}</td>
                                            <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-500">₹${parseFloat(item.price_at_order || item.product_price || 0).toFixed(2)}</td>
                                            <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">₹${parseFloat(item.get_total || 0).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="px-4 sm:px-6 py-4 border-t border-gray-200">
                    <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <button onclick="orderManagement.closeModal()" 
                                class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Close
                        </button>
                        <button onclick="orderManagement.generateInvoice(${order.id})" 
                                class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                            Generate Invoice
                        </button>
                        <button onclick="orderManagement.viewCustomerHistory(${order.user || 0})" 
                                class="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span class="hidden sm:inline">Customer History</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    async confirmOrder(orderId) {
        if (!confirm('Confirm this order?')) return;
        await this.updateOrderStatus(orderId, 'confirmed');
    }

    async completeOrder(orderId) {
        if (!confirm('Mark this order as completed?')) return;
        await this.updateOrderStatus(orderId, 'completed');
    }

    async cancelOrder(orderId) {
        if (!confirm('Cancel this order? This action cannot be undone.')) return;
        await this.updateOrderStatus(orderId, 'cancelled');
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.apiBaseUrl}/orders/${orderId}/update_status/`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ status: status })
                }
            );

            if (response.ok) {
                this.showSuccess(`Order status updated to ${status}`);
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

    attachOrderEventListeners() {
        document.querySelectorAll('.order-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const orderId = parseInt(e.target.dataset.orderId);
                if (e.target.checked) {
                    this.selectedOrders.add(orderId);
                } else {
                    this.selectedOrders.delete(orderId);
                }
                this.updateBulkActionsVisibility();
            });
        });
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.order-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const orderId = parseInt(checkbox.dataset.orderId);
            if (checked) {
                this.selectedOrders.add(orderId);
            } else {
                this.selectedOrders.delete(orderId);
            }
        });
        this.updateBulkActionsVisibility();
    }

    updateBulkActionsVisibility() {
        const bulkActionsContainer = document.getElementById('bulkActionsContainer');
        const selectedCount = document.getElementById('selectedCount');
        
        if (bulkActionsContainer) {
            if (this.selectedOrders.size > 0) {
                bulkActionsContainer.classList.remove('hidden');
                if (selectedCount) {
                    selectedCount.textContent = `${this.selectedOrders.size} selected`;
                }
            } else {
                bulkActionsContainer.classList.add('hidden');
            }
        }
    }

    async performBulkAction(action) {
        if (this.selectedOrders.size === 0) return;

        const orderIds = Array.from(this.selectedOrders);
        
        if (action === 'delete') {
            if (!confirm(`Permanently delete ${orderIds.length} selected orders? This action cannot be undone.`)) return;
            
            try {
                let deletedCount = 0;
                for (const orderId of orderIds) {
                    const response = await window.adminRoutes.makeAuthenticatedRequest(
                        `${this.apiBaseUrl}/orders/${orderId}/`,
                        { method: 'DELETE' }
                    );
                    if (response.ok) deletedCount++;
                }
                
                this.selectedOrders.clear();
                this.loadOrders();
                this.loadOrderStatistics();
                this.showSuccess(`${deletedCount} orders deleted successfully`);
            } catch (error) {
                console.error('Bulk delete failed:', error);
                this.showError('Bulk delete failed');
            }
            return;
        }

        const actionText = action === 'confirm' ? 'confirm' : action === 'complete' ? 'complete' : 'cancel';
        
        if (!confirm(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${orderIds.length} selected orders?`)) return;

        try {
            let successCount = 0;
            for (const orderId of orderIds) {
                const response = await window.adminRoutes.makeAuthenticatedRequest(
                    `${this.apiBaseUrl}/orders/${orderId}/update_status/`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify({ status: action === 'confirm' ? 'confirmed' : action === 'complete' ? 'completed' : 'cancelled' })
                    }
                );
                if (response.ok) successCount++;
            }
            
            this.selectedOrders.clear();
            this.loadOrders();
            this.loadOrderStatistics();
            this.showSuccess(`${successCount} orders ${actionText}ed successfully`);
        } catch (error) {
            console.error('Bulk action failed:', error);
            this.showError('Bulk action failed');
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
                        <p><strong>Status:</strong> ${order.order_status || 'Pending'}</p>
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
                                <td>₹${parseFloat(item.price_at_order || item.product_price || 0).toFixed(2)}</td>
                                <td>₹${parseFloat(item.get_total || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total-section">
                    <p><strong>Total Items: ${order.get_cart_items}</strong></p>
                    <p class="total-amount">Total Amount: ₹${parseFloat(order.total_amount || order.get_cart_total || 0).toFixed(2)}</p>
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
            <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-auto max-h-screen overflow-y-auto">
                <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg sm:text-xl font-medium text-gray-900">Customer Order History</h3>
                        <button onclick="orderManagement.closeModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="px-4 sm:px-6 py-4">
                    <div class="mb-4">
                        <h4 class="font-medium text-gray-900 mb-2 text-sm sm:text-base">Customer Summary</h4>
                        <div class="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                            <p><strong>Total Orders:</strong> ${orders.length}</p>
                            <p><strong>Total Spent:</strong> ₹${orders.reduce((sum, order) => sum + parseFloat(order.get_cart_total), 0).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <!-- Mobile Card View -->
                    <div class="block sm:hidden space-y-4">
                        ${orders.map(order => `
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="font-medium text-gray-900">#${order.id}</div>
                                    <span class="px-2 py-1 text-xs rounded-full ${
                                        (order.order_status || 'pending') === 'completed' ? 'bg-green-100 text-green-800' : 
                                        (order.order_status || 'pending') === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                                        (order.order_status || 'pending') === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }">
                                        ${(order.order_status || 'pending').charAt(0).toUpperCase() + (order.order_status || 'pending').slice(1)}
                                    </span>
                                </div>
                                <div class="text-sm text-gray-600 space-y-1">
                                    <div>Date: ${new Date(order.date_ordered).toLocaleDateString()}</div>
                                    <div>Items: ${order.get_cart_items}</div>
                                    <div>Amount: ₹${parseFloat(order.get_cart_total).toFixed(2)}</div>
                                </div>
                                <div class="flex gap-2 mt-3">
                                    <button onclick="orderManagement.viewOrder(${order.id})" 
                                            class="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-xs">
                                        View
                                    </button>
                                    <button onclick="orderManagement.generateInvoice(${order.id})" 
                                            class="flex-1 px-3 py-2 bg-green-600 text-white rounded text-xs">
                                        Invoice
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Desktop Table View -->
                    <div class="hidden sm:block overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                    <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${orders.map(order => `
                                    <tr>
                                        <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">#${order.id}</td>
                                        <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-500">${new Date(order.date_ordered).toLocaleDateString()}</td>
                                        <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-500">${order.get_cart_items}</td>
                                        <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900">₹${parseFloat(order.get_cart_total).toFixed(2)}</td>
                                        <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                            <span class="px-2 py-1 text-xs rounded-full ${
                                                (order.order_status || 'pending') === 'completed' ? 'bg-green-100 text-green-800' : 
                                                (order.order_status || 'pending') === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                                                (order.order_status || 'pending') === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }">
                                                ${(order.order_status || 'pending').charAt(0).toUpperCase() + (order.order_status || 'pending').slice(1)}
                                            </span>
                                        </td>
                                        <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                            <div class="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                                <button onclick="orderManagement.viewOrder(${order.id})" 
                                                        class="text-purple-600 hover:text-purple-900 text-xs">
                                                    View
                                                </button>
                                                <button onclick="orderManagement.generateInvoice(${order.id})" 
                                                        class="text-green-600 hover:text-green-900 text-xs">
                                                    Invoice
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button onclick="orderManagement.closeModal()" 
                            class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
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