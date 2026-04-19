// ============================================================
// HOME PAGE — Product Rendering & Filtering
// ============================================================

let activeCategory = 'all';

function renderProducts(category = 'all') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = category === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="loader"><div style="font-size:3rem">🍰</div><p>No products found.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map((product, i) => `
    <div class="product-card animate-in" style="animation-delay:${i * 0.06}s"
         onclick="navigate('pages/product-detail.html?id=${product.id}')">
      <div class="card-image">
        <img src="${product.image}" alt="${product.name}" class="product-img">
        <span class="card-badge">${product.badge}</span>
      </div>
      <div class="card-body">
        <div class="card-category">${product.category}</div>
        <div class="card-name">${product.name}</div>
        <div class="card-desc">${product.description}</div>
        <div class="card-footer">
          <div class="card-price">${formatPrice(product.price)}</div>
          <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(productId) {
  Cart.add(productId);
}

function initCategoryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderProducts(activeCategory);
    });
  });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  initCategoryFilter();
  // Navbar is updated by auth-guard.js — no duplicate call needed
});
