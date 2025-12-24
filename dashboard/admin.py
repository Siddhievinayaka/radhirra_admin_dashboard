from django.contrib import admin
from .models import (
    CustomUser, UserProfile, Category, Product, ProductImage,
    Order, OrderItem, ShippingAddress, Cart, CartItem, Review
)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'date_joined']
    search_fields = ['email', 'username', 'first_name', 'last_name']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'city', 'state']
    search_fields = ['user__email', 'phone', 'city']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'regular_price', 'sale_price', 'category', 'is_featured', 'is_new_arrival', 'is_best_seller']
    list_filter = ['category', 'is_featured', 'is_new_arrival', 'is_best_seller']
    search_fields = ['name', 'sku']
    list_editable = ['is_featured', 'is_new_arrival', 'is_best_seller']

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_main']
    list_filter = ['is_main']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'date_ordered', 'complete', 'transaction_id']
    list_filter = ['complete', 'date_ordered']
    search_fields = ['id', 'user__email', 'transaction_id']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'date_added']
    list_filter = ['date_added']

@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'order', 'city', 'state', 'zipcode']
    search_fields = ['user__email', 'city', 'state']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__email']
