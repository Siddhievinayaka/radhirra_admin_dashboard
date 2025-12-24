from django.urls import path, include
from . import views

urlpatterns = [
    # Admin login
    path("admin_login/", views.admin_login_view, name="admin_login"),
    path("admin_login.html", views.admin_login_view, name="admin_login_html"),
    
    # Frontend views
    path("", views.index_view, name="dashboard_content"),
    path("products/", views.products_view, name="products"),
    path("orders/", views.orders_view, name="orders"),
    
    # Image upload API
    path("api/upload-product-image/", views.upload_product_image_api, name="upload_product_image"),
    
    # DRF API endpoints
    path("", include('dashboard.api_urls')),
]
