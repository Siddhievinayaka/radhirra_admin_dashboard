# Radhirra Admin Dashboard - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 4. Run Development Server
```bash
python manage.py runserver
```

### 5. Access Application
- Dashboard: http://127.0.0.1:8000/
- Products: http://127.0.0.1:8000/products/
- Admin Panel: http://127.0.0.1:8000/admin/

## Features Implemented

✅ Product Model with full CRUD operations
✅ Dynamic product listing with database integration
✅ Add product modal with form validation
✅ Delete product functionality
✅ Real-time statistics (total, active, low stock)
✅ CSRF protection
✅ Admin panel integration
✅ Responsive UI with Tailwind CSS

## API Endpoints

- `POST /api/products/add/` - Add new product
- `POST /api/products/delete/<id>/` - Delete product

## Security Notes

⚠️ Before deploying to production:
1. Change SECRET_KEY in settings.py (use environment variable)
2. Set DEBUG = False
3. Configure ALLOWED_HOSTS
4. Use PostgreSQL instead of SQLite
5. Set up proper authentication
6. Enable HTTPS

## Next Steps

- Implement edit product functionality
- Add image upload support
- Implement search and filter
- Add pagination
- Create authentication system
- Add order management
- Implement customer management
