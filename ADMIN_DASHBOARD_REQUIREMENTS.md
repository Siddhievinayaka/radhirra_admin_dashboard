# ADMIN DASHBOARD REQUIREMENTS - RADHIRRA DESIGNS

## DATABASE CONNECTION
```
DATABASE_URL=postgresql://postgres.satzaiimlnpjhhmgbcez:vectratechhs17@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require
```

## CLOUDINARY (For Image Storage)
```
CLOUDINARY_CLOUD_NAME=ddlx2h9hr
CLOUDINARY_API_KEY=999271691163949
CLOUDINARY_API_SECRET=KNWUBus3MXZo5DWaOL5bcjczep0
```

---

## DATABASE TABLES & MODELS

### 1. USERS & AUTHENTICATION

#### Table: `users_customuser`
- id (Primary Key)
- email (Unique, used for login)
- username
- password (hashed)
- first_name
- last_name
- is_staff (Boolean - admin access)
- is_superuser (Boolean - full access)
- is_active (Boolean)
- date_joined
- last_login

#### Table: `users_userprofile`
- id (Primary Key)
- user_id (Foreign Key → users_customuser)
- phone
- gender (Male/Female/Other)
- profile_pic (Cloudinary URL)
- address
- city
- state
- zipcode

---

### 2. PRODUCTS MANAGEMENT

#### Table: `Radhirra_category`
- id (Primary Key)
- name (Unique)
- slug (Unique, auto-generated)
- created_at

#### Table: `Radhirra_product`
- id (Primary Key)
- category_id (Foreign Key → Radhirra_category)
- name
- sku (Unique) (should not be in add product html form)
- regular_price (Decimal)
- sale_price (Decimal, nullable)
- description (Text)
- size (XS/S/M/L/XL/XXL)
- sleeve (sleeveless/short/3/4)
- color_code
- category (Gopi Dress, other(input field)-type if not existing then add to category on product save)
- skirt_fabric
- blouse_fabrics (cotton, others(input field)-type if not existing then add to blouse_fabrics on product save)
- dupatta_fabrics (cotton, others(input field)-type if not existing then add to dupatta_fabrics on product save)
- specifications (Text)
- seller_information (Text)
- stock_quantity
- product_status (active, disabled(will not be visible on website), sold(add to cart will be disabled))
- seller_information (Text Area)
- is_featured (Boolean) - Show on homepage
- is_new_arrival (Boolean) - Tag as new
- is_best_seller (Boolean) - Tag as bestseller
- main_img (one img selection)
- sub_images (allow admin to upload many images at once)

#### (This Table can be Avoid if you think so not needed) Table: `Radhirra_productimage`
- id (Primary Key)
- product_id (Foreign Key → Radhirra_product)
- images  (Cloudinary URL) 
- is_main (Boolean) - Main product image

---

# Orders Management – Optimized Schema

This schema is optimized for:
- High performance
- Clean relationships
- Accurate order history
- Django ORM efficiency
- Scalable admin dashboards

---

## Table: `radhirra_order`

Represents a single order placed by a user.

### Columns
- id (Primary Key)
- user_id (FK → users_customuser, indexed)
- order_number (UUID / CharField, unique, indexed)
- status (ENUM)
  - pending
  - paid
  - shipped
  - delivered
  - cancelled
  - returned
- total_amount (Decimal)
- transaction_id (CharField, indexed, nullable)
- is_paid (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)

### Notes
- ❌ Removed `product_id` (handled by order items)
- ✅ Indexed fields improve dashboard & history queries
- ✅ `status` replaces `complete` for real-world flows

---

## Table: `radhirra_order_item`

Stores individual products inside an order.

### Columns
- id (Primary Key)
- order_id (FK → radhirra_order, indexed)
- product_id (FK → radhirra_product, indexed)
- product_name (CharField snapshot)
- price_at_purchase (Decimal)
- quantity (PositiveInteger)
- subtotal (Decimal)
- created_at (Timestamp)

### Notes
- ✅ Price snapshot ensures historical accuracy
- ✅ Avoids recalculating totals repeatedly
- ✅ Fast aggregation using indexed order_id

---

## Table: `radhirra_shipping_address`

