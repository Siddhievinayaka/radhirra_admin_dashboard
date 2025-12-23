from django.core.management.base import BaseCommand
from dashboard.models import Order
from decimal import Decimal

class Command(BaseCommand):
    help = 'Add 5 dummy orders'

    def handle(self, *args, **kwargs):
        orders = [
            {'order_id': 'ORD-1000', 'customer_name': 'John Doe', 'total_amount': Decimal('150.25'), 'status': 'delivered', 'is_paid': True, 'delivery_person': 'Charlie'},
            {'order_id': 'ORD-1001', 'customer_name': 'John Doe', 'total_amount': Decimal('135.50'), 'status': 'shipped', 'is_paid': True, 'delivery_person': 'Diana'},
            {'order_id': 'ORD-1002', 'customer_name': 'Jane Smith', 'total_amount': Decimal('200.00'), 'status': 'delivered', 'is_paid': True, 'delivery_person': 'Charlie'},
            {'order_id': 'ORD-1003', 'customer_name': 'Jane Smith', 'total_amount': Decimal('180.25'), 'status': 'out', 'is_paid': True, 'delivery_person': 'Diana'},
            {'order_id': 'ORD-1004', 'customer_name': 'Jane Smith', 'total_amount': Decimal('130.00'), 'status': 'packed', 'is_paid': False, 'delivery_person': ''},
        ]
        
        for order_data in orders:
            Order.objects.get_or_create(order_id=order_data['order_id'], defaults=order_data)
        
        self.stdout.write(self.style.SUCCESS('Successfully added 5 dummy orders'))
