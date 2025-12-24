from django.core.management.base import BaseCommand
from dashboard.models import Order
from decimal import Decimal

class Command(BaseCommand):
    help = 'Add 5 dummy orders'

    def handle(self, *args, **kwargs):
        orders = [
            {'transaction_id': 'ORD-1000', 'complete': True},
            {'transaction_id': 'ORD-1001', 'complete': True},
            {'transaction_id': 'ORD-1002', 'complete': True},
            {'transaction_id': 'ORD-1003', 'complete': False},
            {'transaction_id': 'ORD-1004', 'complete': False},
        ]
        
        for order_data in orders:
            Order.objects.get_or_create(transaction_id=order_data['transaction_id'], defaults=order_data)
        
        self.stdout.write(self.style.SUCCESS('Successfully added 5 dummy orders'))
