/**
 * Admin Authentication and Token Management
 * Handles JWT tokens, user sessions, and API authentication
 */

class AdminAuthManager {
    constructor() {
        this.baseURL = window.location.origin;
        this.tokenKey = 'access_token';
        this.refreshKey = 'refresh_token';
        this.userKey = 'admin_user';
    }

    // Token Management
    getAccessToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getRefreshToken() {
        return localStorage.getItem(this.refreshKey);
    }

    setTokens(accessToken, refreshToken) {
        localStorage.setItem(this.tokenKey, accessToken);
        localStorage.setItem(this.refreshKey, refreshToken);
    }

    clearTokens() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshKey);
        localStorage.removeItem(this.userKey);
    }

    // User Management
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Authentication Status
    isAuthenticated() {
        const token = this.getAccessToken();
        const user = this.getUser();
        return !!(token && user && (user.is_staff || user.is_superuser));
    }

    // Token Validation
    isTokenExpired(token) {
        if (!token) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    // Token Refresh
    async refreshAccessToken() {
        const refreshToken = this.getRefreshToken();
        
        if (!refreshToken || this.isTokenExpired(refreshToken)) {
            this.logout();
            return null;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access, refreshToken);
                return data.access;
            } else {
                this.logout();
                return null;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
            return null;
        }
    }

    // API Request with Auto Token Refresh
    async authenticatedFetch(url, options = {}) {
        let token = this.getAccessToken();

        // Check if token is expired and refresh if needed
        if (!token || this.isTokenExpired(token)) {
            token = await this.refreshAccessToken();
            if (!token) {
                throw new Error('Authentication required');
            }
        }

        // Add authorization header
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // If token is invalid, try to refresh once
        if (response.status === 401) {
            token = await this.refreshAccessToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                return fetch(url, { ...options, headers });
            }
        }

        return response;
    }

    // Login
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setTokens(data.access, data.refresh);
                this.setUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.detail || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    }

    // Logout
    logout() {
        this.clearTokens();
        window.location.href = '/admin_login.html';
    }

    // Route Protection
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.logout();
            return false;
        }
        return true;
    }

    // Initialize Auth Check
    init() {
        // Check authentication on page load
        if (window.location.pathname !== '/admin_login.html' && !this.isAuthenticated()) {
            this.logout();
        }

        // Add logout functionality to logout buttons
        document.addEventListener('DOMContentLoaded', () => {
            const logoutBtns = document.querySelectorAll('[data-logout]');
            logoutBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            });
        });

        // Auto-refresh token before expiry
        this.startTokenRefreshTimer();
    }

    // Auto Token Refresh Timer
    startTokenRefreshTimer() {
        const token = this.getAccessToken();
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expiryTime - currentTime;
            
            // Refresh token 5 minutes before expiry
            const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000);
            
            setTimeout(() => {
                this.refreshAccessToken().then(() => {
                    this.startTokenRefreshTimer(); // Restart timer
                });
            }, refreshTime);
        } catch (error) {
            console.error('Token refresh timer error:', error);
        }
    }
}

// Global instance
window.adminAuth = new AdminAuthManager();

// Initialize on page load
window.adminAuth.init();