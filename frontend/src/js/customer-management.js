class CustomerManager {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentFilters = {};
        this.init();
    }

    init() {
        this.loadCustomers();
        this.loadReviews();
        this.loadCustomerStats();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('customerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.currentPage = 1;
                this.loadCustomers();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.is_active = e.target.value === 'active' ? 'true' : 
                                               e.target.value === 'inactive' ? 'false' : '';
                this.currentPage = 1;
                this.loadCustomers();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshCustomers');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadCustomers());
        }
    }

    async loadCustomers() {
        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                page_size: this.pageSize,
                ...this.currentFilters
            });

            const response = await fetch(`${this.apiBaseUrl}/customers/?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderCustomers(data.results);
                this.renderPagination(data);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    }

    renderCustomers(customers) {
        const tbody = document.getElementById('customersTableBody');
        const cardContainer = document.getElementById('customersCardContainer');
        
        if (tbody) {
            tbody.innerHTML = customers.map(customer => `
                <tr class="hover:bg-gray-50 hover:bg-opacity-5">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center">
                                <span class="text-purple-400 font-medium">${(customer.first_name || customer.username || 'U').charAt(0).toUpperCase()}</span>
                            </div>
                            <div class="ml-3">
                                <div class="text-white font-medium">${customer.first_name || customer.username} ${customer.last_name || ''}</div>
                                <div class="text-gray-400 text-sm">@${customer.username}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${customer.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${customer.order_count || 0}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">₹${(customer.total_spent || 0).toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs rounded-full ${
                            customer.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }">
                            ${customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        ${new Date(customer.date_joined).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="customerManager.viewCustomerProfile(${customer.id})" 
                                class="text-purple-400 hover:text-purple-300 mr-3">
                            View Profile
                        </button>
                        <button onclick="customerManager.toggleCustomerStatus(${customer.id}, ${!customer.is_active})" 
                                class="text-blue-400 hover:text-blue-300">
                            ${customer.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        if (cardContainer) {
            cardContainer.innerHTML = customers.map(customer => `
                <div style="background-color: #1a1a1f; padding: 1.25rem; border-radius: 0.5rem;">
                    <div class="flex items-center mb-3">
                        <div class="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center">
                            <span class="text-purple-400 font-medium text-lg">${(customer.first_name || customer.username || 'U').charAt(0).toUpperCase()}</span>
                        </div>
                        <div class="ml-3 flex-1">
                            <div class="text-white font-medium">${customer.first_name || customer.username} ${customer.last_name || ''}</div>
                            <div class="text-gray-400 text-sm">${customer.email}</div>
                        </div>
                        <span class="px-2 py-1 text-xs rounded-full ${
                            customer.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }">
                            ${customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                            <span class="text-gray-400">Orders:</span>
                            <span class="text-white font-medium ml-1">${customer.order_count || 0}</span>
                        </div>
                        <div>
                            <span class="text-gray-400">Spent:</span>
                            <span class="text-white font-medium ml-1">₹${(customer.total_spent || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="customerManager.viewCustomerProfile(${customer.id})" 
                                class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
                            View Profile
                        </button>
                        <button onclick="customerManager.toggleCustomerStatus(${customer.id}, ${!customer.is_active})" 
                                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                            ${customer.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    async loadCustomerStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/customers/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateCustomerStats(data.results || data);
            }
        } catch (error) {
            console.error('Error loading customer stats:', error);
        }
    }

    updateCustomerStats(customers) {
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter(c => c.is_active).length;
        const newCustomers = customers.filter(c => {
            const joinDate = new Date(c.date_joined);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return joinDate > thirtyDaysAgo;
        }).length;
        const totalOrders = customers.reduce((sum, c) => sum + (c.order_count || 0), 0);

        const elements = {
            'totalCustomers': totalCustomers,
            'activeCustomers': activeCustomers,
            'newCustomers': newCustomers,
            'customerOrders': totalOrders
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    async viewCustomerProfile(customerId) {
        try {
            const [customerResponse, ordersResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/customers/${customerId}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${this.apiBaseUrl}/customers/${customerId}/orders/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            if (customerResponse.ok && ordersResponse.ok) {
                const customer = await customerResponse.json();
                const orders = await ordersResponse.json();
                this.showCustomerProfileModal(customer, orders);
            }
        } catch (error) {
            console.error('Error loading customer profile:', error);
        }
    }

    showCustomerProfileModal(customer, orders) {
        const modal = document.getElementById('customerModal');
        const modalContent = document.getElementById('customerModalContent');
        
        if (!modal || !modalContent) return;

        modalContent.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-medium text-gray-900">Customer Profile</h3>
                        <button onclick="customerManager.closeModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="px-6 py-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h4 class="font-medium text-gray-900 mb-3">Customer Information</h4>
                            <div class="space-y-2">
                                <p><strong>Name:</strong> ${customer.first_name || ''} ${customer.last_name || ''}</p>
                                <p><strong>Username:</strong> ${customer.username}</p>
                                <p><strong>Email:</strong> ${customer.email}</p>
                                <p><strong>Status:</strong> 
                                    <span class="px-2 py-1 text-xs rounded-full ${
                                        customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }">
                                        ${customer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </p>
                                <p><strong>Joined:</strong> ${new Date(customer.date_joined).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-medium text-gray-900 mb-3">Order Summary</h4>
                            <div class="space-y-2">
                                <p><strong>Total Orders:</strong> ${orders.length}</p>
                                <p><strong>Total Spent:</strong> ₹${orders.reduce((sum, order) => sum + parseFloat(order.get_cart_total), 0).toFixed(2)}</p>
                                <p><strong>Average Order:</strong> ₹${orders.length > 0 ? (orders.reduce((sum, order) => sum + parseFloat(order.get_cart_total), 0) / orders.length).toFixed(2) : '0.00'}</p>
                                <p><strong>Last Order:</strong> ${orders.length > 0 ? new Date(orders[0].date_ordered).toLocaleDateString() : 'No orders'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-medium text-gray-900 mb-3">Order History</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button onclick="customerManager.closeModal()" 
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Close
                    </button>
                    <button onclick="customerManager.toggleCustomerStatus(${customer.id}, ${!customer.is_active})" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        ${customer.is_active ? 'Deactivate' : 'Activate'} Customer
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    async loadReviews() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/reviews/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.renderReviews(data.results || data);
                this.updateReviewStats(data.results || data);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    renderReviews(reviews) {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="text-gray-400 text-center py-8">No reviews found.</p>';
            return;
        }

        reviewsList.innerHTML = `
            <h3 class="text-white text-lg font-semibold mb-4">Product Reviews</h3>
            <div class="space-y-4">
                ${reviews.map(review => `
                    <div class="bg-[#0f0f14] p-4 rounded-lg border border-gray-800">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="text-white font-medium">${review.product_name}</h4>
                                <p class="text-gray-400 text-sm">by ${review.customer_name}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="flex text-yellow-400">
                                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                </div>
                                <span class="text-gray-400 text-sm">${review.rating}/5</span>
                            </div>
                        </div>
                        <p class="text-gray-300 text-sm mb-3">${review.comment}</p>
                        <div class="flex justify-between items-center text-xs text-gray-500">
                            <span>${new Date(review.created_at).toLocaleDateString()}</span>
                            <button onclick="customerManager.moderateReview(${review.id})" 
                                    class="text-red-400 hover:text-red-300">
                                Delete Review
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateReviewStats(reviews) {
        const totalReviews = reviews.length;
        const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
        const fiveStarReviews = reviews.filter(r => r.rating === 5).length;
        const recentReviews = reviews.filter(r => {
            const reviewDate = new Date(r.created_at);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return reviewDate > sevenDaysAgo;
        }).length;

        const elements = {
            'totalReviews': totalReviews,
            'avgRating': avgRating,
            'fiveStarReviews': fiveStarReviews,
            'recentReviews': recentReviews
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    async toggleCustomerStatus(customerId, activate) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/customers/${customerId}/toggle_active/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.loadCustomers();
                this.loadCustomerStats();
                this.closeModal();
                this.showSuccess(`Customer ${activate ? 'activated' : 'deactivated'} successfully`);
            }
        } catch (error) {
            console.error('Error toggling customer status:', error);
        }
    }

    async moderateReview(reviewId) {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/reviews/${reviewId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.loadReviews();
                this.showSuccess('Review deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    }

    closeModal() {
        const modal = document.getElementById('customerModal');
        if (modal) modal.classList.add('hidden');
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    renderPagination(data) {
        // Simple pagination implementation
        const pagination = document.getElementById('customersPagination');
        if (!pagination) return;

        const totalPages = Math.ceil(data.count / this.pageSize);
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        pagination.innerHTML = `
            <div class="flex justify-center space-x-2">
                <button ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="customerManager.goToPage(${this.currentPage - 1})"
                        class="px-3 py-1 border rounded ${this.currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                    Previous
                </button>
                <span class="px-3 py-1 bg-purple-500 text-white rounded">
                    ${this.currentPage} of ${totalPages}
                </span>
                <button ${this.currentPage === totalPages ? 'disabled' : ''} 
                        onclick="customerManager.goToPage(${this.currentPage + 1})"
                        class="px-3 py-1 border rounded ${this.currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                    Next
                </button>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadCustomers();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.customerManager = new CustomerManager();
});