class DashboardManager {
    constructor() {
        this.apiBaseUrl = '/api';
        this.init();
    }

    init() {
        this.loadDashboardData();
        setInterval(() => this.loadDashboardData(), 30000);
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadCustomerStats(),
                this.loadOrderStats(),
                this.loadProductStats(),
                this.loadRevenueStats(),
                this.loadTopProducts(),
                this.loadQuickStats()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadCustomerStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/customers/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                document.getElementById('totalCustomers').textContent = data.count || data.length || 0;
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
                
                // Today's orders - filter by today's date
                const today = new Date().toISOString().split('T')[0];
                const todayOrdersResponse = await fetch(`${this.apiBaseUrl}/orders/?date_ordered__date=${today}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                });
                if (todayOrdersResponse.ok) {
                    const todayData = await todayOrdersResponse.json();
                    document.querySelector('[data-metric="today-orders"]').textContent = todayData.count || 0;
                }
                
                document.querySelector('[data-metric="pending"]').textContent = stats.pending_orders || 0;
                
                // Update revenue breakdown
                document.getElementById('completedRevenue').textContent = `₹${parseFloat(stats.completed_revenue || 0).toFixed(2)}`;
                document.getElementById('pendingRevenue').textContent = `₹${parseFloat(stats.pending_revenue || 0).toFixed(2)}`;
                document.getElementById('averageOrder').textContent = `₹${parseFloat(stats.average_order_value || 0).toFixed(2)}`;
                
                // Update order status bars with confirmed
                const total = stats.total_orders || 1;
                const completedPercent = Math.round((stats.completed_orders || 0) / total * 100);
                const confirmedPercent = Math.round((stats.confirmed_orders || 0) / total * 100);
                const pendingPercent = Math.round((stats.pending_orders || 0) / total * 100);
                
                document.getElementById('completedBar').style.width = `${completedPercent}%`;
                document.getElementById('confirmedBar').style.width = `${confirmedPercent}%`;
                document.getElementById('pendingBar').style.width = `${pendingPercent}%`;
                document.getElementById('completedPercent').textContent = `${completedPercent}%`;
                document.getElementById('confirmedPercent').textContent = `${confirmedPercent}%`;
                document.getElementById('pendingPercent').textContent = `${pendingPercent}%`;
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
            const response = await fetch(`${this.apiBaseUrl}/products/?is_best_seller=true&page_size=5`, {
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
        const container = document.querySelector('.space-y-3.sm\\:space-y-4');
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

    async loadQuickStats() {
        try {
            const [categoriesRes, reviewsRes, imagesRes] = await Promise.all([
                fetch(`${this.apiBaseUrl}/categories/`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                }),
                fetch(`${this.apiBaseUrl}/reviews/`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                }),
                fetch(`${this.apiBaseUrl}/product-images/`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
                })
            ]);

            if (categoriesRes.ok) {
                const categories = await categoriesRes.json();
                document.getElementById('totalCategories').textContent = categories.count || 0;
            }

            if (reviewsRes.ok) {
                const reviews = await reviewsRes.json();
                document.getElementById('totalReviews').textContent = reviews.count || 0;
                
                if (reviews.results && reviews.results.length > 0) {
                    const avgRating = reviews.results.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.results.length;
                    document.getElementById('avgRating').textContent = `${avgRating.toFixed(1)}★`;
                }
            }

            if (imagesRes.ok) {
                const images = await imagesRes.json();
                document.getElementById('totalImages').textContent = images.count || 0;
            }
        } catch (error) {
            console.error('Error loading quick stats:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});