Stores shipping details (optional per order).

### Columns
- id (Primary Key)
- order_id (OneToOne FK → radhirra_order, indexed)
- user_id (FK → users_customuser)
- full_name
- phone
- address_line_1
- address_line_2 (nullable)
- city
- state
- zipcode
- country
- created_at (Timestamp)

### Notes
- ✅ One shipping address per order
- ✅ Optional for digital products
- ✅ Clean separation of concerns

---

## Indexing Strategy

Recommended indexes:
- radhirra_order(user_id)
- radhirra_order(order_number)
- radhirra_order(transaction_id)
- radhirra_order_item(order_id)
- radhirra_order_item(product_id)

---

## Performance Benefits

- Fewer joins
- Faster order history queries
- Accurate financial records
- Admin dashboard-ready
- Easy analytics & reporting

---

## Django ORM Advantages

- Efficient `select_related()` & `prefetch_related()`
- Clean serializers
- Simple aggregation queries
- Scales well on Supabase PostgreSQL


---

### 4. CART MANAGEMENT

#### Table: `Radhirra_cart`
- id (Primary Key)
- user_id (Foreign Key → users_customuser, nullable)
- session_key (For guest users)
- created_at

#### Table: `Radhirra_cartitem`
- id (Primary Key)
- cart_id (Foreign Key → Radhirra_cart)
- product_id (Foreign Key → Radhirra_product)
- quantity
- size (XS/S/M/L/XL/XXL)
- sleeve (sleeveless/short/3/4)

---

### 5. REVIEWS MANAGEMENT

#### Table: `Radhirra_review`
- id (Primary Key)
- product_id (Foreign Key → Radhirra_product)
- user_id (Foreign Key → users_customuser)
- rating (1-5)
- comment (Text)
- created_at
- Unique constraint: (product_id, user_id)

---

## ADMIN DASHBOARD FEATURES

### 1. DASHBOARD HOME
- Total Sales (₹)
- Total Orders
- Total Products
- Total Customers
- Today's Revenue
- Pending Orders
- Recent Orders (Last 10)
- Low Stock Alerts
- Revenue Chart (Monthly)
- Top Selling Products

### 2. PRODUCT MANAGEMENT
**CRUD Operations:**
- Create Product (Refer table Radhirra_product)
  - Name,
  - Category (Select from drop down, if missing then other(input field))
  - Regular Price, Sale Price
  - Size, Sleeve, Fabric, Skirt(Description-Fabric, stitching, lengths, etc.)
  - Seller Info, Specifications
  - Toggle: is_featured, is_new_arrival, is_best_seller
  - Status: Active, Disabled, Sold_out.
  - Main Image (Single image selection, png, jpeg)
  - Upload Multiple Images (Multiple image selection)
  
- List Products
  - Search by name/SKU
  - Filter by category
  - Sort by price/date
  - Bulk actions (new, top selling, feature, unfeatured, delete)
  
- Edit Product
- Delete Product
- Manage Product Images

<!-- ### 3. CATEGORY MANAGEMENT (delete)
- Create Category
- List Categories
- Edit Category
- Delete Category (if no products) -->

### 4. ORDER MANAGEMENT
- List All Orders
  - Search order:
      - order id, customer name
      - Filter by status (Pending, Packed, Shipped, Delivered, Cancelled)
      - Filter by date range
      - Search by transaction_id/user
  - Display small cards: 
      - Total
      - Pending
      - In Transit
      - Delivered
  - Display table:
      - Order ID, Customer,	Amount,	Status,	Payment(Paid, Unpaid),	Delivery Man,	Date,	Actions(View(Pop up with details), Edit)
  
- View Order Details (table actions -> view -> pop-up)
  - Customer info
  - Order items
  - Shipping address
  - Total amount
  
- Update Order Status (table actions -> edit -> pop-up)
- Print Invoice (table actions -> view -> pop-up)

### 5. CUSTOMER MANAGEMENT
- List All Customers
  - Search by email/name
  - View customer details
  - View order history
  
- View Customer Profile
  - Personal info
  - Order history
  - Total spent
  
- Deactivate/Activate User

