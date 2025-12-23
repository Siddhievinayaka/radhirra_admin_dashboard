from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import Product, Order


def index_view(request):
    products = Product.objects.all()
    total_products = products.count()
    active_products = products.filter(status='active').count()
    low_stock = products.filter(stock_quantity__lt=20).count()
    
    context = {
        'total_products': total_products,
        'active_products': active_products,
        'low_stock': low_stock,
    }
    return render(request, "components/dashboard_content.html", context)


def products_view(request):
    products = Product.objects.all()
    total_products = products.count()
    active_products = products.filter(status='active').count()
    low_stock = products.filter(stock_quantity__lt=20).count()
    
    context = {
        'products': products,
        'total_products': total_products,
        'active_products': active_products,
        'low_stock': low_stock,
    }
    return render(request, "components/products.html", context)


def orders_view(request):
    orders = Order.objects.all()
    total_orders = orders.count()
    pending_orders = orders.filter(status='pending').count()
    transit_orders = orders.filter(status__in=['shipped', 'out']).count()
    delivered_orders = orders.filter(status='delivered').count()
    
    context = {
        'orders': orders,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'transit_orders': transit_orders,
        'delivered_orders': delivered_orders,
    }
    return render(request, "components/orders.html", context)


@require_http_methods(["POST"])
def add_product(request):
    try:
        product = Product.objects.create(
            name=request.POST.get('name'),
            sku=request.POST.get('sku'),
            description=request.POST.get('description', ''),
            regular_price=request.POST.get('regular_price'),
            sale_price=request.POST.get('sale_price') or None,
            stock_quantity=request.POST.get('stock_quantity', 0),
            status=request.POST.get('status', 'active'),
            category=request.POST.get('category', ''),
            material=request.POST.get('material', ''),
            specifications=request.POST.get('specifications', ''),
            seller_info=request.POST.get('seller_info', ''),
            main_image=request.FILES.get('main_image'),
            sub_images=request.FILES.get('sub_images'),
        )
        return JsonResponse({'success': True, 'id': product.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["GET"])
def get_product(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        return JsonResponse({
            'success': True,
            'product': {
                'id': product.id,
                'name': product.name,
                'sku': product.sku or '',
                'description': product.description,
                'regular_price': str(product.regular_price),
                'sale_price': str(product.sale_price) if product.sale_price else '',
                'stock_quantity': product.stock_quantity,
                'status': product.status,
                'category': product.category,
                'material': product.material,
                'specifications': product.specifications,
                'seller_info': product.seller_info,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["POST"])
def edit_product(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        product.name = request.POST.get('name', product.name)
        product.sku = request.POST.get('sku', product.sku)
        product.description = request.POST.get('description', product.description)
        product.regular_price = request.POST.get('regular_price', product.regular_price)
        product.sale_price = request.POST.get('sale_price') or None
        product.stock_quantity = request.POST.get('stock_quantity', product.stock_quantity)
        product.status = request.POST.get('status', product.status)
        product.category = request.POST.get('category', product.category)
        product.material = request.POST.get('material', product.material)
        product.specifications = request.POST.get('specifications', product.specifications)
        product.seller_info = request.POST.get('seller_info', product.seller_info)
        
        if request.FILES.get('main_image'):
            product.main_image = request.FILES.get('main_image')
        if request.FILES.get('sub_images'):
            product.sub_images = request.FILES.get('sub_images')
        
        product.save()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_http_methods(["POST"])
def delete_product(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        product.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
