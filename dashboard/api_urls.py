from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import AdminTokenObtainPairView
from .viewsets import (
    CategoryViewSet, ProductViewSet, OrderViewSet,
    CustomerViewSet, ReviewViewSet, DashboardViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    # JWT Authentication for admin users
    path('auth/login/', AdminTokenObtainPairView.as_view(), name='admin_token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API endpoints
    path('api/', include(router.urls)),
]