/* =============================================
   TURTLE BAKES — JavaScript
   Interactions, Sliders, Animations
   ============================================= */

'use strict';

/* ─── DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroSlider();
  initFeaturedSlider();
  initMenuTabs();
  initScrollReveal();
  initCounters();
  initBackToTop();
  initSmoothScroll();
  initTouchSwipe();
});

/* =============================================
   NAVBAR
   — Sticky glass effect on scroll
   — Hamburger toggle
   ============================================= */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const navLinkItems = navLinks.querySelectorAll('.nav-link');

  // Sticky / glass effect
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    if (isOpen) {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    }
  });

  // Close menu on link click (mobile)
  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    }
  });

  // Highlight active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const highlightNavLink = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = navLinks.querySelector(`a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          navLinkItems.forEach(l => l.classList.remove('active-link'));
          link.classList.add('active-link');
        }
      }
    });
  };
  window.addEventListener('scroll', highlightNavLink, { passive: true });
}

/* =============================================
   HERO SLIDER
   — Auto-advance every 5s
   — Manual arrows + dots
   — Keyboard navigation
   ============================================= */
function initHeroSlider() {
  const slides     = document.querySelectorAll('.hero-slide');
  const prevBtn    = document.getElementById('heroPrev');
  const nextBtn    = document.getElementById('heroNext');
  const dotsWrap   = document.getElementById('heroDotsContainer');
  let   current    = 0;
  let   timer      = null;
  const INTERVAL   = 5500;

  if (!slides.length) return;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = () => dotsWrap.querySelectorAll('.slider-dot');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots()[current].classList.remove('active');

    current = (index + slides.length) % slides.length;

    slides[current].classList.add('active');
    dots()[current].classList.add('active');

    // Reset slide content animations
    const content = slides[current].querySelectorAll('.fade-up');
    content.forEach(el => {
      el.style.animation = 'none';
      void el.offsetWidth; // reflow trick
      el.style.animation = '';
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }

  nextBtn.addEventListener('click', () => { next(); startTimer(); });
  prevBtn.addEventListener('click', () => { prev(); startTimer(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); startTimer(); }
    if (e.key === 'ArrowLeft')  { prev(); startTimer(); }
  });

  // Pause on hover
  const hero = document.querySelector('.hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', startTimer);

  startTimer();
}

/* =============================================
   FEATURED SLIDER (horizontal drag scroll)
   — Arrow buttons
   — Mouse drag / touch swipe
   ============================================= */
function initFeaturedSlider() {
  const track     = document.getElementById('featuredTrack');
  const container = track?.parentElement;
  const prevBtn   = document.getElementById('featPrev');
  const nextBtn   = document.getElementById('featNext');

  if (!track) return;

  const CARD_WIDTH = () => {
    const card = track.querySelector('.feat-card');
    if (!card) return 300;
    const gap = 24; // 1.5rem
    return card.offsetWidth + gap;
  };

  let currentOffset = 0;
  const maxOffset = () => track.scrollWidth - container.offsetWidth;

  function moveTo(offset) {
    currentOffset = Math.max(0, Math.min(offset, maxOffset()));
    track.style.transform = `translateX(-${currentOffset}px)`;
  }

  nextBtn?.addEventListener('click', () => moveTo(currentOffset + CARD_WIDTH() * 2));
  prevBtn?.addEventListener('click', () => moveTo(currentOffset - CARD_WIDTH() * 2));

  // Mouse drag
  let isDragging = false;
  let startX = 0;
  let startOffset = 0;

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startOffset = currentOffset;
    track.style.transition = 'none';
    container.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const delta = startX - e.clientX;
    moveTo(startOffset + delta);
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
    container.style.cursor = 'grab';
  });

  // Touch swipe
  let touchStartX = 0;
  let touchStartOffset = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartOffset = currentOffset;
    track.style.transition = 'none';
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    const delta = touchStartX - e.touches[0].clientX;
    moveTo(touchStartOffset + delta);
  }, { passive: true });

  container.addEventListener('touchend', () => {
    track.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
  });
}

/* =============================================
   MENU TABS
   — Switch between Ice Cakes, Brownies, Bento
   ============================================= */
function initMenuTabs() {
  const tabs    = document.querySelectorAll('.tab-btn');
  const grids   = document.querySelectorAll('.menu-grid');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show corresponding grid
      const cat = tab.dataset.cat;
      grids.forEach(grid => {
        if (grid.id === cat) {
          grid.classList.remove('hidden');
          // Re-trigger reveal animations for newly visible cards
          grid.querySelectorAll('.reveal').forEach((el, i) => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), i * 80);
          });
        } else {
          grid.classList.add('hidden');
        }
      });
    });
  });
}

