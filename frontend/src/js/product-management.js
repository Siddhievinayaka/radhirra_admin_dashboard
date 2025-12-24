/**
 * Enhanced Product Management System
 * Integrates with Django REST API for full CRUD operations
 */

class ProductManager {
    constructor() {
        this.baseURL = window.location.origin;
        this.currentPage = 1;
        this.pageSize = 20;
        this.searchQuery = '';
        this.categoryFilter = '';
        this.statusFilter = '';
        this.selectedProducts = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
        this.loadCategories();
        this.loadStatistics();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            }, 300));
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.categoryFilter = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.currentPage = 1;
                this.loadProducts();
            });
        }

        // Add product button
        const addProductBtn = document.getElementById('openAddProductModal');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.openAddProductModal());
        }

        // Bulk operations
        const bulkActions = document.getElementById('bulkActions');
        if (bulkActions) {
            bulkActions.addEventListener('change', (e) => {
                if (e.target.value && this.selectedProducts.size > 0) {
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

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async loadProducts() {
        try {
            this.showLoading();
            
            const params = new URLSearchParams({
                page: this.currentPage,
                page_size: this.pageSize
            });

            if (this.searchQuery) params.append('search', this.searchQuery);
            if (this.categoryFilter) params.append('category', this.categoryFilter);
            if (this.statusFilter) params.append('status', this.statusFilter);

            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/products/?${params}`
            );
            
            const data = await response.json();
            this.renderProducts(data.results);
            
        } catch (error) {
            console.error('Error loading products:', error);
            // this.showError('Failed to load products');
        }
    }

    async loadCategories() {
        try {
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/categories/`
            );
            const data = await response.json();
            this.renderCategoryFilter(data.results || data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadStatistics() {
        try {
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/products/statistics/`
            );
            const stats = await response.json();
            this.renderStatistics(stats);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    renderProducts(products) {
        const productGrid = document.getElementById('productGrid');
        const noResults = document.getElementById('noResults');
        
        if (!productGrid) return;

        if (products.length === 0) {
            productGrid.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            return;
        }

        if (noResults) noResults.classList.add('hidden');

        productGrid.innerHTML = products.map(product => `
            <div class="product-card bg-[#1a1a1f] rounded-lg border border-gray-800 overflow-hidden hover:border-teal-500 transition-colors">
                <div class="relative">
                    <input type="checkbox" class="product-checkbox absolute top-3 left-3 z-10" 
                           data-product-id="${product.id}" 
                           ${this.selectedProducts.has(product.id) ? 'checked' : ''}>
                    <img src="${product.main_image_url || 'https://placehold.co/400x300/1a1a1f/6b7280?text=No+Image'}" 
                         alt="${product.name}" 
                         class="w-full h-40 sm:h-48 object-contain">
                    <div class="absolute top-3 right-3 flex gap-2">
                        ${product.is_featured ? '<span class="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Featured</span>' : ''}
                        ${product.is_new_arrival ? '<span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>' : ''}
                        ${product.is_best_seller ? '<span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Bestseller</span>' : ''}
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="text-white font-semibold text-base sm:text-lg mb-1">${product.name}</h3>
                    <p class="text-gray-500 text-xs sm:text-sm mb-2">SKU: ${product.sku || 'N/A'}</p>
                    <p class="text-gray-400 text-xs mb-2">Category: ${product.category_name || 'Uncategorized'}</p>
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-teal-400 text-lg font-bold">₹${product.sale_price || product.regular_price}</span>
                        ${product.sale_price ? `<span class="text-gray-500 text-sm line-through">₹${product.regular_price}</span>` : ''}
                        ${product.discount_percentage > 0 ? `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded">${product.discount_percentage}% OFF</span>` : ''}
                    </div>
                    <div class="flex gap-2 pt-3 border-t border-gray-800">
                        <button class="edit-product-btn flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm" 
                                data-product-id="${product.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Edit
                        </button>
                        <button class="delete-product-btn bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors" 
                                data-product-id="${product.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to new elements
        this.attachProductEventListeners();
    }

    renderCategoryFilter(categories) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        const currentValue = categoryFilter.value;
        categoryFilter.innerHTML = `
            <option value="">All Categories</option>
            ${categories.map(category => 
                `<option value="${category.id}" ${currentValue == category.id ? 'selected' : ''}>${category.name}</option>`
            ).join('')}
        `;
    }

    renderStatistics(stats) {
        const elements = {
            totalProducts: document.querySelector('[data-stat="total-products"]'),
            featuredProducts: document.querySelector('[data-stat="featured-products"]'),
            newArrivals: document.querySelector('[data-stat="new-arrivals"]'),
            bestSellers: document.querySelector('[data-stat="best-sellers"]')
        };

        if (elements.totalProducts) elements.totalProducts.textContent = stats.total_products || 0;
        if (elements.featuredProducts) elements.featuredProducts.textContent = stats.featured_products || 0;
        if (elements.newArrivals) elements.newArrivals.textContent = stats.new_arrivals || 0;
        if (elements.bestSellers) elements.bestSellers.textContent = stats.best_sellers || 0;
    }

    attachProductEventListeners() {
        // Product checkboxes
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                if (e.target.checked) {
                    this.selectedProducts.add(productId);
                } else {
                    this.selectedProducts.delete(productId);
                }
                this.updateBulkActionsVisibility();
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.productId;
                this.openEditProductModal(productId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.productId;
                this.deleteProduct(productId);
            });
        });
    }

    async performBulkAction(action) {
        if (this.selectedProducts.size === 0) return;

        const productIds = Array.from(this.selectedProducts);
        
        try {
            let updateData = { ids: productIds };
            
            switch (action) {
                case 'feature':
                    updateData.is_featured = true;
                    break;
                case 'unfeature':
                    updateData.is_featured = false;
                    break;
                case 'new_arrival':
                    updateData.is_new_arrival = true;
                    break;
                case 'bestseller':
                    updateData.is_best_seller = true;
                    break;
                case 'delete':
                    if (!confirm(`Delete ${productIds.length} selected products?`)) return;
                    await this.bulkDeleteProducts(productIds);
                    return;
            }

            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/products/bulk_update/`,
                {
                    method: 'POST',
                    body: JSON.stringify(updateData)
                }
            );

            if (response.ok) {
                this.selectedProducts.clear();
                this.loadProducts();
                this.showSuccess(`Bulk action completed successfully`);
            }
        } catch (error) {
            console.error('Bulk action failed:', error);
            this.showError('Bulk action failed');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/products/${productId}/`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                this.loadProducts();
                this.loadStatistics();
                this.showSuccess('Product deleted successfully');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            this.showError('Failed to delete product');
        }
    }

    async bulkDeleteProducts(productIds) {
        try {
            let deletedCount = 0;
            for (const productId of productIds) {
                const response = await window.adminRoutes.makeAuthenticatedRequest(
                    `${this.baseURL}/api/products/${productId}/`,
                    { method: 'DELETE' }
                );
                if (response.ok) deletedCount++;
            }
            
            this.selectedProducts.clear();
            this.loadProducts();
            this.loadStatistics();
            this.showSuccess(`${deletedCount} products deleted successfully`);
        } catch (error) {
            console.error('Bulk delete failed:', error);
            this.showError('Failed to delete products');
        }
    }

    openAddProductModal() {
        const modal = document.getElementById('addProductModal');
        const modalContent = document.getElementById('addProductModalContent');
        
        if (modal && modalContent) {
            // Load categories into the dropdown
            this.loadCategoriesIntoModal();
            
            // Show modal with animation
            modal.classList.remove('hidden');
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
            
            // Setup form submission
            this.setupAddProductForm();
        }
    }

    async openEditProductModal(productId) {
        try {
            console.log('Loading product:', productId);
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/products/${productId}/`
            );
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const product = await response.json();
            console.log('Product data:', product);
            this.showEditModal(product);
        } catch (error) {
            console.error('Error loading product:', error);
            this.showError(`Failed to load product data: ${error.message}`);
        }
    }

    showEditModal(product) {
        const modal = document.getElementById('editProductModal');
        if (!modal) {
            this.showError('Edit modal not found. Please ensure the edit modal HTML is present.');
            return;
        }
        
        const modalContent = document.getElementById('editProductModalContent');
        
        // Safely populate form fields
        const setFieldValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value || '';
        };
        
        const setCheckboxValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.checked = value || false;
        };
        
        setFieldValue('editProductName', product.name);
        setFieldValue('editProductSku', product.sku);
        setFieldValue('editProductDescription', product.description);
        setFieldValue('editRegularPrice', product.regular_price);
        setFieldValue('editSalePrice', product.sale_price);
        setFieldValue('editProductCategory', product.category);
        setFieldValue('editProductStatus', product.status || 'active');
        setFieldValue('editProductSize', product.size);
        setFieldValue('editProductSleeve', product.sleeve);
        setFieldValue('editProductMaterial', product.material);
        setFieldValue('editProductSpecs', product.specifications);
        setFieldValue('editSellerInfo', product.seller_information);
        setCheckboxValue('editIsFeatured', product.is_featured);
        setCheckboxValue('editIsNewArrival', product.is_new_arrival);
        setCheckboxValue('editIsBestSeller', product.is_best_seller);
        
        // Store product ID for update
        modal.dataset.productId = product.id;
        
        // Load categories
        this.loadCategoriesIntoEditModal();
        
        // Show modal
        modal.classList.remove('hidden');
        if (modalContent) {
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
        
        // Setup form submission
        this.setupEditProductForm();
    }

    async loadCategoriesIntoEditModal() {
        try {
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/categories/`
            );
            const data = await response.json();
            const categorySelect = document.getElementById('editProductCategory');
            
            if (categorySelect) {
                const currentValue = categorySelect.value;
                categorySelect.innerHTML = `
                    <option value="">Select Category</option>
                    ${(data.results || data).map(category => 
                        `<option value="${category.id}" ${currentValue == category.id ? 'selected' : ''}>${category.name}</option>`
                    ).join('')}
                `;
            }
        } catch (error) {
            console.error('Error loading categories for edit modal:', error);
        }
    }

    setupEditProductForm() {
        const form = document.getElementById('editProductForm');
        const closeBtn = document.getElementById('closeEditProductModal');
        
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.updateProduct();
            };
        }
        
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal('editProductModal');
        }
    }

    async updateProduct() {
        try {
            const modal = document.getElementById('editProductModal');
            const productId = modal.dataset.productId;
            const formData = this.getEditFormData();
            
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/products/${productId}/`,
                {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                // Upload images if selected
                try {
                    if (window.imageUploader) {
                        await window.imageUploader.uploadEditImages(productId);
                    }
                } catch (imageError) {
                    console.warn('Image upload failed:', imageError);
                }
                
                this.closeModal('editProductModal');
                this.loadProducts();
                this.loadStatistics();
                window.imageUploader?.clearPreviews();
                this.showSuccess('Product updated successfully');
            } else {
                const responseText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = JSON.stringify(errorData);
                } catch {
                    errorMessage = `HTTP ${response.status}: Server returned HTML instead of JSON`;
                }
                this.showError('Failed to update product: ' + errorMessage);
            }
        } catch (error) {
            console.error('Update product failed:', error);
            this.showError('Failed to update product: ' + error.message);
        }
    }

    getEditFormData() {
        return {
            name: document.getElementById('editProductName')?.value || '',
            sku: document.getElementById('editProductSku')?.value || '',
            description: document.getElementById('editProductDescription')?.value || '',
            regular_price: parseFloat(document.getElementById('editRegularPrice')?.value) || 0,
            sale_price: parseFloat(document.getElementById('editSalePrice')?.value) || null,
            category: document.getElementById('editProductCategory')?.value || null,
            status: document.getElementById('editProductStatus')?.value || 'active',
            size: document.getElementById('editProductSize')?.value || '',
            sleeve: document.getElementById('editProductSleeve')?.value || '',
            material: document.getElementById('editProductMaterial')?.value || '',
            specifications: document.getElementById('editProductSpecs')?.value || '',
            seller_information: document.getElementById('editSellerInfo')?.value || '',
            is_featured: document.getElementById('editIsFeatured')?.checked || false,
            is_new_arrival: document.getElementById('editIsNewArrival')?.checked || false,
            is_best_seller: document.getElementById('editIsBestSeller')?.checked || false
        };
    }

    showLoading() {
        const productGrid = document.getElementById('productGrid');
        if (productGrid) {
            productGrid.innerHTML = '<div class="col-span-full flex justify-center py-12"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>';
        }
    }

    showError(message) {
        // Simple error display - can be enhanced with toast notifications
        console.error(message);
        alert(message);
    }

    showSuccess(message) {
        // Simple success display - can be enhanced with toast notifications
        console.log(message);
        alert(message);
    }

    updateBulkActionsVisibility() {
        const bulkActionsContainer = document.getElementById('bulkActionsContainer');
        const selectedCount = document.getElementById('selectedCount');
        
        if (bulkActionsContainer) {
            if (this.selectedProducts.size > 0) {
                bulkActionsContainer.classList.remove('hidden');
                if (selectedCount) {
                    selectedCount.textContent = `${this.selectedProducts.size} selected`;
                }
            } else {
                bulkActionsContainer.classList.add('hidden');
            }
        }
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const productId = parseInt(checkbox.dataset.productId);
            if (checked) {
                this.selectedProducts.add(productId);
            } else {
                this.selectedProducts.delete(productId);
            }
        });
        this.updateBulkActionsVisibility();
    }

    async loadCategoriesIntoModal() {
        try {
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/categories/`
            );
            const data = await response.json();
            const categorySelect = document.getElementById('productCategory');
            
            if (categorySelect) {
                categorySelect.innerHTML = `
                    <option value="">Select Category</option>
                    ${(data.results || data).map(category => 
                        `<option value="${category.id}">${category.name}</option>`
                    ).join('')}
                `;
            }
        } catch (error) {
            console.error('Error loading categories for modal:', error);
        }
    }

    setupAddProductForm() {
        const form = document.getElementById('addProductForm');
        const closeBtn = document.getElementById('closeAddProductModal');
        
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.createProduct();
            };
        }
        
        if (closeBtn) {
            closeBtn.onclick = () => this.closeModal('addProductModal');
        }
    }

    async createProduct() {
        try {
            const formData = this.getFormData();
            console.log('Sending product data:', formData);
            
            const response = await window.adminRoutes.makeAuthenticatedRequest(
                `${this.baseURL}/api/products/`,
                {
                    method: 'POST',
                    body: JSON.stringify(formData)
                }
            );

            if (response.ok) {
                const productData = await response.json();
                console.log('Product created:', productData);
                
                // Upload images if selected (but don't fail if upload fails)
                try {
                    if (window.imageUploader) {
                        await window.imageUploader.uploadImages(productData.id);
                    }
                } catch (imageError) {
                    console.warn('Image upload failed:', imageError);
                }
                
                this.closeModal('addProductModal');
                this.loadProducts();
                this.loadStatistics();
                window.imageUploader?.clearPreviews();
                this.showSuccess('Product created successfully');
            } else {
                const responseText = await response.text();
                console.error('Create failed. Status:', response.status, 'Response:', responseText);
                
                let errorMessage;
                try {
                    const errorData = JSON.parse(responseText);
                    console.error('Validation errors:', errorData);
                    errorMessage = Object.entries(errorData).map(([field, errors]) => 
                        `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
                    ).join('\n');
                } catch {
                    errorMessage = `HTTP ${response.status}: ${responseText}`;
                }
                this.showError('Failed to create product:\n' + errorMessage);
            }
        } catch (error) {
            console.error('Create product failed:', error);
            this.showError('Failed to create product: ' + error.message);
        }
    }

    getFormData() {
        return {
            name: document.getElementById('productName')?.value || '',
            sku: document.getElementById('productSku')?.value || '',
            description: document.getElementById('productDescription')?.value || '',
            regular_price: parseFloat(document.getElementById('regularPrice')?.value) || 0,
            sale_price: parseFloat(document.getElementById('salePrice')?.value) || null,
            category: document.getElementById('productCategory')?.value || null,
            size: document.getElementById('productSize')?.value || '',
            sleeve: document.getElementById('productSleeve')?.value || '',
            material: document.getElementById('productMaterial')?.value || '',
            specifications: document.getElementById('productSpecs')?.value || '',
            seller_information: document.getElementById('sellerInfo')?.value || '',
            is_featured: document.getElementById('isFeatured')?.checked || false,
            is_new_arrival: document.getElementById('isNewArrival')?.checked || false,
            is_best_seller: document.getElementById('isBestSeller')?.checked || false
        };
    }



    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const modalContent = modal?.querySelector('[id$="ModalContent"]');
        
        if (modal && modalContent) {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('products')) {
        window.productManager = new ProductManager();
    }
});