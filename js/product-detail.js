// ============================================================
// PRODUCT DETAIL PAGE — JS
// ============================================================

function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'), 10);
}

function renderDetail(product) {
  const root = document.getElementById('detail-root');
  document.title = `${product.name} — Turtle Bakes`;

  root.innerHTML = `
    <div class="detail-layout">
      <div class="product-image">
        <img src="../${product.image}" alt="${product.name}">
      </div>
      <div class="detail-info animate-in">
        <div class="detail-cat">${product.category}</div>
        <h1 class="detail-name">${product.name}</h1>
        <div class="detail-price">${formatPrice(product.price)}</div>
        <p class="detail-desc">${product.description}</p>
        <div style="background:var(--cream-dark);border-radius:var(--radius-sm);padding:14px 18px;margin-bottom:24px;font-size:0.88rem;color:var(--text-mid);">
          🎂 All cakes are <strong>½ kg</strong> (serves 6–8 people) · Bento cakes serve 1–2 · Brownies per piece
        </div>
        <div class="detail-actions">
          <button class="btn btn-primary" onclick="addAndGoCart(${product.id})">🛒 Add to Cart & Checkout</button>
          <button class="btn btn-outline" onclick="Cart.add(${product.id})">+ Add to Cart</button>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div class="products-section" style="padding-top:0;">
      <div class="section-header" style="margin-top:0;">
        <span class="section-tag">From ${product.category}</span>
        <h2>You Might Also Like</h2>
      </div>
      <div class="product-grid" id="related-grid"></div>
    </div>
  `;

  // Related products
  const related = PRODUCTS
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    relatedGrid.innerHTML = related.map(p => `
      <div class="product-card" onclick="navigate('product-detail.html?id=${p.id}')">
        <div class="card-image">
          <img src="../${p.image}" alt="${p.name}">
          <span class="card-badge">${p.badge}</span>
        </div>
        <div class="card-body">
          <div class="card-category">${p.category}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-desc">${p.description}</div>
          <div class="card-footer">
            <div class="card-price">${formatPrice(p.price)}</div>
            <button class="btn-add-cart" onclick="event.stopPropagation(); Cart.add(${p.id})">🛒 Add</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function addAndGoCart(productId) {
  Cart.add(productId);
  setTimeout(() => navigate('cart.html'), 500);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  const id = getProductIdFromURL();
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    document.getElementById('detail-root').innerHTML = `
      <div class="empty-cart" style="min-height:60vh;">
        <div class="empty-cart-icon">😕</div>
        <h3>Product Not Found</h3>
        <p>That product doesn't exist or has been removed.</p>
        <a href="../index.html" class="btn btn-primary">Go Back Home</a>
      </div>
    `;
    return;
  }

  renderDetail(product);
});
