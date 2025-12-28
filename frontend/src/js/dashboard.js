class Dashboard {
    constructor() {
        this.apiBaseUrl = '/api';
        this.init();
    }

    init() {
        this.loadDashboardData();
        setInterval(() => this.loadDashboardData(), 30000); // Refresh every 30 seconds
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadCustomerStats(),
                this.loadOrderStats(),
                this.loadProductStats(),
                this.loadRevenueStats(),
                this.loadTopProducts()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadCustomerStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                document.getElementById('totalCustomers').textContent = data.count || 0;
            }
        } catch (error) {
            console.error('Error loading customer stats:', error);
        }
    }

    async loadOrderStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/statistics/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('totalOrders').textContent = stats.total_orders || 0;
                document.querySelector('[data-metric="today-orders"]').textContent = stats.today_orders || 0;
                document.querySelector('[data-metric="pending"]').textContent = stats.pending_orders || 0;
            }
        } catch (error) {
            console.error('Error loading order stats:', error);
        }
    }

    async loadProductStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/products/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                document.getElementById('totalProducts').textContent = data.count || 0;
                
                // Low stock calculation (assuming stock < 10 is low)
                const lowStockCount = data.results ? data.results.filter(p => p.stock_quantity < 10).length : 0;
                document.querySelector('[data-metric="low-stock"]').textContent = lowStockCount;
            }
        } catch (error) {
            console.error('Error loading product stats:', error);
        }
    }

    async loadRevenueStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/orders/statistics/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('totalRevenue').textContent = `₹${parseFloat(stats.total_revenue || 0).toFixed(2)}`;
                document.querySelector('[data-metric="today-revenue"]').textContent = `₹${parseFloat(stats.today_revenue || 0).toFixed(2)}`;
            }
        } catch (error) {
            console.error('Error loading revenue stats:', error);
        }
    }

    async loadTopProducts() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/products/?ordering=-stock_quantity&page_size=5`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                this.renderTopProducts(data.results || []);
            }
        } catch (error) {
            console.error('Error loading top products:', error);
        }
    }

    renderTopProducts(products) {
        const container = document.querySelector('.bg-\\[\\#1a1a1f\\].rounded-xl.p-4.sm\\:p-6.border.border-gray-800:nth-child(2) .space-y-3');
        if (!container) return;

        container.innerHTML = products.slice(0, 3).map(product => `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 sm:gap-3">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-[#b48cf2] bg-opacity-10 rounded-lg"></div>
                    <div>
                        <div class="text-white text-xs sm:text-sm font-medium">${product.name}</div>
                        <div class="text-gray-500 text-xs">Stock: ${product.stock_quantity || 0}</div>
                    </div>
                </div>
                <div class="text-green-500 text-xs sm:text-sm font-semibold">₹${parseFloat(product.regular_price || 0).toFixed(2)}</div>
            </div>
        `).join('') || '<div class="text-gray-500 text-sm">No products found</div>';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});