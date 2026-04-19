// ============================================================
// TURTLE BAKES — features.js
// NEW FEATURES: Non-destructive additions only.
// Drop this file AFTER app.js in every page's <script> block.
// ============================================================

// ============================================================
// 1. ⭐ REVIEW SYSTEM
// ============================================================
const TBReviews = {
  async load() {
    if (!window.supabaseClient) return [];
    const { data, error } = await window.supabaseClient
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) { console.error('Reviews load error:', error.message); return []; }
    return data || [];
  },

  async submit(rating, comment) {
    if (!window.supabaseClient) throw new Error('Supabase not configured');
    const user = await Auth.getUser();
    const { error } = await window.supabaseClient.from('reviews').insert([{
      user_id: user ? user.id : null,
      rating,
      comment,
      created_at: new Date().toISOString(),
    }]);
    if (error) throw error;
  },

  renderStarInput(containerId, onSelect) {
    const el = document.getElementById(containerId);
    if (!el) return;
    let selected = 0;
    el.innerHTML = [1,2,3,4,5].map(n =>
      `<span class="tb-star" data-val="${n}" title="${n} star${n>1?'s':''}">★</span>`
    ).join('');
    el.querySelectorAll('.tb-star').forEach(star => {
      star.addEventListener('mouseenter', () => {
        el.querySelectorAll('.tb-star').forEach(s =>
          s.classList.toggle('tb-star-hover', +s.dataset.val <= +star.dataset.val));
      });
      star.addEventListener('mouseleave', () => {
        el.querySelectorAll('.tb-star').forEach(s => s.classList.remove('tb-star-hover'));
        el.querySelectorAll('.tb-star').forEach(s =>
          s.classList.toggle('tb-star-active', +s.dataset.val <= selected));
      });
      star.addEventListener('click', () => {
        selected = +star.dataset.val;
        el.querySelectorAll('.tb-star').forEach(s =>
          s.classList.toggle('tb-star-active', +s.dataset.val <= selected));
        if (onSelect) onSelect(selected);
      });
    });
    return { getSelected: () => selected };
  },

  renderSection(reviews) {
    const section = document.getElementById('tb-reviews-section');
    if (!section) return;

    const avg = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    const stars = r => '★'.repeat(r) + '☆'.repeat(5 - r);
    const timeAgo = ts => {
      const diff = (Date.now() - new Date(ts)) / 1000;
      if (diff < 60) return 'just now';
      if (diff < 3600) return Math.floor(diff/60) + 'm ago';
      if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
      return Math.floor(diff/86400) + 'd ago';
    };

    section.innerHTML = `
      <div class="tb-reviews-wrap">
        <div class="section-header">
          <span class="section-tag">Customer Love</span>
          <h2>Reviews &amp; Ratings</h2>
          ${avg ? `<p class="tb-avg-rating"><span class="tb-avg-stars">${stars(Math.round(avg))}</span> ${avg} / 5 from ${reviews.length} review${reviews.length>1?'s':''}</p>` : ''}
        </div>

        <!-- Write a Review -->
        <div class="tb-review-form" id="tb-review-form">
          <h3>Leave a Review</h3>
          <div id="tb-star-input" class="tb-star-input"></div>
          <textarea id="tb-review-comment" class="form-input" rows="3"
            placeholder="Share your experience with Turtle Bakes..."></textarea>
          <button class="btn btn-primary" id="tb-submit-review">Submit Review</button>
        </div>

        <!-- Reviews List -->
        <div class="tb-reviews-list">
          ${reviews.length === 0
            ? '<p style="text-align:center;color:var(--text-light);padding:32px 0;">Be the first to leave a review! 🐢</p>'
            : reviews.map(r => `
              <div class="tb-review-card animate-in">
                <div class="tb-review-header">
                  <span class="tb-review-stars">${stars(r.rating)}</span>
                  <span class="tb-review-time">${timeAgo(r.created_at)}</span>
                </div>
                <p class="tb-review-comment">${r.comment ? r.comment.replace(/</g,'&lt;') : '<em>No comment</em>'}</p>
              </div>
            `).join('')
          }
        </div>
      </div>
    `;

    // Init star input
    let selectedRating = 0;
    TBReviews.renderStarInput('tb-star-input', val => { selectedRating = val; });

    document.getElementById('tb-submit-review')?.addEventListener('click', async () => {
      if (!selectedRating) { showToast('⭐ Please select a rating first', 'error'); return; }
      const comment = document.getElementById('tb-review-comment')?.value.trim() || '';
      const btn = document.getElementById('tb-submit-review');
      btn.disabled = true; btn.textContent = '⏳ Submitting...';
      try {
        await TBReviews.submit(selectedRating, comment);
        showToast('✅ Thank you for your review!', 'success');
        const fresh = await TBReviews.load();
        TBReviews.renderSection(fresh);
      } catch(e) {
        showToast('❌ ' + e.message, 'error');
        btn.disabled = false; btn.textContent = 'Submit Review';
      }
    });
  },

  async init() {
    const reviews = await this.load();
    this.renderSection(reviews);
  }
};

