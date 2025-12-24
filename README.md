# Radhirra Admin Dashboard

A comprehensive admin dashboard for managing Radhirra Designs e-commerce platform with product management, order tracking, and customer analytics.

## Features

- **Product Management**: Create, edit, delete products with image upload
- **Order Management**: View and update order status
- **Customer Analytics**: Track customer data and statistics
- **Image Upload**: Cloudinary integration for product images
- **Bulk Operations**: Feature/unfeature products, bulk delete
- **Authentication**: JWT-based admin authentication
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

**Backend:**
- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Cloudinary

**Frontend:**
- HTML5/CSS3
- Vanilla JavaScript
- Tailwind CSS

## Installation

### Prerequisites
- Python 3.8+
- PostgreSQL
- Node.js (for Tailwind CSS)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd radhirra_admin_dashboard
```

2. **Create virtual environment**
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Environment variables**
Create `.env` file:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/radhirra_db
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. **Database setup**
```bash
python manage.py migrate
python manage.py createsuperuser
```

6. **Run server**
```bash
python manage.py runserver 8001
```

## Usage

1. Access admin dashboard at `http://localhost:8001/admin_login/`
2. Login with superuser credentials
3. Navigate through products, orders, and analytics sections

## API Endpoints

- `GET /api/products/` - List products
- `POST /api/products/` - Create product
- `PUT /api/products/{id}/` - Update product
- `DELETE /api/products/{id}/` - Delete product
- `POST /api/products/bulk_update/` - Bulk update products
- `GET /api/orders/` - List orders
- `GET /api/categories/` - List categories

## Project Structure

```
radhirra_admin_dashboard/
├── backend/
│   ├── settings.py
│   └── urls.py
├── dashboard/
│   ├── models.py
│   ├── views.py
│   ├── viewsets.py
│   └── serializers.py
├── frontend/
│   ├── templates/
│   └── src/
│       ├── css/
│       └── js/
└── requirements.txt
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is proprietary software for Radhirra Designs.