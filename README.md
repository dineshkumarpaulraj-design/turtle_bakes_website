# 🐢 Turtle Bakes — Full-Stack Bakery E-Commerce

A complete, production-ready bakery ordering web application built with vanilla HTML/CSS/JS, Supabase, and Razorpay.

---

## 📁 Project Structure

```
turtle-bakes/
├── index.html                  # Home page (product listing)
├── css/
│   └── style.css               # Global styles & design system
├── js/
│   ├── supabase-config.js      # 🔧 Supabase credentials (configure this first)
│   ├── app.js                  # Core: products, cart, auth, toast
│   ├── home.js                 # Home page: render & filter products
│   ├── product-detail.js       # Product detail page
│   ├── cart.js                 # Cart page: add/remove/qty
│   ├── checkout.js             # Checkout + Razorpay payment
│   └── auth.js                 # Login, Register, Logout
├── pages/
│   ├── product-detail.html     # Product detail page
│   ├── cart.html               # Shopping cart
│   ├── checkout.html           # Checkout form + payment
│   ├── auth.html               # Login / Register
│   └── success.html            # Order success confirmation
└── schema.sql                  # Supabase database schema (run once)
```

---

## 🚀 Setup Guide

### Step 1 — Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region near India — e.g., `ap-south-1`)
3. Go to **Settings → API**
4. Copy your **Project URL** and **anon public key**
5. Open `js/supabase-config.js` and replace:

```js
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key-here';
```

6. In Supabase, go to **SQL Editor** and run the entire contents of `schema.sql`
7. Enable Email Auth: Go to **Authentication → Providers → Email** and ensure it's enabled

---

### Step 2 — Razorpay Setup

1. Go to [https://razorpay.com](https://razorpay.com) and create a free account
2. Complete KYC (required for live payments)
3. For testing, go to **Settings → API Keys → Test Mode**
4. Generate a **Key ID** (starts with `rzp_test_`)
5. Open `js/checkout.js` and replace:

```js
const RAZORPAY_KEY_ID = 'rzp_test_YourKeyIDHere';
```

> ⚠️ **Important:** Never expose your Key Secret in frontend code.
> For production, create a backend endpoint to generate Razorpay `order_id` using the Key Secret.

---

### Step 3 — Run the Project

#### Option A — VS Code Live Server (Recommended)
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

#### Option B — Python HTTP Server
```bash
cd turtle-bakes
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

#### Option C — Node.js serve
```bash
npx serve turtle-bakes
```

---

## 🛒 Features

| Feature | Status |
|---|---|
| Product listing with categories | ✅ |
| Category filter (All / Ice Cakes / Brownies / Bento) | ✅ |
| Product detail page | ✅ |
| Add to cart / remove / update qty | ✅ |
| Cart persists via LocalStorage | ✅ |
| Free delivery above ₹500 | ✅ |
| Checkout with delivery form | ✅ |
| Form validation | ✅ |
| Razorpay payment popup | ✅ |
| Order saved to Supabase | ✅ |
| User registration | ✅ |
| User login / logout | ✅ |
| Toast notifications | ✅ |
| Loading animations | ✅ |
| Mobile responsive | ✅ |
| Order success page | ✅ |
| Cake message field | ✅ |

---

## 🧾 Product Catalog

### 🎂 Ice Cakes (½ kg)
| Product | Price |
|---|---|
| Vanilla Cake | ₹380 |
| Strawberry Cake | ₹390 |
| Black Forest Cake | ₹430 |
| White Forest Cake | ₹430 |
| Butterscotch Cake | ₹440 |
| Pista Flavour Cake | ₹450 |
| Rasamalai Cake | ₹480 |
| Chocotruffle Cake | ₹480 |

### 🍫 Brownies
| Product | Price |
|---|---|
| Classic Brownie | ₹220 |
| Milk Chocolate Brownie | ₹235 |
| Double Chocolate Brownie | ₹245 |
| Triple Chocolate Brownie | ₹255 |

### 🎁 Bento Cakes (Mini Ice Cakes)
| Product | Price |
|---|---|
| Vanilla | ₹270 |
| White Forest | ₹280 |
| Rasamalai | ₹290 |
| Butterscotch | ₹290 |
| Pista | ₹300 |
| Rosemilk | ₹300 |
| Chocotruffle | ₹320 |

---

## 🗄️ Database Schema

### `profiles`
| Column | Type | Description |
|---|---|---|
| id | UUID | Linked to auth.users |
| full_name | TEXT | Customer name |
| phone | TEXT | Contact number |
| email | TEXT | Email address |
| created_at | TIMESTAMPTZ | Auto |

### `products` (optional, for admin panel)
| Column | Type | Description |
|---|---|---|
| id | SERIAL | Auto increment |
| name | TEXT | Product name |
| category | TEXT | Ice Cakes / Brownies / Bento Cakes |
| price | INTEGER | In INR |
| description | TEXT | Short description |
| emoji | TEXT | Visual icon |
| badge | TEXT | Label like 'Bestseller' |
| is_active | BOOLEAN | Toggle visibility |

### `orders`
| Column | Type | Description |
|---|---|---|
| id | UUID | Auto |
| user_id | UUID | Nullable (guest orders) |
| customer_name | TEXT | Full name |
| customer_phone | TEXT | Mobile number |
| customer_email | TEXT | Email |
| delivery_address | TEXT | Full address |
| cake_message | TEXT | Message on cake |
| order_notes | TEXT | Special instructions |
| items | JSONB | Array of cart items |
| total | INTEGER | Total in INR |
| status | TEXT | pending / confirmed / preparing / delivered |
| payment_id | TEXT | Razorpay payment ID |
| created_at | TIMESTAMPTZ | Auto |

---

## 💳 Payment Flow

```
User fills checkout form
        ↓
Form validation runs
        ↓
Razorpay popup opens
        ↓
User pays (UPI/Card/NetBanking)
        ↓
razorpay handler() fires on success
        ↓
Order saved to Supabase orders table
        ↓
Cart cleared
        ↓
Redirect to success.html?pid=pay_xxxxxx
```

---

## 🔐 Security Notes

- **Never put your Razorpay Key Secret in frontend code**
- For production, create a backend (Node.js/Python) to:
  1. Create Razorpay `order_id` using the secret
  2. Verify payment signature after payment
- Supabase RLS (Row Level Security) is enabled — users can only see their own data
- Guest orders (no login required) are supported by design

---

## 📱 Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, and all modern mobile browsers.

---

## 🎨 Design System

- **Font Display:** Playfair Display (serif, elegant)
- **Font Body:** DM Sans (clean, modern)
- **Primary:** Chocolate `#3D1F0A` 
- **Accent:** Caramel `#C07A2A`
- **Background:** Cream `#FDF6EC`
- **Rose accent:** `#E8B4B8`

---

## 📞 Support

For Turtle Bakes business — Kāraikkudi, Tamil Nadu 🇮🇳

---

*Built with ❤️ for Turtle Bakes*
