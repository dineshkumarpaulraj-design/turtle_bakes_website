// ============================================================
// TURTLE BAKES - Product Data & App State
// ============================================================

// ---- Product Catalog ----
const PRODUCTS = [
  { id: 1, name: 'Vanilla Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 380, description: 'Classic vanilla sponge with fresh cream frosting. Light, fluffy, and timeless.', emoji: '🍰', badge: 'Classic', image: 'images/vennila.png' },
  { id: 2, name: 'Strawberry Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 390, description: 'Fresh strawberry flavour with whipped cream and berry compote.', emoji: '🍓', badge: 'Fruity', image: 'images/strawberry.png' },
  { id: 3, name: 'Black Forest Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 430, description: 'Rich chocolate sponge layered with cherries and cream.', emoji: '🍒', badge: 'Bestseller', image: 'images/blackforest.png' },
  { id: 4, name: 'White Forest Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 430, description: 'White chocolate sponge with cream and cherry delight.', emoji: '🤍', badge: 'Popular', image: 'images/whiteforest.png' },
  { id: 5, name: 'Butterscotch Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 440, description: 'Caramel butterscotch cream cake with crunchy praline topping.', emoji: '🧁', badge: 'Sweet', image: 'images/butter.png' },
  { id: 6, name: 'Pista Flavour Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 450, description: 'Pistachio-infused sponge with green cream frosting and nut crunch.', emoji: '💚', badge: 'Nutty', image: 'images/pista.png' },
  { id: 7, name: 'Rasamalai Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 480, description: 'Inspired by the classic Indian sweet — saffron cream with rose petals.', emoji: '🌸', badge: 'Special', image: 'images/rasamalai.png' },
  { id: 8, name: 'Chocotruffle Cake', category: 'Ice Cakes', categorySlug: 'ice-cakes', price: 480, description: 'Decadent dark chocolate truffle with ganache drip and chocolate shavings.', emoji: '🍫', badge: 'Indulgent', image: 'images/chocotruffle.webp' },
  { id: 9, name: 'Classic Brownie', category: 'Brownies', categorySlug: 'brownies', price: 220, description: 'Fudgy, dense, and perfectly chocolatey. The original comfort treat.', emoji: '🟫', badge: 'Classic', image: 'images/classicbrownie.jpg' },
  { id: 10, name: 'Milk Chocolate Brownie', category: 'Brownies', categorySlug: 'brownies', price: 235, description: 'Creamy milk chocolate swirled into a soft, gooey brownie base.', emoji: '🍬', badge: 'Creamy', image: 'images/milk_chocolate_brownies1.webp' },
  { id: 11, name: 'Double Chocolate Brownie', category: 'Brownies', categorySlug: 'brownies', price: 245, description: 'Double the chocolate — dark cocoa batter with chocolate chips throughout.', emoji: '🍪', badge: 'Double', image: 'images/double-chocolate-brownie.jpg' },
  { id: 12, name: 'Triple Chocolate Brownie', category: 'Brownies', categorySlug: 'brownies', price: 255, description: 'Dark, milk, and white chocolate combined in one ultimate brownie.', emoji: '🎯', badge: 'Ultimate', image: 'images/triple-chocolate-brownie.webp' },
  { id: 13, name: 'Vanilla Bento', category: 'Bento Cakes', categorySlug: 'bento-cakes', price: 270, description: 'Adorable mini vanilla cake, perfect for personal celebrations.', emoji: '🍰', badge: 'Mini', image: 'images/venila-bento-cake.png' },
  { id: 14, name: 'White Forest Bento', category: 'Bento Cakes', categorySlug: 'bento-cakes', price: 280, description: 'Tiny white forest delight — all the luxury in a mini box.', emoji: '🤍', badge: 'Mini', image: 'images/White Forest Bento Cake.png' },
  { id: 15, name: 'Rasamalai Bento', category: 'Bento Cakes', categorySlug: 'bento-cakes', price: 290, description: 'Saffron and rose mini cake with Indian-inspired cream.', emoji: '🌸', badge: 'Mini', image: 'images/Rasamalai Bento Cake.png' },
  { id: 16, name: 'Butterscotch Bento', category: 'Bento Cakes', categorySlug: 'bento-cakes', price: 290, description: 'Caramel butterscotch mini cake with praline bits on top.', emoji: '🧁', badge: 'Mini', image: 'images/Butterscotch Bento Cake.png' },
  { id: 17, name: 'Pista Bento', category: 'Bento Cakes', categorySlug: 'bento-cakes', price: 300, description: 'Pistachio cream mini bento with crushed nut garnish.', emoji: '💚', badge: 'Mini', image: 'images/Pista Bento Cake.png' },
  { id: 18, name: 'Rosemilk Bento', category: 'Bento Cakes', categorySlug: 'bento-cakes', price: 300, description: 'Fragrant rose milk flavour — a uniquely South Indian mini treat.', emoji: '🌹', badge: 'Mini', image: 'images/Rosemilk Bento Cake.png' },
  { id: 19, name: 'Chocotruffle Bento', category: 'Bento Cakes', categorySlug: 'bento-cakes', price: 320, description: 'Rich dark chocolate truffle in a cute mini size.', emoji: '🍫', badge: 'Mini', image: 'images/Chocotruffle Bento Cake.png' },
];

// ---- Cart State (LocalStorage backed) ----
const Cart = {
  items: JSON.parse(localStorage.getItem('turtlebakes_cart') || '[]'),

  save() {
    localStorage.setItem('turtlebakes_cart', JSON.stringify(this.items));
    this.updateBadge();
  },

  add(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const existing = this.items.find(i => i.id === productId);
    if (existing) { existing.qty++; } else { this.items.push({ ...product, qty: 1 }); }
    this.save();
    showToast(`🛒 ${product.name} added to cart!`, 'success');
  },

  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
    showToast('Item removed from cart', 'info');
  },

  updateQty(productId, qty) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;
    if (qty <= 0) { this.remove(productId); return; }
    item.qty = qty;
    this.save();
  },

  total() { return this.items.reduce((sum, i) => sum + i.price * i.qty, 0); },
  count() { return this.items.reduce((sum, i) => sum + i.qty, 0); },

  clear() { this.items = []; this.save(); },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.count();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },
};

// ---- Auth State ----
const Auth = {
  async getSession() {
    if (!window.supabaseClient) return null;
    const { data } = await window.supabaseClient.auth.getSession();
    return data.session;
  },
  async getUser() {
    if (!window.supabaseClient) return null;
    const { data } = await window.supabaseClient.auth.getUser();
    return data.user;
  },
  async signOut() {
    if (!window.supabaseClient) return;
    await window.supabaseClient.auth.signOut();
    localStorage.removeItem('turtlebakes_cart');
    window.location.href = window.location.pathname.includes('/pages/')
      ? '../index.html' : 'index.html';
  },
};

// ---- Toast ----
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// ---- Utility ----
function formatPrice(amount) { return `\u20B9${amount.toLocaleString('en-IN')}`; }
function navigate(url) { window.location.href = url; }

// ---- Init badge on load ----
document.addEventListener('DOMContentLoaded', () => { Cart.updateBadge(); });

// NOTE: Auth listeners, navbar update, and login popup are in auth-guard.js
