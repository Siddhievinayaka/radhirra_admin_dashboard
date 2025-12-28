# Generated migration for WhatsApp/Email checkout system

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0003_alter_productimage_image'),
    ]

    operations = [
        # Add new fields to Order model
        migrations.AddField(
            model_name='order',
            name='order_type',
            field=models.CharField(
                choices=[('whatsapp', 'WhatsApp'), ('email', 'Email')],
                default='whatsapp',
                max_length=10
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='order_status',
            field=models.CharField(
                choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled')],
                default='pending',
                max_length=10
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='total_amount',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='order',
            name='contact_value',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        
        # Add new fields to OrderItem model
        migrations.AddField(
            model_name='orderitem',
            name='price_at_order',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='variant_info',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        
        # Modify ShippingAddress fields to be optional
        migrations.AlterField(
            model_name='shippingaddress',
            name='address',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='shippingaddress',
            name='city',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='shippingaddress',
            name='state',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='shippingaddress',
            name='zipcode',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        
        # Add phone_number field to ShippingAddress
        migrations.AddField(
            model_name='shippingaddress',
            name='phone_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]