/* =============================================
   SCROLL REVEAL (Intersection Observer)
   ============================================= */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after animation for performance
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

/* =============================================
   COUNTER ANIMATION
   ============================================= */
function initCounters() {
  const counters = document.querySelectorAll('.stat-num');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = easeOut(step / steps);
      current = Math.round(target * progress);
      el.textContent = current + (el.dataset.suffix || '');

      if (step >= steps) {
        clearInterval(timer);
        el.textContent = target + (el.dataset.suffix || '');
      }
    }, stepTime);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* =============================================
   BACK TO TOP BUTTON
   ============================================= */
function initBackToTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navHeight = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* =============================================
   HERO TOUCH SWIPE SUPPORT
   ============================================= */
function initTouchSwipe() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let touchStartX = 0;
  let touchEndX = 0;

  hero.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  hero.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      const prevBtn = document.getElementById('heroPrev');
      const nextBtn = document.getElementById('heroNext');
      if (diff > 0) {
        nextBtn.click();
      } else {
        prevBtn.click();
      }
    }
  }, { passive: true });
}

/* =============================================
   BUTTON RIPPLE EFFECT
   ============================================= */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-primary, .btn-whatsapp, .btn-whatsapp-large, .nav-cta');
  if (!btn) return;

  // Remove old ripples
  btn.querySelectorAll('.ripple').forEach(r => r.remove());

  const ripple = document.createElement('span');
  ripple.className = 'ripple';

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  Object.assign(ripple.style, {
    position: 'absolute',
    width:  `${size}px`,
    height: `${size}px`,
    left:   `${x}px`,
    top:    `${y}px`,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    transform: 'scale(0)',
    animation: 'rippleAnim 0.6s ease-out forwards',
    pointerEvents: 'none'
  });

  // Ensure button has relative positioning for ripple
  if (getComputedStyle(btn).position === 'static') {
    btn.style.position = 'relative';
  }
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);

  setTimeout(() => ripple.remove(), 700);
});

// Inject ripple keyframes dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(rippleStyle);

/* =============================================
   LAZY IMAGE LOAD — Add fade-in
   ============================================= */
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.6s ease';

  if (img.complete) {
    img.style.opacity = '1';
  } else {
    img.addEventListener('load', () => { img.style.opacity = '1'; });
    img.addEventListener('error', () => { img.style.opacity = '0.3'; });
  }
});

/* =============================================
   MARQUEE — Pause on hover
   ============================================= */
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    marqueeTrack.style.animationPlayState = 'paused';
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    marqueeTrack.style.animationPlayState = 'running';
  });
}

/* =============================================
   NAV DROPDOWN — Dropdown link tab switching
   ============================================= */
document.querySelectorAll('.dropdown-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const cat = link.dataset.cat;
    if (!cat) return;
    // Switch menu tab to corresponding category
    setTimeout(() => {
      const tab = document.querySelector(`.tab-btn[data-cat="${cat}"]`);
      if (tab) tab.click();
    }, 400);
  });
});

// Desktop menu opens on click as well as hover. Mobile keeps Menu as a simple link.
document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) return;

    e.preventDefault();
    const item = trigger.closest('.nav-dropdown-item');
    const wasOpen = item.classList.contains('open');

    document.querySelectorAll('.nav-dropdown-item.open').forEach(openItem => {
      openItem.classList.remove('open');
    });

    if (!wasOpen) item.classList.add('open');
  });
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) return;
  if (e.target.closest('.nav-dropdown-item')) return;

  document.querySelectorAll('.nav-dropdown-item.open').forEach(item => {
    item.classList.remove('open');
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  document.querySelectorAll('.nav-dropdown-item.open').forEach(item => {
    item.classList.remove('open');
  });
});

/* =============================================
   ORDER FORM MODAL
   ============================================= */
function openOrderForm() {
  document.getElementById('orderModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrderFormBtn() {
  document.getElementById('orderModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeOrderForm(e) {
  if (e.target === document.getElementById('orderModal')) {
    closeOrderFormBtn();
  }
}

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeOrderFormBtn();
});

