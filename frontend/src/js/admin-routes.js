/**
 * Admin Route Protection Middleware
 * Ensures only authenticated admin users can access protected pages
 */

class AdminRouteProtection {
    constructor() {
        this.protectedPaths = [
            '/',
            '/products/',
            '/orders/',
            '/customers/',
            '/reviews/',
            '/reports/',
            '/settings/'
        ];
        this.publicPaths = [
            '/admin_login.html'
        ];
    }

    init() {
        // Check route protection on page load
        this.checkCurrentRoute();
        
        // Intercept navigation
        this.interceptNavigation();
        
        // Add user info to header
        this.updateUserInterface();
    }

    checkCurrentRoute() {
        const currentPath = window.location.pathname;
        
        // If on login page and authenticated, redirect to dashboard
        if (this.publicPaths.includes(currentPath) && window.adminAuth.isAuthenticated()) {
            window.location.href = '/';
            return;
        }
        
        // If on protected page and not authenticated, redirect to login
        if (this.isProtectedRoute(currentPath) && !window.adminAuth.isAuthenticated()) {
            window.adminAuth.logout();
            return;
        }
    }

    isProtectedRoute(path) {
        return this.protectedPaths.some(protectedPath => 
            path === protectedPath || path.startsWith(protectedPath)
        );
    }

    interceptNavigation() {
        // Intercept all navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (href.startsWith('http') || href.startsWith('#')) return;

            // Check if navigating to protected route
            if (this.isProtectedRoute(href) && !window.adminAuth.isAuthenticated()) {
                e.preventDefault();
                window.adminAuth.logout();
            }
        });
    }

    updateUserInterface() {
        if (!window.adminAuth.isAuthenticated()) return;

        const user = window.adminAuth.getUser();
        if (!user) return;

        // Update user info in header
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = user.first_name || user.username || user.email;
        });

        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(el => {
            el.textContent = user.email;
        });

        const userRoleElements = document.querySelectorAll('[data-user-role]');
        userRoleElements.forEach(el => {
            el.textContent = user.is_superuser ? 'Super Admin' : 'Admin';
        });

        // Show/hide elements based on permissions
        if (user.is_superuser) {
            document.querySelectorAll('[data-superuser-only]').forEach(el => {
                el.style.display = 'block';
            });
        }
    }

    // API Request Helper with Authentication
    async makeAuthenticatedRequest(url, options = {}) {
        try {
            const response = await window.adminAuth.authenticatedFetch(url, options);
            
            if (!response.ok) {
                if (response.status === 401) {
                    window.adminAuth.logout();
                    throw new Error('Authentication required');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Show loading state
    showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="flex items-center justify-center p-4"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>';
        }
    }

    // Show error state
    showError(element, message) {
        if (element) {
            element.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">${message}</div>`;
        }
    }

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    // Format date
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Global instance
window.adminRoutes = new AdminRouteProtection();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminRoutes.init();
});