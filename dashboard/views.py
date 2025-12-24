from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import cloudinary.uploader
from .models import Product, Order, ProductImage


def admin_login_view(request):
    return render(request, "admin_login.html")


def index_view(request):
    products = Product.objects.all()
    total_products = products.count()
    featured_products = products.filter(is_featured=True).count()
    new_arrivals = products.filter(is_new_arrival=True).count()
    
    orders = Order.objects.all()
    total_orders = orders.count()
    completed_orders = orders.filter(complete=True).count()
    pending_orders = orders.filter(complete=False).count()
    
    context = {
        'total_products': total_products,
        'featured_products': featured_products,
        'new_arrivals': new_arrivals,
        'total_orders': total_orders,
        'completed_orders': completed_orders,
        'pending_orders': pending_orders,
    }
    return render(request, "components/dashboard_content.html", context)


def products_view(request):
    return render(request, "components/products.html")


def orders_view(request):
    return render(request, "components/orders.html")


@csrf_exempt
def upload_product_image_api(request):
    if request.method == 'POST':
        try:
            product_id = request.POST.get('product_id')
            image_file = request.FILES.get('image')
            is_main = request.POST.get('is_main', 'false').lower() == 'true'
            
            if not product_id or not image_file:
                return JsonResponse({'success': False, 'error': 'Missing product_id or image'})
            
            # Upload actual image to Cloudinary
            result = cloudinary.uploader.upload(
                image_file,
                folder=f"products/{product_id}",
                resource_type="image"
            )
            
            # If this is main image, unset other main images first
            if is_main:
                ProductImage.objects.filter(product_id=product_id, is_main=True).update(is_main=False)
            
            # Save Cloudinary URL to database
            product_image = ProductImage.objects.create(
                product_id=product_id,
                image=result['secure_url'],  # Store full Cloudinary URL
                is_main=is_main
            )
            
            return JsonResponse({
                'success': True,
                'image_id': product_image.id,
                'url': result['secure_url'],
                'thumbnail': product_image.thumbnail_url
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})
