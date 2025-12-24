#!/usr/bin/env python
"""
Create Admin User Script
Creates admin users for testing the authentication system
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from dashboard.models import CustomUser

def create_admin_user():
    print("Creating Admin User for Radhirra Dashboard")
    print("=" * 50)
    
    # Check if admin users exist
    admin_users = CustomUser.objects.filter(is_staff=True)
    if admin_users.exists():
        print("Existing admin users:")
        for user in admin_users:
            print(f"  - {user.email} ({'Superuser' if user.is_superuser else 'Staff'})")
        print()
    
    # Create new admin user
    email = input("Enter admin email: ")
    
    # Check if user exists
    if CustomUser.objects.filter(email=email).exists():
        print(f"User with email {email} already exists!")
        return
    
    password = input("Enter password: ")
    first_name = input("Enter first name: ")
    last_name = input("Enter last name: ")
    
    is_superuser = input("Make superuser? (y/n): ").lower() == 'y'
    
    # Create user
    user = CustomUser.objects.create_user(
        email=email,
        username=email,  # Use email as username
        password=password,
        first_name=first_name,
        last_name=last_name,
        is_staff=True,
        is_superuser=is_superuser
    )
    
    print(f"\nAdmin user created successfully!")
    print(f"Email: {user.email}")
    print(f"Role: {'Superuser' if user.is_superuser else 'Staff'}")
    print(f"Can login to admin dashboard: Yes")
    
    # Test login
    print("\nTesting authentication...")
    from django.contrib.auth import authenticate
    auth_user = authenticate(username=email, password=password)
    if auth_user:
        print("✓ Authentication test passed")
    else:
        print("✗ Authentication test failed")

if __name__ == "__main__":
    create_admin_user()