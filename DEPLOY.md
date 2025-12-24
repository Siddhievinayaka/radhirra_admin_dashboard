# Deploy to Render.com

## Prerequisites
- GitHub repository with your code
- Render.com account
- PostgreSQL database (Render or external)

## Step 1: Prepare Files

Create `build.sh`:
```bash
#!/usr/bin/env bash
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

Create `render.yaml`:
```yaml
databases:
  - name: radhirra-db
    databaseName: radhirra_db
    user: radhirra_user

services:
  - type: web
    name: radhirra-admin
    env: python
    buildCommand: "./build.sh"
    startCommand: "gunicorn backend.wsgi:application"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: radhirra-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: CLOUDINARY_CLOUD_NAME
        value: your-cloud-name
      - key: CLOUDINARY_API_KEY
        value: your-api-key
      - key: CLOUDINARY_API_SECRET
        value: your-api-secret
```

## Step 2: Update Settings

Add to `requirements.txt`:
```
gunicorn==21.2.0
whitenoise==6.6.0
```

Update `backend/settings.py`:
```python
import dj_database_url

# Production settings
DEBUG = False
ALLOWED_HOSTS = ['your-app-name.onrender.com', 'localhost']

# Database
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}

# Static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

## Step 3: Deploy

1. Push code to GitHub
2. Connect GitHub repo to Render
3. Create PostgreSQL database
4. Create web service
5. Set environment variables
6. Deploy

## Step 4: Post-Deploy

```bash
# Create superuser (via Render shell)
python manage.py createsuperuser
```

Access: `https://your-app-name.onrender.com/admin_login/`