function submitOrderToWhatsApp() {
  const name  = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const cake  = document.getElementById('orderCake').value;
  const date  = document.getElementById('orderDate').value;
  const note  = document.getElementById('orderNote').value.trim();

  if (!name || !phone || !cake) {
    alert('Please fill in Name, Phone, and select a Cake!');
    return;
  }

  let msg = `Hi Turtle Bakes! 🎂%0A%0A*Order Request*%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0ACake: ${encodeURIComponent(cake)}`;
  if (date) msg += `%0ADelivery Date: ${encodeURIComponent(date)}`;
  if (note) msg += `%0ANote: ${encodeURIComponent(note)}`;

  window.open(`https://wa.me/916383881006?text=${msg}`, '_blank');
  closeOrderFormBtn();
}

/* =============================================
   STAR RATING PICKER
   ============================================= */
let selectedRating = 0;
document.querySelectorAll('.star-opt').forEach(star => {
  star.addEventListener('mouseenter', () => {
    const val = +star.dataset.val;
    document.querySelectorAll('.star-opt').forEach(s => {
      s.classList.toggle('selected', +s.dataset.val <= val);
    });
  });
  star.addEventListener('mouseleave', () => {
    document.querySelectorAll('.star-opt').forEach(s => {
      s.classList.toggle('selected', +s.dataset.val <= selectedRating);
    });
  });
  star.addEventListener('click', () => {
    selectedRating = +star.dataset.val;
    document.getElementById('reviewRating').value = selectedRating;
    document.querySelectorAll('.star-opt').forEach(s => {
      s.classList.toggle('selected', +s.dataset.val <= selectedRating);
    });
  });
});

/* =============================================
   SUBMIT USER REVIEW
   ============================================= */
const REVIEW_STORAGE_KEY = 'turtleBakesReviews';

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function createReviewCard(review) {
  const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
  const name = String(review.name || 'Customer').trim();
  const city = String(review.city || 'Tamil Nadu').trim();
  const text = String(review.text || '').trim();
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const card = document.createElement('div');
  card.className = 'testi-card user-review reveal visible';
  card.innerHTML = `
    <div class="testi-stars">${stars}</div>
    <p>"${escapeHtml(text)}"</p>
    <div class="testi-author">
      <div class="testi-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</div>
      <div>
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(city || 'Tamil Nadu')}</span>
      </div>
    </div>
  `;

  return card;
}

function getStoredReviews() {
  try {
    const reviews = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY)) || [];
    return Array.isArray(reviews) ? reviews.filter(review => review && review.text) : [];
  } catch {
    return [];
  }
}

function saveReview(review) {
  const reviews = getStoredReviews();
  reviews.push(review);
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
  return reviews;
}

function updateSavedReviewCount(reviews = getStoredReviews()) {
  const countEl = document.getElementById('reviewSavedCount');
  if (!countEl) return;

  const count = reviews.length;
  countEl.textContent = count === 0
    ? 'No saved local reviews yet.'
    : `${count} saved local review${count === 1 ? '' : 's'} shown below.`;
}

function renderStoredReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  grid.querySelectorAll('.testi-card.user-review').forEach(card => card.remove());
  const reviews = getStoredReviews();
  reviews.forEach(review => grid.appendChild(createReviewCard(review)));
  updateSavedReviewCount(reviews);
}

document.addEventListener('DOMContentLoaded', renderStoredReviews);
window.addEventListener('storage', event => {
  if (event.key === REVIEW_STORAGE_KEY) renderStoredReviews();
});

function submitReview() {
  const name   = document.getElementById('reviewName').value.trim();
  const city   = document.getElementById('reviewCity').value.trim();
  const rating = +document.getElementById('reviewRating').value;
  const text   = document.getElementById('reviewText').value.trim();
  const msg    = document.getElementById('reviewMsg');

  if (!name || !text || rating === 0) {
    msg.textContent = '⚠️ Please fill in your name, rating, and review.';
    msg.style.color = '#e74c3c';
    return;
  }

  const review = {
    name,
    city: city || 'Tamil Nadu',
    rating,
    text,
    createdAt: new Date().toISOString()
  };
  saveReview(review);
  renderStoredReviews();

  const grid = document.getElementById('reviewsGrid');
  const savedCards = grid.querySelectorAll('.testi-card.user-review');
  const newestCard = savedCards[savedCards.length - 1];

  // Reset form
  document.getElementById('reviewName').value = '';
  document.getElementById('reviewCity').value = '';
  document.getElementById('reviewText').value = '';
  document.getElementById('reviewRating').value = 0;
  selectedRating = 0;
  document.querySelectorAll('.star-opt').forEach(s => s.classList.remove('selected'));

  msg.textContent = '✅ Thank you for your review!';
  msg.style.color = '#25D366';

  // Scroll to new review
  newestCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => { msg.textContent = ''; }, 4000);
}