// ============================================================
// 2. 🔐 SMART LOGIN POPUP (FIXED VERSION)
// ============================================================
const TBLoginPopup = {
  STORAGE_KEY: 'tb_login_choice',

  // 🔥 SHOW POPUP (FIXED)
  async show() {
    try {
      // 🔥 Check login status
      if (window.supabaseClient) {
        const { data } = await window.supabaseClient.auth.getSession();
        const user = data?.session?.user;

        // ❌ Already logged in → don't show popup
        if (user) return;
      }

      // ❌ Already chosen (guest/login) → don't show
      if (localStorage.getItem(this.STORAGE_KEY)) return;

      // ❌ Don't show on auth page
      if (window.location.pathname.includes('auth')) return;

      const overlay = document.createElement('div');
      overlay.id = 'tb-login-modal';
      overlay.className = 'tb-modal-overlay';

      overlay.innerHTML = `
        <div class="tb-modal animate-in" role="dialog" aria-modal="true">
          <div class="tb-modal-icon">🐢</div>
          <h2 class="tb-modal-title">Welcome to Turtle Bakes!</h2>
          <p class="tb-modal-sub">
            Login for faster checkout & order tracking, or continue as guest.
          </p>

          <div class="tb-modal-btns">
            <a href="${this._authPath()}" class="btn btn-primary"
               onclick="TBLoginPopup.choose('login')">
               Login / Register
            </a>

            <button class="btn btn-outline"
               onclick="TBLoginPopup.choose('guest')">
               Continue as Guest
            </button>
          </div>

          <button class="tb-modal-close"
            onclick="TBLoginPopup.choose('guest')">✕</button>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        overlay.classList.add('tb-modal-visible');
      }, 60);

    } catch (err) {
      console.error('Popup error:', err);
    }
  },

  // 🔥 USER CHOICE
  choose(choice) {
    localStorage.setItem(this.STORAGE_KEY, choice);

    const modal = document.getElementById('tb-login-modal');
    if (modal) {
      modal.classList.remove('tb-modal-visible');
      setTimeout(() => modal.remove(), 300);
    }

    document.body.style.overflow = '';
  },

  // 🔥 PATH FIX
  _authPath() {
    return window.location.pathname.includes('/pages/')
      ? 'auth.html'
      : 'pages/auth.html';
  },

  // 🔥 INIT
  init() {
    setTimeout(() => this.show(), 1500);
  }
};
// ============================================================
// 3. 📊 VISITOR COUNTER
// ============================================================
const TBVisitor = {
  STORAGE_KEY: 'tb_visitor_',

  getTodayKey() {
    return this.STORAGE_KEY + new Date().toISOString().slice(0, 10);
  },

  async increment() {
    const key = this.getTodayKey();
    // Try Supabase first
    if (window.supabaseClient) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await window.supabaseClient
          .from('visitors')
          .select('*')
          .eq('date', today)
          .maybeSingle();

        if (data) {
          await window.supabaseClient
            .from('visitors')
            .update({ count: data.count + 1 })
            .eq('id', data.id);
          return data.count + 1;
        } else {
          await window.supabaseClient
            .from('visitors')
            .insert([{ date: today, count: 1 }]);
          return 1;
        }
      } catch (e) {
        // Fallback to localStorage
      }
    }
    // localStorage fallback
    const current = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, current);
    return current;
  },

  async getCount() {
    const key = this.getTodayKey();
    if (window.supabaseClient) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await window.supabaseClient
          .from('visitors')
          .select('count')
          .eq('date', today)
          .maybeSingle();
        return data ? data.count : 0;
      } catch(e) {}
    }
    return parseInt(localStorage.getItem(key) || '0', 10);
  },

  render(count) {
    const el = document.getElementById('tb-visitor-count');
    if (el) el.textContent = `👀 ${count.toLocaleString('en-IN')} people visited today`;
  },

  async init() {
    // Only count once per session
    const sessionKey = 'tb_counted_' + new Date().toISOString().slice(0, 10);
    let count;
    if (!sessionStorage.getItem(sessionKey)) {
      count = await this.increment();
      sessionStorage.setItem(sessionKey, '1');
    } else {
      count = await this.getCount();
    }
    this.render(count);
  }
};

// ============================================================
// 4. 📱 WHATSAPP FLOATING BUTTON
// ============================================================
const TBWhatsApp = {
  PHONE: '919876543210', // ⚠️ Replace with actual WhatsApp number (with country code)
  MESSAGE: 'Hi! I want to order from Turtle Bakes 🎂🐢',

  init() {
    if (document.getElementById('tb-whatsapp-btn')) return;
    const btn = document.createElement('a');
    btn.id = 'tb-whatsapp-btn';
    btn.className = 'tb-whatsapp-float';
    btn.href = `https://wa.me/${this.PHONE}?text=${encodeURIComponent(this.MESSAGE)}`;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.setAttribute('aria-label', 'Chat on WhatsApp');
    btn.innerHTML = `
      <svg viewBox="0 0 32 32" fill="currentColor" width="28" height="28">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 2.82.74 5.46 2.04 7.77L0 32l8.44-2.04A15.93 15.93 0 0016 32c8.84 0 16-7.16 16-16S24.84 0 16 0zm7.84 22.52c-.32.9-1.88 1.72-2.6 1.8-.7.08-1.36.34-4.58-.96-3.87-1.56-6.34-5.5-6.54-5.76-.2-.26-1.64-2.18-1.64-4.16s1.04-2.96 1.42-3.36c.38-.4.82-.5 1.1-.5.28 0 .56 0 .8.01.26.01.6-.1.94.72.36.84 1.22 2.98 1.33 3.2.11.22.18.48.04.76-.14.28-.22.46-.44.7-.22.24-.46.54-.66.72-.22.2-.44.42-.2.82.24.4 1.08 1.78 2.32 2.88 1.6 1.42 2.94 1.86 3.34 2.08.4.22.64.18.88-.1.24-.28 1.02-1.18 1.3-1.58.28-.4.56-.34.94-.2.38.14 2.42 1.14 2.84 1.34.42.2.7.3.8.48.1.18.1 1.04-.22 1.94z"/>
      </svg>
      <span class="tb-whatsapp-label">Order on WhatsApp</span>
    `;
    document.body.appendChild(btn);
  }
};

// ============================================================
// 6 & 7. 🧾 USER DASHBOARD + ORDER STATUS
// ============================================================
const TBDashboard = {
  STATUS_CONFIG: {
    pending:          { label: 'Pending',          color: '#92400e', bg: '#fef3c7', icon: '⏳' },
    confirmed:        { label: 'Confirmed',        color: '#1e40af', bg: '#dbeafe', icon: '✅' },
    preparing:        { label: 'Preparing',        color: '#6d28d9', bg: '#ede9fe', icon: '👩‍🍳' },
    out_for_delivery: { label: 'Out for Delivery', color: '#065f46', bg: '#d1fae5', icon: '🚚' },
    delivered:        { label: 'Delivered',        color: '#14532d', bg: '#bbf7d0', icon: '🎉' },
    cancelled:        { label: 'Cancelled',        color: '#7f1d1d', bg: '#fee2e2', icon: '✕'  },
  },

  async fetchOrders(userId) {
    if (!window.supabaseClient) return [];
    const { data, error } = await window.supabaseClient
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) { console.error('Orders fetch error:', error.message); return []; }
    return data || [];
  },

  renderOrders(orders, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (orders.length === 0) {
      el.innerHTML = `<p class="tb-dashboard-empty">No orders yet. <a href="${
        window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html'
      }" class="tb-link">Browse Menu →</a></p>`;
      return;
    }

    el.innerHTML = orders.map(order => {
      const status = this.STATUS_CONFIG[order.status] || this.STATUS_CONFIG.pending;
      let items = [];
      try { items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; } catch(e) {}

      return `
        <div class="tb-order-card animate-in">
          <div class="tb-order-header">
            <div>
              <div class="tb-order-id">Order #${order.id.slice(0,8).toUpperCase()}</div>
              <div class="tb-order-date">${new Date(order.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</div>
            </div>
            <span class="tb-status-badge" style="color:${status.color};background:${status.bg}">
              ${status.icon} ${status.label}
            </span>
          </div>
          <div class="tb-order-items">
            ${items.map(i => `<span class="tb-order-item-chip">${i.emoji || '🎂'} ${i.name} ×${i.qty}</span>`).join('')}
          </div>
          <div class="tb-order-footer">
            <span class="tb-order-total">Total: <strong>₹${(order.total || 0).toLocaleString('en-IN')}</strong></span>
            ${order.delivery_slot ? `<span class="tb-order-slot">🕒 ${order.delivery_slot}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  async init(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = '<div class="loader"><div class="spinner"></div><p>Loading orders...</p></div>';

    const user = await Auth.getUser();
    if (!user) {
      el.innerHTML = `
        <div class="tb-dashboard-locked">
          <div style="font-size:3rem">🔐</div>
          <p>Please <a href="${window.location.pathname.includes('/pages/') ? 'auth.html' : 'pages/auth.html'}" class="tb-link">login</a> to view your order history.</p>
        </div>
      `;
      return;
    }

    const orders = await this.fetchOrders(user.id);
    this.renderOrders(orders, containerId);
  }
};

// ============================================================
// 8. 🎁 OFFERS / DISCOUNTS
// ============================================================
const TBOffers = {
  OFFERS: [
    { id: 'first10', text: '🎉 Get 10% OFF on your first order! Use code <strong>FIRST10</strong>', color: '#78350f', bg: 'linear-gradient(135deg,#fef3c7,#fde68a)' },
    { id: 'free500', text: '🚚 Free delivery on orders above ₹500!', color: '#1e3a5f', bg: 'linear-gradient(135deg,#dbeafe,#bfdbfe)' },
    { id: 'bday',    text: '🎂 Planning a birthday? Order custom cakes — <a href="pages/custom.html" style="color:inherit;font-weight:700;text-decoration:underline">click here!</a>', color: '#4a1d96', bg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' },
  ],
  current: 0,

  render(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const offer = this.OFFERS[this.current % this.OFFERS.length];
    el.innerHTML = `
      <div class="tb-offer-banner" style="background:${offer.bg};color:${offer.color}" id="tb-offer-inner">
        <span>${offer.text}</span>
        <button class="tb-offer-close" onclick="document.getElementById('${containerId}').style.display='none'" aria-label="Close offer">✕</button>
      </div>
    `;
  },

  init(containerId) {
    this.render(containerId);
    // Rotate offers every 5s
    setInterval(() => {
      this.current++;
      this.render(containerId);
    }, 5000);
  }
};

// ============================================================
// 9. 🕒 DELIVERY TIME SLOT
// (Patches checkout form — appended after renderCheckout runs)
// ============================================================
const TBDeliverySlot = {
  inject() {
    // Wait for checkout form to render
    const tryInject = () => {
      const notesGroup = document.getElementById('notes')?.closest('.form-group');
      if (!notesGroup) return setTimeout(tryInject, 300);

      if (document.getElementById('tb-slot-group')) return; // already injected

      const slotGroup = document.createElement('div');
      slotGroup.className = 'form-group full';
      slotGroup.id = 'tb-slot-group';
      slotGroup.innerHTML = `
        <label class="form-label">🕒 Preferred Delivery Slot</label>
        <select class="form-input" id="tb-delivery-slot">
          <option value="">Select a time slot (optional)</option>
          <option value="Morning (9am–12pm)">☀️ Morning (9am – 12pm)</option>
          <option value="Afternoon (12pm–4pm)">🌤 Afternoon (12pm – 4pm)</option>
          <option value="Evening (4pm–8pm)">🌆 Evening (4pm – 8pm)</option>
        </select>
      `;
      notesGroup.after(slotGroup);
    };
    tryInject();
  },

  getSelected() {
    return document.getElementById('tb-delivery-slot')?.value || '';
  }
};

// ============================================================
// 10. 📧 FUTURE-READY NOTIFICATION HOOKS
// ============================================================
const TBNotifications = {
  /**
   * Hook: called after every order save.
   * Replace stubs with real providers (EmailJS, Twilio, etc.)
   */
  async onOrderPlaced(orderData) {
    await this._sendEmail(orderData);
    await this._sendSMS(orderData);
  },

  async _sendEmail(orderData) {
    // 📧 TODO: Integrate EmailJS / SendGrid / Resend
    // Example with EmailJS:
    // await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', { to_email: orderData.customer_email, order_id: orderData.id });
    console.log('[TBNotifications] Email hook ready for:', orderData.customer_email);
  },

  async _sendSMS(orderData) {
    // 📱 TODO: Integrate MSG91 / Twilio / Fast2SMS
    // Example: POST to your backend endpoint with orderData.customer_phone
    console.log('[TBNotifications] SMS hook ready for:', orderData.customer_phone);
  }
};

// ============================================================
// PATCH: Intercept saveOrderToSupabase to add slot + notifications
// ============================================================
(function patchCheckout() {
  // Wait until checkout.js defines the function
  const _patch = () => {
    if (typeof saveOrderToSupabase !== 'function') return setTimeout(_patch, 200);
    const _original = saveOrderToSupabase;
    window.saveOrderToSupabase = async function(totalAmount, paymentId) {
      // Attach delivery slot to order before saving
      const slotEl = document.getElementById('tb-delivery-slot');
      if (slotEl && slotEl.value) {
        // We store it by temporarily monkey-patching supabaseClient.from
        window._tb_delivery_slot = slotEl.value;
      }
      await _original(totalAmount, paymentId);
      // Notification hook
      try {
        const formData = window._tb_last_form_data;
        if (formData) await TBNotifications.onOrderPlaced(formData);
      } catch(e) {}
    };

    // Also patch getFormData to store slot
    if (typeof getFormData === 'function') {
      const _origForm = getFormData;
      window.getFormData = function() {
        const data = _origForm();
        data.deliverySlot = TBDeliverySlot.getSelected();
        window._tb_last_form_data = data;
        return data;
      };
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _patch);
  } else {
    _patch();
  }
})();

// ============================================================
// GLOBAL INIT — runs on every page
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // WhatsApp button — every page
  TBWhatsApp.init();

  // Offers banner — homepage only
  if (document.getElementById('tb-offers-bar')) {
    TBOffers.init('tb-offers-bar');
  }

  // Visitor counter — homepage only
  if (document.getElementById('tb-visitor-count')) {
    TBVisitor.init();
  }

  // Reviews section — homepage only
  if (document.getElementById('tb-reviews-section')) {
    TBReviews.init();
  }

  // Dashboard — dashboard page only
  if (document.getElementById('tb-orders-list')) {
    TBDashboard.init('tb-orders-list');
  }

  // Login popup is now handled by auth-guard.js (mandatory, no guest option)

  // Delivery slot — checkout page only
  if (document.getElementById('checkout-root')) {
    // Wait for renderCheckout to finish
    setTimeout(() => TBDeliverySlot.inject(), 600);
  }
});
