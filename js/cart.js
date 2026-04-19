// ============================================================
// CART PAGE — JS
// ============================================================

function renderCart() {
  const root = document.getElementById('cart-root');
  const countText = document.getElementById('cart-count-text');
  if (!root) return;

  const items = Cart.items;

  if (countText) {
    countText.textContent = items.length === 0
      ? 'Your cart is empty'
      : `${Cart.count()} item${Cart.count() > 1 ? 's' : ''} in your cart`;
  }

  if (items.length === 0) {
    root.innerHTML = `
      <div class="empty-cart animate-in">
        <div class="empty-cart-icon">🛒</div>
        <h3>Nothing here yet!</h3>
        <p>Add some delicious treats to get started.</p>
        <a href="../index.html" class="btn btn-primary">Browse Menu</a>
      </div>
    `;
    return;
  }

  const subtotal = Cart.total();
  const delivery = 0;
  const total = subtotal;

  root.innerHTML = `
    <div class="cart-layout">
      <!-- Items -->
      <div class="cart-items" id="cart-items-list">
        ${items.map(item => `
          <div class="cart-item animate-in" id="cart-item-${item.id}">
            <div class="cart-item-image">
              <img src="../${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
              <div class="cart-item-cat">${item.category}</div>
              <div class="cart-item-name">${item.name}</div>
              <div class="qty-control">
                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                <span class="qty-value" id="qty-${item.id}">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
              </div>
            </div>
            <div class="cart-item-right">
              <div class="cart-item-price" id="price-${item.id}">${formatPrice(item.price * item.qty)}</div>
              <button class="btn-remove" onclick="removeItem(${item.id})">🗑 Remove</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Summary -->
      <div class="cart-summary">
        <div class="summary-title">Order Summary</div>
        <div class="summary-rows">
          <div class="summary-row">
            <span>Subtotal</span>
            <span id="summary-subtotal">${formatPrice(subtotal)}</span>
          </div>
          <div class="summary-row">
            
<span id="summary-delivery">Delivery charges may apply based on location</span>
          </div>
          
          <div class="summary-row total">
            <span>Total</span>
            <span id="summary-total">${formatPrice(total)}</span>
          </div>
        </div>
        <a href="checkout.html" class="btn btn-primary btn-full" style="margin-bottom:12px;">
          Proceed to Checkout →
        </a>
        <a href="../index.html" class="btn btn-outline btn-full">
          Continue Shopping
        </a>
        <button onclick="clearCart()" style="display:block;width:100%;margin-top:12px;background:none;border:none;color:var(--text-light);font-size:0.82rem;cursor:pointer;text-decoration:underline;">
          Clear Cart
        </button>
      </div>
    </div>
  `;
}

function changeQty(productId, delta) {
  const item = Cart.items.find(i => i.id === productId);
  if (!item) return;
  const newQty = item.qty + delta;
  Cart.updateQty(productId, newQty);
  renderCart(); // re-render
}

function removeItem(productId) {
  Cart.remove(productId);
  renderCart();
}

function clearCart() {
  if (confirm('Remove all items from cart?')) {
    Cart.clear();
    renderCart();
    showToast('Cart cleared', 'info');
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
