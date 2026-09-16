# RDX Fast Food

A full-stack restaurant ordering application built with React/Vite on the frontend and Node.js/Express/MongoDB on the backend.


## Technology Stack

### Frontend
- React
- Vite
- JavaScript/JSX
- Tailwind CSS / existing project styling
- MongoDB as the authoritative application data store; authentication uses secure HTTP-only cookies

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Role-based authorization
- PDF invoice generation

## Main Project Features

### Version 1 — Customer Ordering
- Search
- Menu filters
- Favorites
- Cart
- Quantity control
- Checkout
- Delivery / Pickup
- WhatsApp ordering support

### Version 2 — Customer Account & Ordering Enhancements
- Login / OTP
- Order history
- Reorder
- Reviews
- Coupons
- Offers
- Order tracking
- Notifications

### Version 3 — Restaurant Administration
- Admin dashboard
- Menu management
- Order management
- Kitchen dashboard
- Inventory management
- Analytics
- Invoice generation

### Version 4 — Personalization & Advanced Intelligence
- Loyalty points
- AI recommendations
- Personalized menu
- Advanced analytics

## Authentication

Authentication uses a JWT issued by the backend and stored in a secure HTTP-only `rdx_auth` cookie. The frontend validates the current session through `/api/auth/me` and does not store authentication tokens in browser storage.

The application uses role-based access control for customer and admin operations.

Default development admin credentials used by the project:

- Email: `admin@rdxfastfood.com`
- Password: `admin123`

Change development credentials before deploying to production.

## Customer Features

### Cart

Customer carts are account isolated and stored in MongoDB. Cart ownership is derived from the authenticated user; the frontend does not use browser storage for cart persistence.

### Orders

Orders are stored in MongoDB and associated with the authenticated customer. Orders support delivery and pickup workflows, status history, tracking steps, payment information, discounts, coupons/offers and loyalty information.

### Order Status Flows

Delivery:

`Order Placed → Preparing → Ready → Out for Delivery → Delivered`

Pickup:

`Order Placed → Preparing → Ready for Pickup → Picked Up`

### Notifications

Customer notifications support order, tracking, promotion and informational messages. Order creation and admin status changes can create notifications.

### Coupons

The project includes coupon support with one-time-per-user usage enforcement.

Example coupon codes:

- `RDX10`
- `WELCOME50`
- `RDX20`

### Offers

The project includes one-time-per-user offers with usage tracking.

Example offers:

- `SAVE100`
- `RDX15`
- `MEGA200`

### Loyalty Points

Current loyalty rule:

**Earn 1 point for every ₹50 spent after coupon/offer discounts.**

Redemption is validated by the backend. The loyalty system maintains available points, lifetime earned points, redeemed points and transaction history.

## Admin Features

### Admin Dashboard

Provides MongoDB-backed operational information such as:

- Orders
- Revenue
- Customers
- Active/completed orders
- Menu item availability
- Order status distribution
- Recent orders

### Menu Management

Admin menu operations include:

- Add menu item
- Edit menu item
- Delete menu item
- Delete category
- Availability control
- Bestseller flag
- Chef's Special flag
- Category and price management

Menu changes are persisted in MongoDB and available to the customer menu.

### Order Management

Admin can view customer orders and update order status and payment status. Status history and tracking state are persisted.

### Kitchen Dashboard

Kitchen operations are backed by MongoDB. Kitchen staff/admin can work with preparing and ready states while maintaining the restaurant's existing order workflow.

### Inventory

Inventory supports:

- Stock quantities
- Stock adjustments
- Low-stock thresholds
- Low-stock detection
- Out-of-stock detection
- Search/filtering
- Menu availability based on stock
- Stock reduction during order creation
- Stock restoration when a failed order operation requires rollback

### Analytics

Analytics are calculated from backend/MongoDB data and include operational and business metrics such as:

- Revenue
- Orders
- Average order value
- Customers
- Repeat customers
- Items sold
- Discounts
- Payment mix
- Order status
- Peak ordering hours
- Top-selling items
- Category revenue
- Coupon/offer performance
- Delivery vs pickup
- Loyalty performance
- Daily revenue

Supported reporting periods include 1, 7, 30, 90 days and all time, depending on the analytics endpoint/UI.

### Invoice Generation

Invoices are generated from persisted MongoDB order data.

Invoice information can include:

