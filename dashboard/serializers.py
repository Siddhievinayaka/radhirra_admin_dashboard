from rest_framework import serializers
from .models import (
    CustomUser, UserProfile, Category, Product, ProductImage,
    Order, OrderItem, ShippingAddress, Cart, CartItem, Review
)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'


class CustomUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'is_staff', 'is_active', 'date_joined', 'profile']
        extra_kwargs = {'password': {'write_only': True}}


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    main_image_url = serializers.SerializerMethodField()
    images = ProductImageSerializer(source='productimage_set', many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {
            'sku': {'required': False},
            'sale_price': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
            'size': {'required': False, 'allow_blank': True},
            'material': {'required': False, 'allow_blank': True},
            'specifications': {'required': False, 'allow_blank': True},
            'seller_information': {'required': False, 'allow_blank': True},
            'category': {'required': False, 'allow_null': True},
            'sleeve': {'required': False, 'allow_blank': True},
        }
    
    def get_main_image_url(self, obj):
        main_image = obj.main_image
        if main_image and main_image.image:
            return main_image.image  # Direct URL
        return "https://placehold.co/300x300/1a1a1f/6b7280?text=No+Image"


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.regular_price', max_digits=10, decimal_places=2, read_only=True)
    get_total = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = '__all__'


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='user.email', read_only=True)
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    shipping_address = ShippingAddressSerializer(source='shippingaddress_set', many=True, read_only=True)
    get_cart_total = serializers.ReadOnlyField()
    get_cart_items = serializers.ReadOnlyField()
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
    
    def get_customer_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return "Guest"


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    get_total = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = '__all__'


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(source='cartitem_set', many=True, read_only=True)
    
    class Meta:
        model = Cart
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='user.get_full_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'


# Admin-specific serializers for bulk operations
class ProductBulkUpdateSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.IntegerField())
    is_featured = serializers.BooleanField(required=False)
    is_new_arrival = serializers.BooleanField(required=False)
    is_best_seller = serializers.BooleanField(required=False)


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ])