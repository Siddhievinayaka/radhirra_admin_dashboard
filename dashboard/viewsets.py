from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Q
from .models import (
    CustomUser, UserProfile, Category, Product, ProductImage,
    Order, OrderItem, ShippingAddress, Cart, CartItem, Review
)
from .serializers import (
    CustomUserSerializer, CategorySerializer, ProductSerializer,
    OrderSerializer, ReviewSerializer, ProductBulkUpdateSerializer,
    OrderStatusUpdateSerializer
)


class AdminPermission(IsAuthenticated):
    """Custom permission for admin users only"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_staff


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').prefetch_related('productimage_set')
    serializer_class = ProductSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured', 'is_new_arrival', 'is_best_seller']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'regular_price', 'id']
    ordering = ['-id']

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update products (feature, unfeature, etc.)"""
        serializer = ProductBulkUpdateSerializer(data=request.data)
        if serializer.is_valid():
            ids = serializer.validated_data['ids']
            products = Product.objects.filter(id__in=ids)
            
            update_fields = {}
            if 'is_featured' in serializer.validated_data:
                update_fields['is_featured'] = serializer.validated_data['is_featured']
            if 'is_new_arrival' in serializer.validated_data:
                update_fields['is_new_arrival'] = serializer.validated_data['is_new_arrival']
            if 'is_best_seller' in serializer.validated_data:
                update_fields['is_best_seller'] = serializer.validated_data['is_best_seller']
            
            products.update(**update_fields)
            return Response({'message': f'Updated {products.count()} products'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """Upload images for a product"""
        try:
            product = self.get_object()
            uploaded_images = []
            
            files = request.FILES.getlist('images')
            is_main = request.data.get('is_main', 'false').lower() == 'true'
            
            if not files:
                return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            for i, file in enumerate(files):
                product_image = ProductImage.objects.create(
                    product=product,
                    image=file,
                    is_main=is_main and i == 0
                )
                
                if product_image.is_main:
                    ProductImage.objects.filter(
                        product=product, is_main=True
                    ).exclude(id=product_image.id).update(is_main=False)
                
                uploaded_images.append({
                    'id': product_image.id,
                    'url': product_image.image.url,
                    'is_main': product_image.is_main
                })
            
            return Response({'success': True, 'images': uploaded_images})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get product statistics"""
        stats = {
            'total_products': Product.objects.count(),
            'featured_products': Product.objects.filter(is_featured=True).count(),
            'new_arrivals': Product.objects.filter(is_new_arrival=True).count(),
            'best_sellers': Product.objects.filter(is_best_seller=True).count(),
            'categories_count': Category.objects.count(),
        }
        return Response(stats)




class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('user').prefetch_related('orderitem_set__product')
    serializer_class = OrderSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['complete']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'transaction_id']
    ordering_fields = ['date_ordered', 'id']
    ordering = ['-date_ordered']

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # Note: Current model uses 'complete' boolean, adapt as needed
            if serializer.validated_data['status'] in ['delivered', 'completed']:
                order.complete = True
            else:
                order.complete = False
            order.save()
            return Response({'message': 'Order status updated'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get order statistics"""
        stats = {
            'total_orders': Order.objects.count(),
            'completed_orders': Order.objects.filter(complete=True).count(),
            'pending_orders': Order.objects.filter(complete=False).count(),
            'total_revenue': sum([order.get_cart_total for order in Order.objects.filter(complete=True)]),
        }
        return Response(stats)


class CustomerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CustomUser.objects.filter(is_staff=False).select_related('userprofile')
    serializer_class = CustomUserSerializer
    permission_classes = [AdminPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering_fields = ['date_joined', 'email']
    ordering = ['-date_joined']

    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        """Get customer's orders"""
        customer = self.get_object()
        orders = Order.objects.filter(user=customer).order_by('-date_ordered')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Activate/deactivate customer"""
        customer = self.get_object()
        customer.is_active = not customer.is_active
        customer.save()
        return Response({'message': f'Customer {"activated" if customer.is_active else "deactivated"}'})


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('user', 'product')
    serializer_class = ReviewSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rating', 'product']
    search_fields = ['user__email', 'product__name', 'comment']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']


class DashboardViewSet(viewsets.ViewSet):
    """Dashboard statistics and analytics"""
    permission_classes = [AdminPermission]

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get dashboard overview statistics"""
        stats = {
            'total_products': Product.objects.count(),
            'total_orders': Order.objects.count(),
            'total_customers': CustomUser.objects.filter(is_staff=False).count(),
            'total_reviews': Review.objects.count(),
            'completed_orders': Order.objects.filter(complete=True).count(),
            'pending_orders': Order.objects.filter(complete=False).count(),
            'featured_products': Product.objects.filter(is_featured=True).count(),
            'total_revenue': sum([order.get_cart_total for order in Order.objects.filter(complete=True)]),
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def recent_orders(self, request):
        """Get recent orders"""
        orders = Order.objects.select_related('user').order_by('-date_ordered')[:10]
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_products(self, request):
        """Get top selling products"""
        # This would need OrderItem data to be accurate
        products = Product.objects.annotate(
            order_count=Count('orderitem')
        ).order_by('-order_count')[:5]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)