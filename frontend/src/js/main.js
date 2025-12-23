document.addEventListener('DOMContentLoaded', function () {
    const addProductModal = document.getElementById('addProductModal');
    const addProductModalContent = document.getElementById('addProductModalContent');
    const openAddProductModalBtn = document.getElementById('openAddProductModal');
    const closeAddProductModalBtn = document.getElementById('closeAddProductModal');
    const addProductForm = document.getElementById('addProductForm');

    const editProductModal = document.getElementById('editProductModal');
    const editProductModalContent = document.getElementById('editProductModalContent');
    const closeEditProductModalBtn = document.getElementById('closeEditProductModal');
    const editProductForm = document.getElementById('editProductForm');

    function openModal(modal, content) {
        if (!modal || !content) return;
        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    function closeModal(modal, content, form) {
        if (!modal || !content) return;
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
            if (form) form.reset();
        }, 300);
    }

    openAddProductModalBtn?.addEventListener('click', () => openModal(addProductModal, addProductModalContent));
    closeAddProductModalBtn?.addEventListener('click', () => closeModal(addProductModal, addProductModalContent, addProductForm));
    closeEditProductModalBtn?.addEventListener('click', () => closeModal(editProductModal, editProductModalContent, editProductForm));

    if (addProductModal) {
        addProductModal.addEventListener('click', function (event) {
            if (event.target === addProductModal) closeModal(addProductModal, addProductModalContent, addProductForm);
        });
    }

    if (editProductModal) {
        editProductModal.addEventListener('click', function (event) {
            if (event.target === editProductModal) closeModal(editProductModal, editProductModalContent, editProductForm);
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            if (!addProductModal.classList.contains('hidden')) closeModal(addProductModal, addProductModalContent, addProductForm);
            if (!editProductModal.classList.contains('hidden')) closeModal(editProductModal, editProductModalContent, editProductForm);
        }
    });

    // Add product form submission
    if (addProductForm) {
        addProductForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('name', document.getElementById('productName').value);
            formData.append('sku', document.getElementById('productSku').value);
            formData.append('description', document.getElementById('productDescription').value);
            formData.append('regular_price', document.getElementById('regularPrice').value);
            formData.append('sale_price', document.getElementById('salePrice').value);
            formData.append('stock_quantity', document.getElementById('stockQuantity').value);
            formData.append('status', document.getElementById('productStatus').value);
            formData.append('category', document.getElementById('productCategory').value);
            formData.append('material', document.getElementById('productMaterial').value);
            formData.append('specifications', document.getElementById('productSpecs').value);
            formData.append('seller_info', document.getElementById('sellerInfo').value);
            
            const mainImage = document.getElementById('mainImage').files[0];
            const subImages = document.getElementById('subImages').files[0];
            
            if (mainImage) formData.append('main_image', mainImage);
            if (subImages) formData.append('sub_images', subImages);

            try {
                const response = await fetch('/api/products/add/', {
                    method: 'POST',
                    headers: {'X-CSRFToken': getCookie('csrftoken')},
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    closeModal(addProductModal, addProductModalContent, addProductForm);
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error adding product: ' + error.message);
            }
        });
    }

    // Edit product buttons
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const productId = this.dataset.productId;
            
            try {
                const response = await fetch(`/api/products/get/${productId}/`);
                const result = await response.json();
                
                if (result.success) {
                    const product = result.product;
                    document.getElementById('editProductId').value = product.id;
                    document.getElementById('editProductName').value = product.name;
                    document.getElementById('editProductSku').value = product.sku;
                    document.getElementById('editProductDescription').value = product.description;
                    document.getElementById('editRegularPrice').value = product.regular_price;
                    document.getElementById('editSalePrice').value = product.sale_price;
                    document.getElementById('editStockQuantity').value = product.stock_quantity;
                    document.getElementById('editProductStatus').value = product.status;
                    document.getElementById('editProductCategory').value = product.category;
                    document.getElementById('editProductMaterial').value = product.material;
                    document.getElementById('editProductSpecs').value = product.specifications;
                    document.getElementById('editSellerInfo').value = product.seller_info;
                    
                    openModal(editProductModal, editProductModalContent);
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error loading product: ' + error.message);
            }
        });
    });

    // Edit product form submission
    if (editProductForm) {
        editProductForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const productId = document.getElementById('editProductId').value;
            const formData = new FormData();
            formData.append('name', document.getElementById('editProductName').value);
            formData.append('sku', document.getElementById('editProductSku').value);
            formData.append('description', document.getElementById('editProductDescription').value);
            formData.append('regular_price', document.getElementById('editRegularPrice').value);
            formData.append('sale_price', document.getElementById('editSalePrice').value);
            formData.append('stock_quantity', document.getElementById('editStockQuantity').value);
            formData.append('status', document.getElementById('editProductStatus').value);
            formData.append('category', document.getElementById('editProductCategory').value);
            formData.append('material', document.getElementById('editProductMaterial').value);
            formData.append('specifications', document.getElementById('editProductSpecs').value);
            formData.append('seller_info', document.getElementById('editSellerInfo').value);
            
            const mainImage = document.getElementById('editMainImage').files[0];
            const subImages = document.getElementById('editSubImages').files[0];
            
            if (mainImage) formData.append('main_image', mainImage);
            if (subImages) formData.append('sub_images', subImages);

            try {
                const response = await fetch(`/api/products/edit/${productId}/`, {
                    method: 'POST',
                    headers: {'X-CSRFToken': getCookie('csrftoken')},
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    closeModal(editProductModal, editProductModalContent, editProductForm);
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error updating product: ' + error.message);
            }
        });
    }

    // Delete product
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!confirm('Are you sure you want to delete this product?')) return;
            
            const productId = this.dataset.productId;
            try {
                const response = await fetch(`/api/products/delete/${productId}/`, {
                    method: 'POST',
                    headers: {'X-CSRFToken': getCookie('csrftoken')}
                });

                const result = await response.json();
                if (result.success) {
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Error deleting product: ' + error.message);
            }
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Search and filter functionality
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.getElementById('noResults');
    const productGrid = document.getElementById('productGrid');

    function filterProducts() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const statusValue = statusFilter?.value || '';
        let visibleCount = 0;

        productCards.forEach(card => {
            const name = card.dataset.name || '';
            const sku = card.dataset.sku || '';
            const price = card.dataset.price || '';
            const category = card.dataset.category || '';
            const status = card.dataset.status || '';

            const matchesSearch = !searchTerm || 
                name.includes(searchTerm) || 
                sku.includes(searchTerm) || 
                price.includes(searchTerm) || 
                category.includes(searchTerm);
            
            const matchesStatus = !statusValue || status === statusValue;

            if (matchesSearch && matchesStatus) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noResults) {
            noResults.classList.toggle('hidden', visibleCount > 0);
        }
    }

    searchInput?.addEventListener('input', filterProducts);
    statusFilter?.addEventListener('change', filterProducts);

    // Orders search and filter
    const orderSearchInput = document.getElementById('orderSearchInput');
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    const orderRows = document.querySelectorAll('.order-row');
    const orderCards = document.querySelectorAll('.order-card');
    const noOrderResults = document.getElementById('noOrderResults');

    function filterOrders() {
        const searchTerm = orderSearchInput?.value.toLowerCase() || '';
        const statusValue = orderStatusFilter?.value || '';
        let visibleCount = 0;

        [...orderRows, ...orderCards].forEach(item => {
            const orderId = item.dataset.orderId || '';
            const customer = item.dataset.customer || '';
            const status = item.dataset.status || '';

            const matchesSearch = !searchTerm || orderId.includes(searchTerm) || customer.includes(searchTerm);
            const matchesStatus = !statusValue || status === statusValue;

            if (matchesSearch && matchesStatus) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        if (noOrderResults) {
            noOrderResults.classList.toggle('hidden', visibleCount > 0);
        }
    }

    orderSearchInput?.addEventListener('input', filterOrders);
    orderStatusFilter?.addEventListener('change', filterOrders);

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');

    sidebarToggle?.addEventListener('click', function() {
        sidebar?.classList.toggle('-translate-x-full');
        menuIcon?.classList.toggle('hidden');
        closeIcon?.classList.toggle('hidden');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth < 1024 && sidebar && sidebarToggle) {
            if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
                sidebar.classList.add('-translate-x-full');
                menuIcon?.classList.remove('hidden');
                closeIcon?.classList.add('hidden');
            }
        }
    });

    
    const navLinks = document.getElementsByClassName('nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          prompt("H");
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        this.classList.add('active');
      });
    });
  
});
