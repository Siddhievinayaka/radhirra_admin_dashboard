#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def add_status_field():
    with connection.cursor() as cursor:
        try:
            # Add status column to Product table
            cursor.execute("""
                ALTER TABLE Radhirra_product 
                ADD COLUMN status VARCHAR(20) DEFAULT 'active';
            """)
            print("+ Added status column to Product table")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("! Status column already exists")
            else:
                print(f"Error: {e}")

if __name__ == '__main__':
    add_status_field()