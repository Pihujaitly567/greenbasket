# GreenBasket - Organic Grocery E-commerce Platform

> **Hosted Frontend URL:** `[ADD YOUR DEPLOYED URL HERE]`

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce application for organic grocery shopping with seller dashboard, online payments, and real-time order tracking.

---

## 📋 Project Proposal

### Problem Statement

Traditional grocery shopping faces several challenges:
- **Limited access to organic products** in local markets
- **Time constraints** for working professionals to visit physical stores
- **Lack of transparency** in product sourcing and pricing
- **No order tracking** for customers after purchase
- **Difficulty for small organic farmers/sellers** to reach wider customers

### Solution

**GreenBasket** is a comprehensive e-commerce platform that bridges the gap between organic product sellers and health-conscious consumers by providing:

1. **User-friendly shopping experience** with categorized organic products
2. **Seller dashboard** for vendors to manage products and orders
3. **Real-time order status tracking** from order placement to delivery
4. **Secure online payments** through Razorpay integration
5. **Product reviews and ratings** for buyer trust

---

## ✨ Key Features

### Customer Features
- 🛒 Browse products by categories (Vegetables, Fruits, Dairy, Bakery, etc.)
- 🔍 **Search products via backend API** with real-time results
- 📊 **Sort products** by price (low-high, high-low) and date (newest, oldest)
- 🛍️ Add to cart with quantity management
- 📍 Multiple delivery address management
- 💳 **Online payment via Razorpay** or Cash on Delivery
- 📦 Real-time order status tracking
- ⭐ Product reviews and ratings

### Seller Features
- 📈 Dashboard with analytics (sales, orders, products)
- ➕ Add new products with images
- ✏️ Edit existing products
- 🗑️ Delete products
- 📋 View and manage all orders
- 🔄 Update order status (Processing, Shipped, Delivered)

---

## 🔧 Technical Implementation

### Backend API Endpoints (CRUD Operations)

| Operation | Entity | Endpoint | Description |
|-----------|--------|----------|-------------|
| **CREATE** | Product | `POST /api/product/add` | Add new product |
| **CREATE** | Order | `POST /api/order/cod` | Place order |
| **CREATE** | Address | `POST /api/address/add` | Add delivery address |
| **CREATE** | Review | `POST /api/product/review` | Add product review |
| **READ** | Products | `GET /api/product/list` | Get products with pagination, search, filter, sort |
| **READ** | Product | `POST /api/product/id` | Get single product |
| **READ** | Orders | `GET /api/order/user` | Get user's orders |
| **READ** | Orders | `GET /api/order/all` | Get all orders (seller) |
| **READ** | Addresses | `GET /api/address/get` | Get user's addresses |
| **UPDATE** | Product | `PUT /api/product/update` | Update product details |
| **UPDATE** | Stock | `PUT /api/product/stock` | Toggle product stock |
| **UPDATE** | Order | `PUT /api/order/status` | Update order status |
| **UPDATE** | Cart | `POST /api/cart/update` | Update cart items |
| **DELETE** | Product | `DELETE /api/product/delete` | Delete product |
| **DELETE** | Address | `DELETE /api/address/delete/:id` | Delete address |

### Backend API Features

- **Pagination:** `?page=1&limit=15`
- **Search:** `?q=apple` (searches product names)
- **Filter by Category:** `?category=fruits`
- **Sorting:** `?sort=price_asc` | `price_desc` | `newest` | `oldest`

### Example API Call
```
GET /api/product/list?page=1&limit=15&q=organic&category=vegetables&sort=price_asc
```

---

## 🛠️ Tech Stack

### Frontend
- React.js with Vite
- React Router DOM
- Tailwind CSS
- Axios for API calls
- AOS (Animate on Scroll)
- React Hot Toast

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- Razorpay Payment Gateway
- bcrypt for password hashing

---

## 📁 Project Structure

```
grocery-mern-app/
├── backend/
│   ├── config/          # Database & environment config
│   ├── controller/      # API logic (product, order, address, payment)
│   ├── middlewares/     # Auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── uploads/         # Product images
├── client/
│   ├── src/
│   │   ├── assets/      # Static assets & categories
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (AppContext)
│   │   ├── modals/      # Modal components
│   │   └── pages/       # Page components (Products, Cart, Orders)
│   └── public/
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Razorpay Account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/greenbasket-mern.git
cd greenbasket-mern
```

2. **Setup Backend**
```bash
cd backend
npm install
```

3. **Configure Environment Variables** (backend/.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. **Setup Frontend**
```bash
cd client
npm install
```

5. **Configure Frontend Environment** (client/.env)
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

6. **Run the Application**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

---

## 📸 Screenshots

### Home Page
- Hero section with product categories
- Horizontal scrollable category cards
- Featured products section

### Products Page
- Grid layout with product cards
- Sort dropdown (Price, Date)
- Backend-powered search
- Pagination

### Seller Dashboard
- Analytics overview
- Product management (Add, Edit, Delete)
- Order management with status updates

---

## 👥 Contributors

- **Pihu Jaitly** - Full Stack Developer

---

## 📄 License

This project is licensed under the MIT License.
