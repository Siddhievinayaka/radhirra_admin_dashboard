# Image Upload Feature - Migration Guide

## Changes Made

### 1. Model Updated
- Replaced `image_url` (URLField) with:
  - `main_image` (ImageField) - Main product image
  - `sub_images` (ImageField) - Additional product images

### 2. Backend Changes
- Added Pillow dependency for image handling
- Configured MEDIA_URL and MEDIA_ROOT in settings.py
- Updated views.py to handle file uploads via request.FILES
- Added media URL patterns in urls.py

### 3. Frontend Changes
- Updated main.js to use FormData instead of JSON
- Added file handling for mainImage and subImages inputs
- Updated products.html to display uploaded images

## Setup Steps

### 1. Install Pillow
```bash
pip install Pillow
```

### 2. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Media Directory
The media folder will be created automatically when you upload the first image.

### 4. Test Upload
1. Start server: `python manage.py runserver`
2. Go to Products page
3. Click "ADD PRODUCT"
4. Fill form and select images
5. Submit and verify images appear

## File Structure
```
radhirra_admin_dashboard/
├── media/                    # Created automatically
│   └── products/            # Main images
│       └── sub/             # Sub images
```

## Notes
- Images are stored in `media/products/` directory
- Sub images stored in `media/products/sub/`
- If no image uploaded, placeholder image is shown
- Supported formats: JPG, PNG, GIF, WebP
