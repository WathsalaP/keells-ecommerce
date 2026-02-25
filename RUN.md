# How to Run Keells Delivery System

## Prerequisites
- **PostgreSQL** running (PgAdmin or PostgreSQL service)
- **Java 17+** installed
- **Node.js** (v16+) and npm installed

---

## Step 1: Create Database and Tables in PgAdmin

1. Open **PgAdmin** and connect to PostgreSQL (localhost:5432, user: postgres, password: 1234)
2. Create database `keells_system` if it doesn't exist:
   - Right-click **Databases** → **Create** → **Database**
   - Name: `keells_system`
   - Save
3. Run the setup script:
   - Right-click `keells_system` → **Query Tool**
   - Open file: `scripts/keells_system_schema_and_data.sql`
   - Click **Execute** (F5)
   - You should see: "Keells system tables and sample data created successfully!"

---

## Step 2: Run Backend (Spring Boot)

Open **Cursor Terminal** (Terminal → New Terminal or `` Ctrl+` ``) and run:

```powershell
cd "d:\Documents\ICBT lect note\Research\Keells Delivery System\backend"
mvn spring-boot:run
```

**Wait until you see:** `Started KeellsDeliveryApplication`

The backend runs at **http://localhost:8080**

> **Note:** On first run, the app creates the admin user. On restart, it updates the admin password if changed in code.

---

## Step 3: Run Frontend (React)

Open a **new** terminal in Cursor (Terminal → New Terminal) and run:

```powershell
cd "d:\Documents\ICBT lect note\Research\Keells Delivery System\frontend"
npm install
npm run dev
```

**Wait until you see:** `Local: http://localhost:3000`

The frontend runs at **http://localhost:3000**

---

## Step 4: Open the App

1. Open a browser and go to **http://localhost:3000**
2. **Admin login:** admin@keells.lk / KeellsAdmin#2024
3. **Or register** a new user account to shop

---

## Quick Reference – Terminal Commands

| Task | Command |
|------|---------|
| Start backend | `cd backend` then `mvn spring-boot:run` |
| Start frontend | `cd frontend` then `npm run dev` |
| Install frontend deps | `cd frontend` then `npm install` |
| Build backend | `cd backend` then `mvn clean compile` |

---

## Connection Details (application.properties)

- **Host:** localhost
- **Port:** 5432
- **Database:** keells_system
- **Username:** postgres
- **Password:** 1234

If your PostgreSQL uses different credentials, update `backend/src/main/resources/application.properties`.