### 6. REVIEWS MANAGEMENT
- List All Reviews
  - Filter by rating
  - Filter by product
  - Search by user
  
- Approve/Reject Reviews
- Delete Reviews

### 7. REPORTS & ANALYTICS
- Sales Report
  - Daily/Weekly/Monthly/Yearly
  - Revenue trends
  
- Product Performance
  - Best selling products
  - Low performing products
  
- Customer Analytics
  - New customers
  - Repeat customers
  - Customer lifetime value

### 8. SETTINGS
- Site Settings
- Payment Gateway Config
- Shipping Settings
- Email Templates

---

## API ENDPOINTS NEEDED

### Authentication
- POST /api/admin/login
- POST /api/admin/logout

### Products
- GET /api/admin/products (list with pagination)
- POST /api/admin/products (create)
- GET /api/admin/products/{id} (detail)
- PUT /api/admin/products/{id} (update)
- DELETE /api/admin/products/{id}
- POST /api/admin/products/{id}/images (upload)

### Categories
- GET /api/admin/categories
- POST /api/admin/categories
- PUT /api/admin/categories/{id}
- DELETE /api/admin/categories/{id}

### Orders
- GET /api/admin/orders
- GET /api/admin/orders/{id}
- PUT /api/admin/orders/{id}/status

### Customers
- GET /api/admin/customers
- GET /api/admin/customers/{id}
- PUT /api/admin/customers/{id}/status

### Reviews
- GET /api/admin/reviews
- DELETE /api/admin/reviews/{id}

### Dashboard Stats
- GET /api/admin/stats/overview
- GET /api/admin/stats/sales
- GET /api/admin/stats/products

---

## CALCULATED FIELDS (Computed at Runtime)

### Product
- discount_percentage = ((regular_price - sale_price) / regular_price) * 100
- main_image = images.filter(is_main=True).first()

### Order
- get_cart_total = sum(orderitem.get_total for all items)
- get_cart_items = sum(orderitem.quantity for all items)

### OrderItem
- get_total = (sale_price or regular_price) * quantity

### CartItem
- get_total = (sale_price or regular_price) * quantity

---

## PERMISSIONS & ROLES

### Superuser (is_superuser=True)
- Full access to everything

### Staff (is_staff=True)
- Product management
- Order management
- Customer view only
- Cannot delete users

### Regular User (is_staff=False)
- No admin access

---

## IMPORTANT NOTES

1. **Authentication**: Use email for login (not username)
2. **Images**: All images stored in Cloudinary
3. **Currency**: Indian Rupees (₹)
4. **Timezone**: UTC
5. **Database**: PostgreSQL on Supabase
6. **Session**: Cache-based sessions

---

## SAMPLE QUERIES

### Get Featured Products
```sql
SELECT * FROM Radhirra_product WHERE is_featured = TRUE LIMIT 8;
```

### Get Order with Items
```sql
SELECT o.*, oi.*, p.name, p.regular_price, p.sale_price
FROM Radhirra_order o
JOIN Radhirra_orderitem oi ON o.id = oi.order_id
JOIN Radhirra_product p ON oi.product_id = p.id
WHERE o.id = ?;
```

### Get Customer Orders
```sql
SELECT * FROM Radhirra_order 
WHERE user_id = ? 
ORDER BY date_ordered DESC;
```

### Get Product Reviews
```sql
SELECT r.*, u.username, u.email
FROM Radhirra_review r
JOIN users_customuser u ON r.user_id = u.id
WHERE r.product_id = ?
ORDER BY r.created_at DESC;
```

### Sales Report (Monthly)
```sql
SELECT 
  DATE_TRUNC('month', date_ordered) as month,
  COUNT(*) as total_orders,
  SUM(
    (SELECT SUM(
      CASE 
        WHEN p.sale_price IS NOT NULL THEN p.sale_price * oi.quantity
        ELSE p.regular_price * oi.quantity
      END
    )
    FROM Radhirra_orderitem oi
    JOIN Radhirra_product p ON oi.product_id = p.id
    WHERE oi.order_id = o.id)
  ) as total_revenue
FROM Radhirra_order o
WHERE complete = TRUE
GROUP BY month
ORDER BY month DESC;
```
