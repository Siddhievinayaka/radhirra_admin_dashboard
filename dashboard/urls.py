from django.urls import path
from . import views

urlpatterns = [
    path("", views.index_view, name="dashboard_content"),
    path("products/", views.products_view, name="products"),
    path("orders/", views.orders_view, name="orders"),
    path("api/products/add/", views.add_product, name="add_product"),
    path("api/products/get/<int:product_id>/", views.get_product, name="get_product"),
    path("api/products/edit/<int:product_id>/", views.edit_product, name="edit_product"),
    path("api/products/delete/<int:product_id>/", views.delete_product, name="delete_product"),
]