- Order ID
- Date
- Customer details
- Delivery/pickup type
- Ordered items
- Quantity
- Item prices
- Subtotal
- Coupon discount
- Offer discount
- Loyalty discount/points information
- Total
- Payment/bill status

Admin can access invoices for orders they manage, while customers are restricted to their own invoices.

## AI Recommendations

The recommendation system uses available customer and menu signals such as:

- Previous orders
- Frequently purchased items
- Favorites
- Preferred categories
- Bestsellers
- Chef's Specials
- Current availability/inventory

Unavailable or out-of-stock products are excluded from recommendations.

## Personalized Menu

The personalized menu uses customer-specific behavior and menu information to produce sections such as:

- For You
- Favorites
- Recently Ordered
- Try Something New

The backend uses the authenticated customer's identity and does not expose another customer's personalization data.

## Important API Areas

The backend is organized around API groups including:

- `/api/auth`
- `/api/menu`
- `/api/favorites`
- `/api/cart`
- `/api/coupons`
- `/api/offers`
- `/api/notifications`
- `/api/orders`
- `/api/kitchen`
- `/api/inventory`
- `/api/analytics`
- `/api/invoices`
- `/api/loyalty`
- `/api/recommendations`
- `/api/personalized-menu`

Exact endpoint availability should be checked in the corresponding route files in `server/routes`.

## Backend Structure

```text
Backend/
├── config/
│   └── db.js
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── seedMenuData.js
├── seedCoupons.js
├── seedOffers.js
├── package.json
├── .env
└── .env.example
```

## Frontend Structure

```text
src/
├── components/
├── App.jsx
├── api.js
├── main.jsx
└── index.css
```

Important UI components include customer and administration modules such as:

- Navbar
- Menu
- Cart
- Checkout
- Order History
- Order Tracking
- Reviews
- Notifications
- Loyalty Points
- AI Recommendations
- Personalized Menu
- Admin Dashboard
- Menu Management
- Order Management
- Kitchen Dashboard
- Inventory Management
- Analytics
- Invoice

## Environment Configuration

Frontend API base URL is controlled through:

`VITE_API_URL`

If it is not supplied, the application defaults to:

`http://localhost:5000/api`

Backend MongoDB configuration and authentication secrets are supplied through the backend `.env` file. Do not commit production secrets to source control.

## Running the Project

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd Backend
npm install
```

Configure `Backend/.env` with the MongoDB connection, client URL, JWT secret and admin credentials.

Start both frontend and backend together from the project root:

```bash
npm run dev:full
```

Or run them separately:

```bash
npm run dev
```

and in another terminal:

```bash
npm run server
```

The root `server` script points to the actual `Backend/` directory.

## Security Notes

- Protected customer/admin routes require JWT authentication.
- Admin operations require the admin role.
- Customer ownership is derived from authentication rather than trusted client-supplied ownership fields.
- Loyalty redemption is validated server-side.
- Inventory changes are handled server-side.
- Customers cannot access other customers' orders or invoices through protected APIs.
- Production deployments should use strong secrets and non-default administrator credentials.

## UI / Theme Preservation Rule

**The existing RDX Fast Food UI and theme must not be changed unless explicitly requested.**

Future development should:

- Preserve the existing layout
- Preserve colors and visual styling
- Preserve existing buttons and navigation
- Preserve existing functionality
- Add backend functionality without unnecessary redesign
- Keep new functionality consistent with the current RDX Fast Food design language

## Development Roadmap

### Completed

- Backend V1 — Customer ordering foundation
- Backend V2 — Authentication, customer ordering enhancements, coupons, offers, tracking and notifications
- Backend V3 — Admin Dashboard, Menu Management, Order Management, Kitchen Dashboard, Inventory, Analytics and Invoice Generation
- Backend V4 — Loyalty Points, AI Recommendations, Personalized Menu and Advanced Analytics

### Removed From Scope

The following features are intentionally not part of the final roadmap:

- Multiple Restaurant Branches
- Automated Marketing

They should not be reintroduced unless explicitly requested.

## Project Principle

The application is developed incrementally. Each version builds on the previous version, with MongoDB as the backend source of truth for persisted business data and the existing frontend UI/theme preserved throughout.

## Data Storage Policy
All persistent application data is backend/MongoDB driven. The frontend does not use browser storage APIs for authentication, cart, favorites, menu, inventory, orders, notifications, reviews, loyalty, or other application state. Authentication is maintained with a secure HTTP-only cookie issued by the backend.
