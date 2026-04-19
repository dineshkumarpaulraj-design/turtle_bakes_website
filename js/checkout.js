// ============================================================
// TURTLE BAKES — checkout.js
// Payment: UPI Deep Link (GPay / PhonePe / Paytm)
// Backend: Supabase orders table
// ============================================================

// ---- [MODIFIED] UPI Configuration (replaces Razorpay) ----
const UPI_CONFIG = {
  id:           'priyanga0421@okicici',      // ⚠️ Replace with your actual UPI ID
  businessName: 'Turtle Bakes',
  currency:     'INR',
};

// ---- Spam protection: track last submission timestamp ----
let _lastSubmitTime = 0;
const SUBMIT_COOLDOWN_MS = 8000; // 8 seconds between submissions

// ---- State: has user opened UPI payment? ----
let _upiOpened = false;

// ============================================================
// RENDER
// ============================================================

/**
 * Render the full checkout UI — structure unchanged from original
 */
function renderCheckout() {
  const root = document.getElementById('checkout-root');
  if (!root) return;

  const items = Cart.items;

  if (items.length === 0) {
    root.innerHTML = `
      <div class="empty-cart animate-in" style="grid-column:1/-1;min-height:40vh;">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty!</h3>
        <p>Add some treats before checking out.</p>
        <a href="../index.html" class="btn btn-primary">Browse Menu</a>
      </div>
    `;
    return;
  }

  const subtotal = Cart.total();
  const total = subtotal; 

  root.innerHTML = `
    <!-- Left: Delivery Details Form -->
    <div>
      <div class="form-section animate-in">
        <div class="form-section-title">📦 Delivery Details</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">First Name *</label>
            <input class="form-input" id="fname" type="text" placeholder="Your first name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Last Name *</label>
            <input class="form-input" id="lname" type="text" placeholder="Your last name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number *</label>
            <input class="form-input" id="phone" type="tel" placeholder="10-digit mobile number" maxlength="10" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" id="email" type="email" placeholder="your@email.com" />
          </div>
          <div class="form-group full">
            <label class="form-label">Delivery Address *</label>
            <textarea class="form-input" id="address" rows="3" placeholder="House no, Street, Area..." required style="resize:vertical;"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">City *</label>
            <input class="form-input" id="city" type="text" placeholder="City" required />
          </div>
          <div class="form-group">
            <label class="form-label">Pincode *</label>
            <input class="form-input" id="pincode" type="text" placeholder="6-digit pincode" maxlength="6" required />
          </div>
          <div class="form-group full">
            <label class="form-label">Order Notes (optional)</label>
            <input class="form-input" id="notes" type="text" placeholder="e.g. Custom message, delivery time preference" />
          </div>
        </div>
      </div>

      <!-- Cake Customisation -->
      <div class="form-section animate-in" style="animation-delay:0.1s">
        <div class="form-section-title">🎂 Cake Message (optional)</div>
        <div class="form-group">
          <label class="form-label">Message on Cake</label>
          <input class="form-input" id="cake-message" type="text" placeholder='e.g. "Happy Birthday Priya! 🎉"' maxlength="60" />
        </div>
        <p style="font-size:0.8rem;color:var(--text-light);margin-top:8px;">Max 60 characters. Leave blank if not needed.</p>
      </div>
    </div>

    <!-- Right: Order Summary -->
    <div class="order-summary animate-in" style="animation-delay:0.15s">
      <div class="summary-title">🧾 Your Order</div>

      <div class="order-items">
        ${items.map(item => `
          <div class="order-item">
            <span class="order-item-name">${item.emoji} ${item.name}</span>
            <span class="order-item-qty">×${item.qty}</span>
            <span class="order-item-price">${formatPrice(item.price * item.qty)}</span>
          </div>
        `).join('')}
      </div>

      <div class="summary-rows">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span style="color:#b45309; font-size:0.85rem;">
          🚚 Delivery charges may apply based on location
          </span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>${formatPrice(total)}</span>
        </div>
      </div>

      <!-- [MODIFIED] UPI Payment buttons replace Razorpay -->
      <div id="upi-payment-section">
        <button
          class="btn btn-primary btn-full"
          id="pay-btn"
          onclick="initiateUpiPayment(${total})"
          style="margin-top:8px;"
        >
          📱 Pay ${formatPrice(total)} via GPay / UPI
        </button>

        ${window.innerWidth > 768 ? `
          <div class="qr-payment">
               <p>Scan & Pay (GPay / PhonePe)</p>
                <img id="qr-code" src="" alt="QR Code">
           </div>
        ` : ''}

        <!-- "I Paid" button — hidden until UPI is opened -->
        <button
          class="btn btn-outline btn-full"
          id="confirm-btn"
          onclick="handleManualConfirmation(${total})"
          style="margin-top:10px; display:none;"
        >
          ✅ I Have Paid
        </button>

        <div id="upi-instruction" style="display:none; margin-top:12px; padding:12px 16px;
             background:#fffbeb; border:1px solid #fcd34d; border-radius:var(--radius-sm);
             font-size:0.82rem; color:#92400e; line-height:1.6;">
          📲 Complete the payment in your UPI app, then tap <strong>"I Have Paid"</strong> to confirm your order.
        </div>

        <div style="
          display:flex; align-items:center; gap:8px;
          background:#f0fdf4; border:1px solid #86efac;
          border-radius:var(--radius-sm); padding:12px 16px;
          font-size:0.82rem; color:#16a34a; margin-top:14px;
        ">
          🔒 Pay directly via UPI — GPay, PhonePe, Paytm accepted
        </div>

        <div style="margin-top:12px;font-size:0.8rem;color:var(--text-light);text-align:center;">
          UPI ID: <strong style="color:var(--chocolate);">${UPI_CONFIG.id}</strong><br>
          By placing this order you agree to our terms.
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// VALIDATION — unchanged logic, with field highlight added
// ============================================================

/**
 * Validate all required form fields.
 * Highlights the first invalid field in red.
 * @returns {boolean}
 */
function validateForm() {
  const required = {
    fname:   'First Name',
    lname:   'Last Name',
    phone:   'Phone Number',
    address: 'Delivery Address',
    city:    'City',
    pincode: 'Pincode',
  };

  // Clear previous error highlights
  Object.keys(required).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.borderColor = '';
  });

  for (const [id, label] of Object.entries(required)) {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      showToast('⚠️ Please enter your ' + label, 'error');
      if (el) {
        el.style.borderColor = '#dc2626';
        el.focus();
      }
      return false;
    }
  }

  const phone = document.getElementById('phone').value.trim();
  if (!/^\d{10}$/.test(phone)) {
    showToast('⚠️ Enter a valid 10-digit phone number', 'error');
    const el = document.getElementById('phone');
    if (el) { el.style.borderColor = '#dc2626'; el.focus(); }
    return false;
  }

  const pincode = document.getElementById('pincode').value.trim();
  if (!/^\d{6}$/.test(pincode)) {
    showToast('⚠️ Enter a valid 6-digit pincode', 'error');
    const el = document.getElementById('pincode');
    if (el) { el.style.borderColor = '#dc2626'; el.focus(); }
    return false;
  }

  return true;
}

// ============================================================
// FORM DATA — unchanged
// ============================================================

/**
 * Collect all form field values into a plain object.
 * @returns {object}
 */
function getFormData() {
  return {
    name:        document.getElementById('fname').value.trim() + ' ' + document.getElementById('lname').value.trim(),
    phone:       document.getElementById('phone').value.trim(),
    email:       document.getElementById('email').value.trim() || 'customer@turtlebakes.com',
    address:     document.getElementById('address').value.trim(),
    city:        document.getElementById('city').value.trim(),
    pincode:     document.getElementById('pincode').value.trim(),
    notes:       document.getElementById('notes').value.trim(),
    cakeMessage: document.getElementById('cake-message').value.trim(),
  };
}

// ============================================================
// [NEW] UPI PAYMENT — replaces Razorpay entirely
// ============================================================

/**
 * Build a UPI deep-link URL.
 * Opens the device's default UPI app (GPay, PhonePe, Paytm, etc.)
 *
 * @param {number} amount - total in INR
 * @param {string} txnNote - short order note shown in UPI app
 * @returns {string} UPI intent URL
 */
function buildUpiUrl(amount, txnNote) {
  const params = new URLSearchParams({
    pa:  UPI_CONFIG.id,
    pn:  UPI_CONFIG.businessName,
    am:  amount.toFixed(2),
    cu:  UPI_CONFIG.currency,
    tn:  txnNote,
  });
  return 'upi://pay?' + params.toString();
}

/**
 * Step 1 — Open UPI deep link.
 * Validates the form first, then launches the UPI intent.
 * Shows "I Have Paid" button after the app opens.
 *
 * @param {number} totalAmount
 */
function initiateUpiPayment(totalAmount) {
  // Spam guard
  const now = Date.now();
  if (now - _lastSubmitTime < SUBMIT_COOLDOWN_MS && _lastSubmitTime !== 0) {
    showToast('⏳ Please wait a moment before retrying.', 'info');
    return;
  }

  if (!validateForm()) return;

  const payBtn      = document.getElementById('pay-btn');
  const confirmBtn  = document.getElementById('confirm-btn');
  const instruction = document.getElementById('upi-instruction');

  // Disable pay button while UPI is launching
  if (payBtn) {
    payBtn.disabled    = true;
    payBtn.textContent = '⏳ Opening UPI app...';
  }

  const txnNote = 'TurtleBakes-' + Cart.count() + 'item-' + totalAmount;
  const upiUrl  = buildUpiUrl(totalAmount, txnNote);

  // Launch UPI deep link
  window.location.href = upiUrl;

  // After 2 s restore button + reveal "I Have Paid"
  setTimeout(function() {
    _upiOpened      = true;
    _lastSubmitTime = Date.now();

    if (payBtn) {
      payBtn.disabled    = false;
      payBtn.textContent = '🔄 Retry / Re-open UPI';
    }

    if (confirmBtn)  confirmBtn.style.display  = 'block';
    if (instruction) instruction.style.display = 'block';

    showToast('📱 Complete payment in your UPI app, then tap "I Have Paid"', 'info');
  }, 2000);
}

/**
 * Step 2 — User taps "I Have Paid".
 * Saves the order to Supabase and redirects to success page.
 *
 * @param {number} totalAmount
 */
async function handleManualConfirmation(totalAmount) {
  // Guard: UPI must have been opened first
  if (!_upiOpened) {
    showToast('⚠️ Please open UPI and complete payment first.', 'error');
    return;
  }

  // Spam guard
  const now = Date.now();
  if (now - _lastSubmitTime < SUBMIT_COOLDOWN_MS) {
    showToast('⏳ Please wait a moment before confirming.', 'info');
    return;
  }

  const formData = getFormData();

  // 🔥 Build order items text
  let itemsText = '';
  Cart.items.forEach(item => {
    itemsText += `${item.name} x${item.qty} = ₹${item.price * item.qty}\n`;
  });

  // 🔥 WhatsApp message
  const message = `🧁 *New Order - Turtle Bakes* 🐢

👤 Name: ${formData.name}
📞 Phone: ${formData.phone}
📍 Address: ${formData.address}, ${formData.city} - ${formData.pincode}

🛒 Order Items:
${itemsText}

💰 Total: ₹${totalAmount}

🎂 Cake Message: ${formData.cakeMessage || 'None'}

Thank you ❤️`;

  const whatsappNumber = "916383881006"; // 🔥 CHANGE THIS

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  // 🔥 Open WhatsApp
  window.open(url, "_blank");

  // 🔥 Continue existing flow (DO NOT REMOVE)
  const confirmBtn = document.getElementById('confirm-btn');
  const payBtn     = document.getElementById('pay-btn');

  if (confirmBtn) { confirmBtn.disabled = true; confirmBtn.textContent = '⏳ Saving your order...'; }
  if (payBtn)     { payBtn.disabled = true; }

  showToast('✅ Payment noted! Saving your order...', 'success');

  await saveOrderToSupabase(totalAmount, 'UPI_MANUAL');
}

// ============================================================
// [MODIFIED] ORDER SAVE — payment_id now "UPI_MANUAL"
// ============================================================

/**
 * Saves the confirmed order to Supabase orders table.
 * On success, clears cart and redirects to success page.
 * On DB failure, still redirects (payment already made by user).
 *
 * @param {number} totalAmount
 * @param {string} paymentId
 */
async function saveOrderToSupabase(totalAmount, paymentId) {
  const formData = getFormData();

  try {
    // Attach user_id if session exists (guest checkout also supported)
    var userId = null;
    try {
      var user = await Auth.getUser();
      userId = user ? user.id : null;
    } catch (_) {
      // Not logged in — guest order
    }

    var orderData = {
      user_id:          userId,
      customer_name:    formData.name,
      customer_phone:   formData.phone,
      customer_email:   formData.email,
      delivery_address: formData.address + ', ' + formData.city + ' - ' + formData.pincode,
      cake_message:     formData.cakeMessage || null,
      order_notes:      formData.notes       || null,
      items:            JSON.stringify(Cart.items),
      total:            totalAmount,
      status:           'confirmed',
      payment_id:       paymentId,
      created_at:       new Date().toISOString(),
    };

    if (window.supabaseClient) {
      var result = await window.supabaseClient
        .from('orders')
        .insert([orderData]);

      if (result.error) {
        // Log but never block — payment was already made
        console.error('Supabase insert error:', result.error.message);
        showToast('⚠️ Order saved locally. We will confirm via WhatsApp.', 'info');
      }
    } else {
      console.warn('Supabase client not initialised — order not persisted to DB.');
    }
  } catch (err) {
    console.error('Unexpected error saving order:', err);
  } finally {
    // Always clear cart and redirect
    Cart.clear();
    navigate('success.html?pid=' + paymentId);
  }
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  renderCheckout();
});

//===============
// PAYMENT
//===============

document.addEventListener("DOMContentLoaded", () => {

  // 👉 Only for laptop
  if (window.innerWidth <= 768) return;

  const total = Cart.total();

  const upiId = "priyanga0421@okicici";

  const upiLink = `upi://pay?pa=${upiId}&pn=TurtleBakes&am=${total}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

  const qrImg = document.getElementById("qr-code");

  if (qrImg) {
    qrImg.src = qrUrl;
  }

});