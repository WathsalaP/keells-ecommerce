# Keells Delivery System

A full-stack **Shopping and Delivery Tracking System** for Keells supermarket in Sri Lanka. Built as a BSC Software Engineering final research project.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JWT, JPA/Hibernate
- **Frontend:** React 18, Vite
- **Database:** PostgreSQL (PgAdmin)
- **Version Control:** GitHub

## Features

### Admin
- Login with admin credentials
- Dashboard with monthly/yearly revenue and order stats
- Manage products (CRUD), categories, discounts
- Manage users (enable/disable)
- Update order status (Ready → Pickup → In Delivery → Hand Over)

### Customers (Users)
- Sign up / Login
- Browse products by category
- View discounts and apply at checkout
- Add to cart, update quantities, remove items
- Checkout with delivery address (Sri Lanka provinces & districts)
- Fake payment gateway (auto-success)
- View order history and tracking status

### Address Selection
- Country fixed as **Sri Lanka**
- Province dropdown
- District (city) dropdown filtered by selected province
- Uses built-in Sri Lanka administrative data (9 provinces, 25 districts)

## Database Setup

1. Install PostgreSQL 18 (or compatible version)
2. Create database:
   ```sql
   CREATE DATABASE keells_system;
   ```
3. Connection (default in `application.properties`):
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: 1234
   - Database: keells_system

## Run the Project

### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000 (proxies API to backend)

## Default Credentials

- **Admin:** admin@keells.lk / KeellsAdmin#2024
- **User:** Register a new account

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | User signup |
| POST | /api/auth/login | Login |
| GET | /api/public/products | List products |
| GET | /api/public/categories | List categories |
| GET | /api/public/discounts | List discounts |
| GET | /api/locations/all | Sri Lanka provinces & districts |
| GET | /api/user/cart | Get cart (auth) |
| POST | /api/user/cart/add/{id} | Add to cart |
| POST | /api/user/checkout | Checkout |
| GET | /api/user/orders | My orders |
| GET | /api/admin/dashboard | Dashboard stats (admin) |
| * | /api/admin/* | Admin CRUD (admin) |

## Order Tracking Status

- **READY** – Order placed, being prepared
- **PICKUP** – Picked up for delivery
- **IN_DELIVERY** – Out for delivery
- **HAND_OVER** – Delivered to customer

## GitHub

Push your project to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - Keells Delivery System v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/keells-delivery-system.git
git push -u origin main
```

For versioning, use semantic tags:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

Academic / Research Project - BSC Software Engineering
