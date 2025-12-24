#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def mark_all_migrations_applied():
    with connection.cursor() as cursor:
        # Mark all Django built-in migrations as applied
        builtin_migrations = [
            ('admin', '0001_initial'),
            ('admin', '0002_logentry_remove_auto_add'),
            ('admin', '0003_logentry_add_action_flag_choices'),
            ('auth', '0001_initial'),
            ('auth', '0002_alter_permission_name_max_length'),
            ('auth', '0003_alter_user_email_max_length'),
            ('auth', '0004_alter_user_username_opts'),
            ('auth', '0005_alter_user_last_login_null'),
            ('auth', '0006_require_contenttypes_0002'),
            ('auth', '0007_alter_validators_add_error_messages'),
            ('auth', '0008_alter_user_username_max_length'),
            ('auth', '0009_alter_user_last_name_max_length'),
            ('auth', '0010_alter_group_name_max_length'),
            ('auth', '0011_update_proxy_permissions'),
            ('auth', '0012_alter_user_first_name_max_length'),
            ('contenttypes', '0001_initial'),
            ('contenttypes', '0002_remove_content_type_name'),
            ('sessions', '0001_initial'),
        ]
        
        for app, migration in builtin_migrations:
            cursor.execute("""
                SELECT COUNT(*) FROM django_migrations 
                WHERE app = %s AND name = %s;
            """, [app, migration])
            
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                    INSERT INTO django_migrations (app, name, applied) 
                    VALUES (%s, %s, NOW());
                """, [app, migration])
                print(f"+ Marked as applied: {app}.{migration}")
            else:
                print(f"! Already applied: {app}.{migration}")
        
        print("All migrations marked as applied!")

if __name__ == '__main__':
    mark_all_migrations_applied()