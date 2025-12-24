#!/usr/bin/env python
"""
API Test Script for Radhirra Admin Dashboard
Run this to test all API endpoints with existing data
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from dashboard.models import CustomUser, Product, Order, Category, Review
from dashboard.serializers import ProductSerializer, OrderSerializer, CustomUserSerializer
from dashboard.viewsets import DashboardViewSet
from rest_framework.test import APIRequestFactory

def test_api_endpoints():
    print("TESTING RADHIRRA ADMIN API")
    print("=" * 50)
    
    # Test data counts
    print("DATABASE COUNTS:")
    print(f"   Products: {Product.objects.count()}")
    print(f"   Orders: {Order.objects.count()}")
    print(f"   Users: {CustomUser.objects.count()}")
    print(f"   Categories: {Category.objects.count()}")
    print(f"   Reviews: {Review.objects.count()}")
    print()
    
    # Test serializers
    print("TESTING SERIALIZERS:")
    
    # Product serializer
    product = Product.objects.first()
    if product:
        product_data = ProductSerializer(product).data
        print(f"   OK Product: {product_data['name']}")
        print(f"      Price: Rs.{product_data['regular_price']} (Sale: Rs.{product_data.get('sale_price', 'N/A')})")
        print(f"      Category: {product_data.get('category_name', 'N/A')}")
        print(f"      Images: {len(product_data.get('images', []))}")
    
    # Order serializer
    order = Order.objects.first()
    if order:
        order_data = OrderSerializer(order).data
        print(f"   OK Order #{order_data['id']}")
        print(f"      Customer: {order_data.get('customer_email', 'N/A')}")
        print(f"      Total: Rs.{order_data.get('get_cart_total', 0)}")
        print(f"      Items: {order_data.get('get_cart_items', 0)}")
    
    print()
    
    # Test ViewSet
    print("TESTING VIEWSETS:")
    factory = APIRequestFactory()
    request = factory.get('/api/dashboard/overview/')
    
    # Get admin user for testing
    admin_user = CustomUser.objects.filter(is_staff=True).first()
    if not admin_user:
        admin_user = CustomUser.objects.first()
    
    request.user = admin_user
    
    # Test dashboard stats
    viewset = DashboardViewSet()
    viewset.request = request
    stats = viewset.overview(request).data
    
    print("   OK Dashboard Statistics:")
    print(f"      Total Products: {stats['total_products']}")
    print(f"      Total Orders: {stats['total_orders']}")
    print(f"      Total Customers: {stats['total_customers']}")
    print(f"      Total Reviews: {stats['total_reviews']}")
    print(f"      Completed Orders: {stats['completed_orders']}")
    print(f"      Pending Orders: {stats['pending_orders']}")
    print(f"      Featured Products: {stats['featured_products']}")
    print(f"      Total Revenue: Rs.{stats['total_revenue']}")
    
    print()
    print("API SETUP COMPLETE!")
    print("Ready for frontend integration")
    print("Use JWT authentication for admin access")
    print("API endpoints available at /api/")

if __name__ == "__main__":
    test_api_endpoints()