from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users_customuser'


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    profile_pic = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zipcode = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    
    class Meta:
        db_table = 'users_userprofile'


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'Radhirra_category'


class Product(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('draft', 'Draft'),
    ]
    
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    regular_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    size = models.CharField(max_length=3, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)
    specifications = models.TextField(blank=True, null=True)
    seller_information = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True)
    sleeve = models.CharField(max_length=20, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    def __str__(self):
        return self.name
    
    @property
    def discount_percentage(self):
        if self.sale_price and self.regular_price:
            return round(((self.regular_price - self.sale_price) / self.regular_price) * 100, 2)
        return 0
    
    @property
    def main_image(self):
        return self.productimage_set.filter(is_main=True).first()
    
    class Meta:
        db_table = 'Radhirra_product'
        ordering = ['-id']


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.URLField(max_length=500)  # Store Cloudinary URL
    is_main = models.BooleanField(default=False)
    
    @property
    def thumbnail_url(self):
        if self.image:
            # Convert Cloudinary URL to thumbnail
            return self.image.replace('/upload/', '/upload/w_200,h_200,c_thumb/')
        return None
    
    class Meta:
        db_table = 'Radhirra_productimage'


class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
    ]
    
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True)
    date_ordered = models.DateTimeField(auto_now_add=True)
    complete = models.BooleanField(default=False)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPE_CHOICES, default='whatsapp')
    order_status = models.CharField(max_length=10, choices=ORDER_STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    contact_value = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.id}"
    
    @property
    def get_cart_total(self):
        orderitems = self.orderitem_set.all()
        total = sum([item.get_total for item in orderitems])
        return total
    
    @property
    def get_cart_items(self):
        orderitems = self.orderitem_set.all()
        total = sum([item.quantity for item in orderitems])
        return total
    
    class Meta:
        db_table = 'Radhirra_order'
        ordering = ['-date_ordered']


class OrderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, blank=True, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, blank=True, null=True)
    quantity = models.IntegerField(default=0, blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)
    price_at_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    variant_info = models.CharField(max_length=255, blank=True, null=True)
    user_note = models.TextField(blank=True, null=True)
    
    @property
    def get_total(self):
        if self.price_at_order > 0:
            return self.price_at_order * self.quantity
        elif self.product:
            price = self.product.sale_price or self.product.regular_price
            return price * self.quantity
        return 0
    
    class Meta:
        db_table = 'Radhirra_orderitem'


class ShippingAddress(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=200, blank=True, null=True)
    state = models.CharField(max_length=200, blank=True, null=True)
    zipcode = models.CharField(max_length=200, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.address or f"Address for Order {self.order.id if self.order else 'N/A'}"
    
    class Meta:
        db_table = 'Radhirra_shippingaddress'


class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, blank=True, null=True)
    session_key = models.CharField(max_length=40, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'Radhirra_cart'


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    size = models.CharField(max_length=3, blank=True, null=True)
    sleeve = models.CharField(max_length=20, blank=True, null=True)
    
    @property
    def get_total(self):
        price = self.product.sale_price or self.product.regular_price
        return price * self.quantity
    
    class Meta:
        db_table = 'Radhirra_cartitem'


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.rating} stars"
    
    class Meta:
        db_table = 'Radhirra_review'
        unique_together = ('product', 'user')
