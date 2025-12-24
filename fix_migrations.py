#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def fix_migrations():
    with connection.cursor() as cursor:
        # Check if django_migrations table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'django_migrations'
            );
        """)
        
        if cursor.fetchone()[0]:
            # Insert dashboard migrations as applied
            migrations_to_insert = [
                ('dashboard', '0001_initial'),
                ('dashboard', '0002_remove_product_image_url_product_main_image_and_more'),
                ('dashboard', '0003_order'),
                ('dashboard', '0004_order_delivery_person'),
            ]
            
            for app, migration in migrations_to_insert:
                # Check if migration already exists
                cursor.execute("""
                    SELECT COUNT(*) FROM django_migrations 
                    WHERE app = %s AND name = %s;
                """, [app, migration])
                
                if cursor.fetchone()[0] == 0:
                    cursor.execute("""
                        INSERT INTO django_migrations (app, name, applied) 
                        VALUES (%s, %s, NOW());
                    """, [app, migration])
                    print(f"+ Inserted migration: {app}.{migration}")
                else:
                    print(f"! Migration already exists: {app}.{migration}")
            
            print("Migration records inserted successfully!")
        else:
            print("django_migrations table not found")

if __name__ == '__main__':
    fix_migrations()