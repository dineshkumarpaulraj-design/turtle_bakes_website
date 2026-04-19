-- ============================================================
-- TURTLE BAKES — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  phone       TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: products (optional — for admin panel use)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,   -- 'Ice Cakes', 'Brownies', 'Bento Cakes'
  price       INTEGER NOT NULL, -- in INR
  description TEXT,
  emoji       TEXT,
  badge       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name     TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,
  customer_email    TEXT,
  delivery_address  TEXT NOT NULL,
  cake_message      TEXT,
  order_notes       TEXT,
  items             JSONB NOT NULL,  -- Array of cart items
  total             INTEGER NOT NULL, -- in INR
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_id        TEXT,  -- Razorpay payment ID
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Products: Anyone can read products (public catalog)
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Orders: Users see their own orders; guests allowed to insert
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);  -- Allows guest checkout

-- ============================================================
-- SEED: Products (optional)
-- Uncomment to pre-populate product table
-- ============================================================

/*
INSERT INTO public.products (name, category, price, emoji, badge, description) VALUES
  ('Vanilla Cake',        'Ice Cakes',    380, '🍰', 'Classic',   'Classic vanilla sponge with fresh cream frosting.'),
  ('Strawberry Cake',     'Ice Cakes',    390, '🍓', 'Fruity',    'Fresh strawberry flavour with whipped cream.'),
  ('Black Forest Cake',   'Ice Cakes',    430, '🍒', 'Bestseller','Rich chocolate sponge layered with cherries and cream.'),
  ('White Forest Cake',   'Ice Cakes',    430, '🤍', 'Popular',   'White chocolate sponge with cream and cherry delight.'),
  ('Butterscotch Cake',   'Ice Cakes',    440, '🧁', 'Sweet',     'Caramel butterscotch cream cake with praline topping.'),
  ('Pista Flavour Cake',  'Ice Cakes',    450, '💚', 'Nutty',     'Pistachio-infused sponge with green cream frosting.'),
  ('Rasamalai Cake',      'Ice Cakes',    480, '🌸', 'Special',   'Saffron cream with rose petals — inspired by rasmalai.'),
  ('Chocotruffle Cake',   'Ice Cakes',    480, '🍫', 'Indulgent', 'Decadent dark chocolate truffle with ganache drip.'),
  ('Classic Brownie',     'Brownies',     220, '🟫', 'Classic',   'Fudgy, dense, and perfectly chocolatey.'),
  ('Milk Chocolate Brownie','Brownies',   235, '🍬', 'Creamy',    'Creamy milk chocolate swirled into a gooey brownie.'),
  ('Double Chocolate Brownie','Brownies', 245, '🍪', 'Double',    'Double the chocolate — dark cocoa with chocolate chips.'),
  ('Triple Chocolate Brownie','Brownies', 255, '🎯', 'Ultimate',  'Dark, milk, and white chocolate in one ultimate brownie.'),
  ('Vanilla Bento',       'Bento Cakes',  270, '🍰', 'Mini',      'Adorable mini vanilla cake for personal celebrations.'),
  ('White Forest Bento',  'Bento Cakes',  280, '🤍', 'Mini',      'Tiny white forest delight in a mini box.'),
  ('Rasamalai Bento',     'Bento Cakes',  290, '🌸', 'Mini',      'Saffron and rose mini cake.'),
  ('Butterscotch Bento',  'Bento Cakes',  290, '🧁', 'Mini',      'Caramel butterscotch mini cake with praline bits.'),
  ('Pista Bento',         'Bento Cakes',  300, '💚', 'Mini',      'Pistachio cream mini bento.'),
  ('Rosemilk Bento',      'Bento Cakes',  300, '🌹', 'Mini',      'Fragrant rose milk flavour — a South Indian treat.'),
  ('Chocotruffle Bento',  'Bento Cakes',  320, '🍫', 'Mini',      'Rich dark chocolate truffle in a cute mini size.');
*/

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- ============================================================
-- DONE ✅
-- ============================================================
