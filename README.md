# 🍔 RDX Fast Food — Restaurant Management Platform

<div align="center">
  <h3>
    🚀 Live Demo:
    <a href="https://rdx-fast-food.netlify.app" target="_blank">
      View Live Here
    </a>
  </h3>
</div>

<div align="center">

![Frontend](https://img.shields.io/badge/Frontend-React%2FVite-61DAFB?logo=react&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Node.js%2FExpress-339933?logo=node.js&logoColor=white)
![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white)
![ODM](https://img.shields.io/badge/ODM-Mongoose-880000?logo=mongodb&logoColor=white)
![Authentication](https://img.shields.io/badge/Auth-JWT%20%2B%20HTTP--Only%20Cookie-orange)

</div>

---

## 📌 What Is RDX Fast Food?

**RDX Fast Food** is a full-stack restaurant ordering and management platform that brings the customer ordering journey and restaurant operations into one connected system.

The platform is designed around a clear separation of responsibilities:

- **React + Vite** delivers the customer and administration interfaces.
- **Node.js + Express** provides the application API, authentication, authorization and business logic.
- **MongoDB Atlas + Mongoose** stores persistent restaurant and customer data.
- **Netlify** hosts the production frontend.
- **Render** hosts the production backend API.



---

## 🔑 Demo Login Credentials

Use these demo credentials to test the RDX Fast Food application.

### Customer
- **Email:** `customer@test.com`
- **Password:** `123456`

### Admin
- **Email:** `admin@rdxfastfood.com`
- **Password:** `admin123`

## 🎯 What RDX Fast Food Does

RDX connects two sides of restaurant operations.

### 👤 Customer Experience

Customers can:

- Discover the restaurant menu.
- Search and filter food items.
- View prices and availability.
- Save favorite items.
- Manage a persistent cart.
- Adjust quantities.
- Choose delivery or pickup.
- Complete checkout.
- Apply eligible coupons and offers.
- Redeem available loyalty points.
- Place orders.
- View order history.
- Reorder previous purchases.
- Track active orders.
- Receive notifications.
- Submit and update reviews.
- View personalized menu sections.
- Receive food recommendations.
- Manage their account information.

### 🛠️ Restaurant Administration

Administrators can:

- Monitor restaurant activity from a centralized dashboard.
- Manage menu items and categories.
- Control menu availability.
- Mark bestsellers and chef's specials.
- View and manage customer orders.
- Update order and payment status.
- Operate the kitchen workflow.
- Manage inventory and stock levels.
- Detect low-stock and out-of-stock items.
- Review operational and business analytics.
- Generate PDF invoices.
- Monitor coupon, offer and loyalty activity.

---

# ✨ Product Capabilities

## 🍔 Menu Discovery

The customer menu is backed by MongoDB through the backend API.

Customers can:

- Browse menu items.
- Search items.
- Filter items.
- View pricing.
- View availability.
- Identify bestseller items.
- Identify chef's special items.
- Discover personalized and recommended items.

Menu changes made by administrators are persisted and reflected in the customer-facing menu.

---

## ❤️ Favorites

Customers can save menu items as favorites.

Favorites are associated with the authenticated customer account, keeping one customer's saved items isolated from other accounts.

---

## 🛒 Cart Management

The cart is account-scoped and MongoDB-backed.

It supports:

- Adding items.
- Removing items.
- Quantity changes.
- Account-specific persistence.
- Backend validation.

The frontend does not use browser storage as the authoritative source for persistent cart data.

---

## 💳 Checkout & Ordering

Checkout brings together:

- Customer information.
- Delivery details.
- Pickup selection.
- Cart validation.
- Quantity validation.
- Coupon validation.
- Offer validation.
- Loyalty validation.
- Price calculation.
- Payment/bill status.
- Final order creation.

The backend validates and persists the final order in MongoDB.

---

## 🚚 Delivery & Pickup

### Delivery Workflow

```text
Order Placed
    ↓
Preparing
    ↓
Ready
    ↓
Out for Delivery
    ↓
Delivered
```

### Pickup Workflow

```text
Order Placed
    ↓
Preparing
    ↓
Ready for Pickup
    ↓
Picked Up
```

Order status and tracking state are persisted by the backend.

---

## 📦 Order History & Reorder

Customers can:

- View previous orders.
- Inspect order details.
- Track active orders.
- Reorder previous purchases.
- Access their own invoice information where supported.

Protected APIs prevent customers from accessing another customer's orders or invoices.

---

## ⭐ Reviews

Customers can submit reviews for eligible orders and update their review information through the protected review workflow.

---

## 🎟️ Coupons

Coupon functionality includes server-side validation and one-time-per-customer usage enforcement.

Example coupon codes included by the project:

```text
RDX10
WELCOME50
RDX20
```

Coupon eligibility and discount calculation are controlled by the backend.

---

## 🎁 Offers

Offer functionality includes usage tracking and one-time-per-customer enforcement.

Example offer codes included by the project:

```text
SAVE100
RDX15
MEGA200
```

Offer validation and discount processing are handled by the backend.

---

## 🏆 Loyalty Points

The current loyalty rule is:

> **Earn 1 point for every ₹50 spent after coupon and offer discounts.**

The loyalty system maintains:

- Available points.
- Lifetime earned points.
- Redeemed points.
- Loyalty transaction history.

Loyalty redemption is validated server-side.

---

## 🤖 AI Recommendations

The recommendation system uses available customer and menu signals including:

- Previous orders.
- Frequently purchased items.
- Favorites.
- Preferred categories.
- Bestsellers.
- Chef's specials.
- Current availability.
- Inventory availability.

Unavailable or out-of-stock products are excluded from recommendations.

---

## 🎯 Personalized Menu

The personalized menu can provide sections such as:

- **For You**
- **Favorites**
- **Recently Ordered**
- **Try Something New**

Personalization uses the authenticated customer's own activity and menu information. Customer-specific personalization data is not exposed across accounts.

---

## 🔔 Notifications

Notifications can cover:

- Orders.
- Order tracking.
- Promotions.
- Informational messages.

Order creation and administrative status changes can generate notifications.

---

# 🔐 Authentication & Authorization

RDX uses backend-controlled authentication.

The system uses:

- JWT authentication.
- Secure HTTP-only `rdx_auth` cookies.
- Role-based authorization.
- Protected customer routes.
- Protected administrator routes.
- Server-side customer ownership checks.

Authentication tokens are not stored in `localStorage` or `sessionStorage`.

The frontend validates the current authenticated session through the backend authentication API.

### Development Administrator Configuration

The application supports administrator initialization through environment variables:

```env
ADMIN_EMAIL=admin@rdxfastfood.com
ADMIN_PASSWORD=<your-development-password>
```

Use a strong, unique administrator password in production.

---

# 🛠️ Restaurant Administration

## 📊 Admin Dashboard

The dashboard provides MongoDB-backed operational information such as:

- Orders.
- Revenue.
- Customers.
- Active and completed orders.
- Menu availability.
- Order status distribution.
- Recent orders.

---

## 🍔 Menu Management

Administrators can:

- Add menu items.
- Edit menu items.
- Delete menu items.
- Delete categories.
- Control availability.
- Mark bestsellers.
- Mark chef's specials.
- Manage categories.
- Manage prices.

All menu changes are persisted in MongoDB.

---

## 📋 Order Management

Administrators can:

- View customer orders.
- Inspect order details.
- Update order status.
- Update payment status.
- Maintain order progression.
- Persist tracking state.

---

## 👨‍🍳 Kitchen Dashboard

The kitchen dashboard is connected to the order lifecycle.

Kitchen/admin operations support states such as:

```text
Order Placed
    ↓
Preparing
    ↓
Ready
```

Kitchen operations are persisted through the backend and MongoDB.

---

## 📦 Inventory Management

Inventory supports:

- Stock quantities.
- Stock adjustments.
- Low-stock thresholds.
- Low-stock detection.
- Out-of-stock detection.
- Search and filtering.
- Menu availability based on stock.
- Stock reduction during order creation.
- Stock restoration when a failed order operation requires rollback.

Inventory changes are controlled by the backend.

---

## 📈 Analytics

Analytics are calculated from backend/MongoDB data.

Metrics include:

- Revenue.
- Orders.
- Average order value.
- Customers.
- Repeat customers.
- Items sold.
- Discounts.
- Payment mix.
- Order status.
- Peak ordering hours.
- Top-selling items.
- Category revenue.
- Coupon performance.
- Offer performance.
- Delivery vs pickup.
- Loyalty performance.
- Daily revenue.

Supported reporting periods include:

```text
1 Day
7 Days
30 Days
90 Days
All Time
```

---

## 🧾 Invoice Generation

Invoices are generated from persisted MongoDB order data.

Invoice information can include:

- Order ID.
- Date.
- Customer details.
- Delivery/pickup type.
- Ordered items.
- Quantity.
- Item prices.
- Subtotal.
- Coupon discount.
- Offer discount.
- Loyalty discount and points information.
- Total.
- Payment/bill status.

Invoice access is protected according to the authenticated customer or administrator role.

---

# 🔌 Backend API Areas

The backend is organized around functional API areas including:

```text
/api/auth
/api/menu
/api/favorites
/api/cart
/api/coupons
/api/offers
/api/notifications
/api/orders
/api/kitchen
/api/inventory
/api/analytics
/api/invoices
/api/loyalty
/api/recommendations
/api/personalized-menu
/api/reviews
```

Exact endpoint definitions and request/response contracts are maintained in the backend route implementation.

---

# 🧰 Technology Stack

## Frontend

| Technology | Role |
|---|---|
| React | Component-based user interface |
| Vite | Development server and production build tooling |
| JavaScript / JSX | Application logic and UI components |
| CSS / Existing project styling | Visual presentation and responsive interface |
| Fetch API | Frontend-to-backend communication |


---

## Backend

| Technology | Role |
|---|---|
| Node.js | JavaScript runtime |
| Express | REST API and HTTP server |
| Mongoose | MongoDB object modeling and data access |
| JWT | Authentication |
| HTTP-only Cookies | Secure session transport |
| Role-based Authorization | Customer/admin access control |
| CORS | Controlled frontend/backend communication |
| PDF Generation | Invoice generation |

---

## Database

| Technology | Role |
|---|---|
| MongoDB Atlas | Production cloud database |
| MongoDB | Persistent application data store |
| Mongoose | Backend data modeling and database access |

MongoDB is the authoritative persistent data store for the application.

---

## Deployment & Infrastructure

| Service | Responsibility |
|---|---|
| GitHub | Source control and deployment source |
| Netlify | Production React/Vite frontend |
| Render | Production Node.js/Express backend |
| MongoDB Atlas | Production database |

---

# 🏗️ Application Architecture

```text
                         ┌──────────────────────┐
                         │       Customer       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ React + Vite         │
                         │ Netlify              │
                         └──────────┬───────────┘
                                    │
                                  /api/*
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Netlify API Proxy    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Node.js + Express    │
                         │ Render               │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
           ┌────────────────┐             ┌────────────────┐
           │ Authentication │             │ Business Logic │
           │ JWT + Cookie   │             │ Validation     │
           └────────────────┘             └───────┬────────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │   Mongoose   │
                                            └──────┬───────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ MongoDB Atlas   │
                                          │ rdx_fast_food   │
                                          └─────────────────┘
```

---

# 🔄 Complete End-to-End Workflow

## 1. Customer Opens the Platform

```text
Customer
   ↓
https://rdx-fast-food.netlify.app
   ↓
React + Vite Frontend
```

The customer interacts with the RDX Fast Food interface.

---

## 2. Frontend Requests Data

```text
React Frontend
      ↓
     /api
      ↓
Netlify Proxy
      ↓
Render Backend
```

The browser does not connect directly to MongoDB.

---

## 3. Backend Handles the Request

```text
Node.js + Express
       ↓
Authentication
       ↓
Authorization
       ↓
Validation
       ↓
Business Logic
       ↓
Mongoose
       ↓
MongoDB Atlas
```

The backend controls permissions, validation, calculations and database operations.

---

## 4. Customer Builds a Cart

```text
Browse Menu
    ↓
Search / Filter
    ↓
Select Food
    ↓
Add to Favorites
    ↓
Add to Cart
    ↓
Change Quantity
```

Cart information is persisted for the authenticated account through MongoDB.

---

## 5. Customer Checks Out

```text
Cart
 ↓
Checkout
 ↓
Delivery / Pickup
 ↓
Validate Items
 ↓
Validate Stock
 ↓
Validate Coupon
 ↓
Validate Offer
 ↓
Validate Loyalty
 ↓
Calculate Final Amount
```

---

## 6. Order Is Created

```text
Validated Checkout
       ↓
Create Order
       ↓
Persist Order in MongoDB
       ↓
Update Inventory
       ↓
Record Discount Usage
       ↓
Process Loyalty Information
       ↓
Create Notification
```

If a protected order operation fails, the backend provides rollback handling for relevant inventory, coupon, offer and loyalty changes.

---

## 7. Restaurant Processes the Order

```text
Order Placed
     ↓
Admin / Kitchen Dashboard
     ↓
Preparing
     ↓
Ready
     ↓
Delivery / Pickup
     ↓
Completed
```

---

## 8. Customer Tracks the Order

```text
Customer
    ↓
Order History / Tracking
    ↓
Backend API
    ↓
MongoDB
    ↓
Current Order Status
```

---

## 9. Restaurant Reviews Performance

```text
Orders
  +
Customers
  +
Inventory
  +
Payments
  +
Discounts
  +
Loyalty
      ↓
MongoDB
      ↓
Analytics API
      ↓
Admin Analytics
```

---

# 📁 Project Folder Structure

```text
RDX-Fast-Food/
│
├── Backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── seedMenuData.js
│   ├── seedCoupons.js
│   ├── seedOffers.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── src/
│   ├── components/
│   │   ├── Navbar
│   │   ├── Menu
│   │   ├── Cart
│   │   ├── Checkout
│   │   ├── Order History
│   │   ├── Order Tracking
│   │   ├── Reviews
│   │   ├── Notifications
│   │   ├── Loyalty Points
│   │   ├── AI Recommendations
│   │   ├── Personalized Menu
│   │   ├── Admin Dashboard
│   │   ├── Menu Management
│   │   ├── Order Management
│   │   ├── Kitchen Dashboard
│   │   ├── Inventory Management
│   │   ├── Analytics
│   │   └── Invoice
│   │
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   └── index.css
│
├── public/
│
├── netlify.toml
├── package.json
├── .gitignore
└── README.md
```

The folder structure separates frontend presentation, backend API responsibilities, database access, authentication, business logic and deployment configuration.

---

# ⚙️ Environment Configuration

Environment variables keep deployment configuration and secrets outside application source code.

## Frontend `.env`

Create the frontend environment file in the project root when local configuration is required:

```env
VITE_API_URL=http://localhost:5000/api
```

For the deployed Netlify frontend:

```env
VITE_API_URL=/api
```

### Important

Never place the following in frontend `VITE_*` variables:

- MongoDB credentials.
- JWT secrets.
- Admin passwords.
- Private backend secrets.

Frontend `VITE_*` values are included in the browser build.

---

## Backend `.env`

Create:

```text
Backend/.env
```

Use the following structure:

```env
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rdx_fast_food?retryWrites=true&w=majority

CLIENT_URL=http://localhost:5173,https://rdx-fast-food.netlify.app

JWT_SECRET=<strong-random-secret>

ADMIN_EMAIL=admin@rdxfastfood.com
ADMIN_PASSWORD=<strong-development-password>
```

### Environment Variable Reference

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment |
| `MONGODB_URI` | MongoDB Atlas connection |
| `CLIENT_URL` | Allowed frontend origin(s) |
| `JWT_SECRET` | JWT signing secret |
| `ADMIN_EMAIL` | Administrator email |
| `ADMIN_PASSWORD` | Administrator password |
| `VITE_API_URL` | Frontend API base URL |

### Production Rule

Use unique production values for:

```env
JWT_SECRET
ADMIN_PASSWORD
```

Never commit the real `.env` file to GitHub.

Use `.env.example` to document required configuration without exposing secrets.

Example:

```env
NODE_ENV=development
MONGODB_URI=
CLIENT_URL=http://localhost:5173
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

# 🚀 Local Development

## Requirements

Install:

- Node.js.
- npm.
- Git.
- MongoDB Atlas access or a compatible MongoDB database.

---

## Install Frontend Dependencies

```bash
npm install
```

## Install Backend Dependencies

```bash
cd Backend
npm install
cd ..
```

## Configure Environment

Create:

```text
Backend/.env
```

and configure:

```env
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rdx_fast_food?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
JWT_SECRET=<strong-random-secret>
ADMIN_EMAIL=admin@rdxfastfood.com
ADMIN_PASSWORD=<development-password>
```

For local frontend API access:

```env
VITE_API_URL=http://localhost:5000/api
```

## Start Frontend & Backend Together

From the project root:

```bash
npm run dev:full
```

## Or Start Separately

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run server
```

The root server script points to the actual `Backend/` directory.

---

# 🌱 Database Initialization

The backend contains seed utilities for core application data, including:

```text
seedMenuData.js
seedCoupons.js
seedOffers.js
```

MongoDB stores the persistent application state after initialization.

The backend is responsible for reading and writing application data rather than treating the frontend as the source of truth.

---

# 🔒 Security & Data Ownership

RDX uses server-side authorization and ownership checks.

Security principles include:

- JWT authentication.
- HTTP-only authentication cookies.
- Role-based access control.
- Protected customer APIs.
- Protected admin APIs.
- Server-side customer ownership checks.
- Server-side inventory validation.
- Server-side loyalty validation.
- Backend-controlled order calculations.
- Protected invoice access.
- No authentication tokens in browser storage.
- No reliance on browser storage for persistent business data.

Customers can access only their own protected customer resources.

Administrators require the administrator role for administrative operations.

---

# 💾 Data Storage Policy

Persistent application data is backend/MongoDB driven.

MongoDB is the authoritative source for:

- Authentication-related user persistence.
- Cart data.
- Favorites.
- Menu data.
- Inventory.
- Orders.
- Notifications.
- Reviews.
- Loyalty.
- Customer-specific personalization.
- Other persistent business data.

The frontend is responsible for presentation and interaction; it does not replace the backend database as the source of truth.

---

# 🔁 Reliability & Business Logic

Important business operations are handled server-side.

### Inventory

```text
Order Request
    ↓
Check Stock
    ↓
Reduce Stock
    ↓
Create Order
    ↓
Success → Keep Change
    ↓
Failure → Restore Stock
```

### Coupons & Offers

```text
Coupon / Offer
      ↓
Validate Customer
      ↓
Validate Eligibility
      ↓
Calculate Discount
      ↓
Record Usage
```

### Loyalty

```text
Eligible Order
      ↓
Calculate Qualifying Spend
      ↓
Award Points
      ↓
Store Loyalty Transaction
```

This prevents critical business calculations from being controlled only by the browser.

---

# 🎨 UI & Product Design Principle

The established RDX Fast Food interface is preserved throughout development.

Future changes should:

- Preserve the existing layout.
- Preserve established colors and visual styling.
- Preserve navigation.
- Preserve existing functionality.
- Avoid unnecessary redesign.
- Keep new features consistent with the current RDX Fast Food design language.
- Improve capability without disrupting the established customer experience.

---

# 🧭 From Restaurant Website to Full Platform

RDX Fast Food was developed incrementally from a customer-facing restaurant website into a connected full-stack restaurant platform.

The overall journey was:

```text
Restaurant Website Foundation
        ↓
Menu Discovery
        ↓
Search & Filtering
        ↓
Favorites
        ↓
Cart & Quantity Management
        ↓
Checkout
        ↓
Delivery / Pickup
        ↓
Customer Authentication
        ↓
Order History & Reorder
        ↓
Reviews
        ↓
Coupons & Offers
        ↓
Order Tracking
        ↓
Notifications
        ↓
Admin Dashboard
        ↓
Menu Management
        ↓
Order Management
        ↓
Kitchen Dashboard
        ↓
Inventory Management
        ↓
Analytics
        ↓
Invoice Generation
        ↓
Loyalty Points
        ↓
AI Recommendations
        ↓
Personalized Menu
        ↓
Advanced Analytics
        ↓
MongoDB-backed Full-stack Platform
        ↓
Netlify + Render + MongoDB Atlas Deployment
```

---

# 🌐 Production Deployment Workflow

## Frontend

```text
Developer
    ↓
Git
    ↓
GitHub
    ↓
Netlify
    ↓
npm run build
    ↓
dist/
    ↓
Live React Application
```

## Backend

```text
Developer
    ↓
Git
    ↓
GitHub
    ↓
Render
    ↓
npm install
    ↓
npm start
    ↓
Node.js + Express API
```

## Database

```text
Render Backend
      ↓
Mongoose
      ↓
MongoDB Atlas
      ↓
rdx_fast_food
```

---

# 🔗 Production Request Flow

```text
Customer
   ↓
https://rdx-fast-food.netlify.app
   ↓
React + Vite
   ↓
/api/*
   ↓
Netlify Proxy
   ↓
https://rdx-fast-food.onrender.com
   ↓
Node.js + Express
   ↓
Authentication + Business Logic
   ↓
Mongoose
   ↓
MongoDB Atlas
```

---

# 🧪 Production Verification Checklist

## Customer Experience

- [ ] Homepage loads.
- [ ] Menu loads from backend.
- [ ] Search works.
- [ ] Filters work.
- [ ] Favorites work.
- [ ] Cart works.
- [ ] Quantity changes persist.
- [ ] Login works.
- [ ] Customer session persists.
- [ ] Checkout works.
- [ ] Delivery selection works.
- [ ] Pickup selection works.
- [ ] Coupons work.
- [ ] Offers work.
- [ ] Loyalty works.
- [ ] Order placement works.
- [ ] Order history works.
- [ ] Reorder works.
- [ ] Order tracking works.
- [ ] Notifications work.
- [ ] Reviews work.
- [ ] Recommendations work.
- [ ] Personalized menu works.

## Administration

- [ ] Admin login works.
- [ ] Dashboard loads.
- [ ] Menu management works.
- [ ] Order management works.
- [ ] Kitchen dashboard works.
- [ ] Inventory works.
- [ ] Analytics work.
- [ ] Invoice generation works.
- [ ] Payment/bill status updates work.

## Infrastructure

- [ ] Netlify frontend is published.
- [ ] Netlify `/api` proxy reaches Render.
- [ ] Render backend is running.
- [ ] MongoDB Atlas connection is healthy.
- [ ] Production CORS is configured.
- [ ] Production authentication cookie works.
- [ ] Production secrets are not committed to GitHub.

---

# 🚫 Out of Scope

The following capabilities are intentionally excluded from the current product:

- Multiple Restaurant Branches.
- Automated Marketing.

They should not be introduced unless explicitly requested.

---

# 🏁 Final Product Summary

RDX Fast Food brings together:

```text
Customer Ordering
       +
Authentication
       +
Menu Management
       +
Cart & Checkout
       +
Orders & Tracking
       +
Kitchen Operations
       +
Inventory
       +
Coupons & Offers
       +
Reviews
       +
Notifications
       +
Loyalty
       +
AI Recommendations
       +
Personalization
       +
Analytics
       +
Invoices
       +
Cloud Deployment
```

**RDX Fast Food is not only a menu and ordering interface; it is a connected restaurant operations platform built around customer experience, operational control and centralized data.**
