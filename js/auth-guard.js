// ============================================================
// TURTLE BAKES — auth-guard.js  v2.0
// ✅ Mandatory login popup (no guest bypass)
// ✅ Global navbar sync (name/avatar on all pages)
// ✅ Phone number collection + Supabase storage
// ✅ Single onAuthStateChange listener (no duplicates)
// ✅ Session-aware (shows popup only when logged out)
// Load ORDER: after supabase-config.js, after app.js, BEFORE features.js
// ============================================================

// ============================================================
// 0. CONSTANTS
// ============================================================
const TB_AUTH_CONFIG = {
  // Pages (relative paths) that never show the popup
  publicPages: ['auth.html'],

  // Supabase profiles table column for phone
  phoneColumn: 'phone',
};

// ============================================================
// 1. UTILITY — figure out relative path to auth page
// ============================================================
function tbAuthPath() {
  return window.location.pathname.includes('/pages/')
    ? 'auth.html'
    : 'pages/auth.html';
}

function tbIsAuthPage() {
  return window.location.pathname.includes('auth.html');
}

// ============================================================
// 2. NAVBAR UPDATE — runs on every page, every auth change
// ============================================================
async function updateNavbar() {
  if (!window.supabaseClient) return;

  try {
    const { data } = await window.supabaseClient.auth.getSession();
    const user = data?.session?.user;

    const btn = document.getElementById('auth-btn');
    if (!btn) return;

    if (user) {
      // Derive display name: full_name → email prefix
      const meta = user.user_metadata || {};
      const rawName = meta.full_name || meta.name || user.email || '';
      const firstName = rawName.split(/[\s@]/)[0] || 'You';
      const initial  = firstName.charAt(0).toUpperCase();

      btn.innerHTML = `
        <span style="
          display:inline-flex;align-items:center;gap:8px;
          background:var(--caramel);color:#fff;
          border-radius:var(--radius-sm);
          padding:8px 16px;font-weight:600;font-size:0.9rem;
          cursor:pointer;transition:var(--transition);
        ">
          <span style="
            width:26px;height:26px;border-radius:50%;
            background:#fff;color:var(--caramel);
            display:inline-flex;align-items:center;justify-content:center;
            font-weight:700;font-size:0.85rem;flex-shrink:0;
          ">${initial}</span>
          ${firstName}
        </span>
      `;
      btn.style.background = 'none';
      btn.style.padding    = '0';
      btn.style.border     = 'none';
      btn.onclick = () => {
        window.location.href = window.location.pathname.includes('/pages/')
          ? 'dashboard.html'
          : 'pages/dashboard.html';
      };
    } else {
      btn.textContent = 'Login / Register';
      btn.style.cssText = ''; // reset inline styles
      btn.onclick = () => { window.location.href = tbAuthPath(); };
    }
  } catch (err) {
    console.warn('[TB] updateNavbar error:', err);
  }
}

// ============================================================
// 3. MANDATORY LOGIN POPUP — no close, no guest option
// ============================================================
const TBAuthGuard = {
  _overlayId: 'tb-auth-guard-overlay',
  _tabState: 'login',  // 'login' | 'register'

  // ---------- Show the blocking modal ----------
  show() {
    if (document.getElementById(this._overlayId)) return; // already open

    // Prevent any interaction with page behind
    document.body.style.overflow = 'hidden';
    document.body.classList.add('tb-auth-locked');

    const overlay = document.createElement('div');
    overlay.id = this._overlayId;
    overlay.style.cssText = `
      position:fixed;inset:0;
      background:rgba(29,12,0,0.70);
      backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
      z-index:99999;
      display:flex;align-items:center;justify-content:center;
      padding:20px;
      opacity:0;transition:opacity 0.35s ease;
    `;

    overlay.innerHTML = this._buildHTML();
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    });

    this._bindEvents();
  },

  // ---------- Dismiss (only called after successful login) ----------
  dismiss() {
    const overlay = document.getElementById(this._overlayId);
    if (!overlay) return;

    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
      document.body.classList.remove('tb-auth-locked');
    }, 350);

    updateNavbar(); // reflect logged-in state immediately
  },

  // ---------- Build modal HTML ----------
  _buildHTML() {
    return `
      <div id="tb-guard-modal" style="
        background:#fff;
        border-radius:24px;
        padding:clamp(28px,6vw,48px);
        max-width:460px;width:100%;
        box-shadow:0 24px 80px rgba(61,31,10,0.3);
        position:relative;
        animation:fadeUp 0.4s 0.05s ease both;
        max-height:92vh;overflow-y:auto;
      " role="dialog" aria-modal="true" aria-label="Login required">

        <!-- Logo + Title -->
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:3rem;margin-bottom:8px;">🐢</div>
          <h2 style="
            font-family:var(--font-display);font-size:1.7rem;
            color:var(--chocolate);margin-bottom:8px;
          ">Welcome to Turtle Bakes!</h2>
          <p style="color:var(--text-mid);font-size:0.93rem;line-height:1.6;">
            Please <strong>login or register</strong> to browse our menu and place orders.
          </p>
        </div>

        <!-- Tabs -->
        <div style="display:flex;border-bottom:2px solid var(--cream-dark);margin-bottom:24px;">
          <button id="tg-tab-login" onclick="TBAuthGuard._switchTab('login')" style="
            flex:1;padding:10px;background:none;border:none;border-bottom:2px solid var(--caramel);
            margin-bottom:-2px;font-family:var(--font-body);font-weight:600;
            color:var(--caramel);cursor:pointer;font-size:0.95rem;
          ">Login</button>
          <button id="tg-tab-register" onclick="TBAuthGuard._switchTab('register')" style="
            flex:1;padding:10px;background:none;border:none;border-bottom:2px solid transparent;
            margin-bottom:-2px;font-family:var(--font-body);font-weight:500;
            color:var(--text-light);cursor:pointer;font-size:0.95rem;
          ">Register</button>
        </div>

        <!-- ===== LOGIN FORM ===== -->
        <div id="tg-login-form">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-mid);margin-bottom:6px;">
                Email Address
              </label>
              <input id="tg-login-email" type="email" placeholder="you@example.com"
                style="width:100%;padding:12px 14px;border:1.5px solid var(--border);
                  border-radius:var(--radius-sm);font-size:0.95rem;
                  background:var(--cream);font-family:var(--font-body);
                  transition:border-color 0.2s;box-sizing:border-box;"
                onfocus="this.style.borderColor='var(--caramel)'"
                onblur="this.style.borderColor='var(--border)'" />
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-mid);margin-bottom:6px;">
                Password
              </label>
              <input id="tg-login-pass" type="password" placeholder="Your password"
                style="width:100%;padding:12px 14px;border:1.5px solid var(--border);
                  border-radius:var(--radius-sm);font-size:0.95rem;
                  background:var(--cream);font-family:var(--font-body);
                  transition:border-color 0.2s;box-sizing:border-box;"
                onfocus="this.style.borderColor='var(--caramel)'"
                onblur="this.style.borderColor='var(--border)'"
                onkeydown="if(event.key==='Enter')TBAuthGuard._handleLogin()" />
            </div>
            <button id="tg-login-btn" onclick="TBAuthGuard._handleLogin()" style="
              width:100%;padding:13px;background:var(--caramel);color:#fff;
              border:none;border-radius:var(--radius-sm);font-size:0.95rem;
              font-weight:600;cursor:pointer;font-family:var(--font-body);
              transition:background 0.2s;margin-top:4px;
            " onmouseover="this.style.background='var(--chocolate-mid)'"
               onmouseout="this.style.background='var(--caramel)'">
              Login →
            </button>
          </div>
        </div>

        <!-- ===== REGISTER FORM ===== -->
        <div id="tg-register-form" style="display:none;">
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-mid);margin-bottom:6px;">
                Full Name *
              </label>
              <input id="tg-reg-name" type="text" placeholder="Your full name"
                style="width:100%;padding:12px 14px;border:1.5px solid var(--border);
                  border-radius:var(--radius-sm);font-size:0.95rem;
                  background:var(--cream);font-family:var(--font-body);box-sizing:border-box;"
                onfocus="this.style.borderColor='var(--caramel)'"
                onblur="this.style.borderColor='var(--border)'" />
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-mid);margin-bottom:6px;">
                Email Address *
              </label>
              <input id="tg-reg-email" type="email" placeholder="you@example.com"
                style="width:100%;padding:12px 14px;border:1.5px solid var(--border);
                  border-radius:var(--radius-sm);font-size:0.95rem;
                  background:var(--cream);font-family:var(--font-body);box-sizing:border-box;"
                onfocus="this.style.borderColor='var(--caramel)'"
                onblur="this.style.borderColor='var(--border)'" />
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-mid);margin-bottom:6px;">
                📱 Phone Number * <span style="font-weight:400;color:var(--text-light)">(10 digits)</span>
              </label>
              <div style="display:flex;align-items:center;border:1.5px solid var(--border);
                border-radius:var(--radius-sm);overflow:hidden;background:var(--cream);"
                id="tg-phone-wrap">
                <span style="padding:0 10px;color:var(--text-mid);font-size:0.9rem;
                  border-right:1.5px solid var(--border);height:100%;
                  display:flex;align-items:center;background:var(--cream-dark);">🇮🇳 +91</span>
                <input id="tg-reg-phone" type="tel" placeholder="9876543210" maxlength="10"
                  style="flex:1;padding:12px 14px;border:none;font-size:0.95rem;
                    background:transparent;font-family:var(--font-body);box-sizing:border-box;"
                  oninput="this.value=this.value.replace(/\D/g,'')"
                  onfocus="document.getElementById('tg-phone-wrap').style.borderColor='var(--caramel)'"
                  onblur="document.getElementById('tg-phone-wrap').style.borderColor='var(--border)'" />
              </div>
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-mid);margin-bottom:6px;">
                Password * <span style="font-weight:400;color:var(--text-light)">(min 6 chars)</span>
              </label>
              <input id="tg-reg-pass" type="password" placeholder="Min 6 characters"
                style="width:100%;padding:12px 14px;border:1.5px solid var(--border);
                  border-radius:var(--radius-sm);font-size:0.95rem;
                  background:var(--cream);font-family:var(--font-body);box-sizing:border-box;"
                onfocus="this.style.borderColor='var(--caramel)'"
                onblur="this.style.borderColor='var(--border)'" />
            </div>
            <div>
              <label style="display:block;font-size:0.85rem;font-weight:600;color:var(--text-mid);margin-bottom:6px;">
                Confirm Password *
              </label>
              <input id="tg-reg-pass2" type="password" placeholder="Repeat password"
                style="width:100%;padding:12px 14px;border:1.5px solid var(--border);
                  border-radius:var(--radius-sm);font-size:0.95rem;
                  background:var(--cream);font-family:var(--font-body);box-sizing:border-box;"
                onfocus="this.style.borderColor='var(--caramel)'"
                onblur="this.style.borderColor='var(--border)'"
                onkeydown="if(event.key==='Enter')TBAuthGuard._handleRegister()" />
            </div>
            <button id="tg-reg-btn" onclick="TBAuthGuard._handleRegister()" style="
              width:100%;padding:13px;background:var(--caramel);color:#fff;
              border:none;border-radius:var(--radius-sm);font-size:0.95rem;
              font-weight:600;cursor:pointer;font-family:var(--font-body);
              transition:background 0.2s;margin-top:4px;
            " onmouseover="this.style.background='var(--chocolate-mid)'"
               onmouseout="this.style.background='var(--caramel)'">
              Create Account →
            </button>
          </div>
        </div>

        <!-- Error message area -->
        <div id="tg-error" style="
          display:none;margin-top:14px;padding:10px 14px;
          background:#fee2e2;color:#dc2626;border-radius:var(--radius-sm);
          font-size:0.85rem;text-align:center;
        "></div>

        <p style="text-align:center;margin-top:18px;font-size:0.78rem;color:var(--text-light);">
          By continuing, you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>
    `;
  },

  // ---------- Tab switching ----------
  _switchTab(tab) {
    this._tabState = tab;
    this._clearError();

    const loginForm   = document.getElementById('tg-login-form');
    const regForm     = document.getElementById('tg-register-form');
    const tabLogin    = document.getElementById('tg-tab-login');
    const tabRegister = document.getElementById('tg-tab-register');

    const activeStyle   = 'border-bottom:2px solid var(--caramel);color:var(--caramel);font-weight:600;';
    const inactiveStyle = 'border-bottom:2px solid transparent;color:var(--text-light);font-weight:500;';

    if (tab === 'login') {
      loginForm.style.display   = 'block';
      regForm.style.display     = 'none';
      tabLogin.style.cssText   += activeStyle;
      tabRegister.style.cssText += inactiveStyle;
    } else {
      loginForm.style.display   = 'none';
      regForm.style.display     = 'block';
      tabLogin.style.cssText   += inactiveStyle;
      tabRegister.style.cssText += activeStyle;
    }
  },

  // ---------- Error helpers ----------
  _showError(msg) {
    const el = document.getElementById('tg-error');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  },
  _clearError() {
    const el = document.getElementById('tg-error');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  },

  // ---------- Set button loading state ----------
  _setLoading(btnId, loading, label) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? '⏳ Please wait...' : label;
  },

  // ---------- LOGIN ----------
  async _handleLogin() {
    this._clearError();
    const email = (document.getElementById('tg-login-email')?.value || '').trim();
    const pass  = (document.getElementById('tg-login-pass')?.value  || '');

    if (!email || !pass) { this._showError('⚠️ Please enter your email and password.'); return; }

    this._setLoading('tg-login-btn', true, 'Login →');

    try {
      if (!window.supabaseClient) throw new Error('Supabase not configured.');

      const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;

      // Success — dismiss popup, update navbar
      typeof showToast === 'function' && showToast('✅ Welcome back!', 'success');
      this.dismiss();

    } catch (err) {
      this._showError('❌ ' + (err.message || 'Login failed. Please try again.'));
      this._setLoading('tg-login-btn', false, 'Login →');
    }
  },

  // ---------- REGISTER ----------
  async _handleRegister() {
    this._clearError();
    const name  = (document.getElementById('tg-reg-name')?.value  || '').trim();
    const email = (document.getElementById('tg-reg-email')?.value || '').trim();
    const phone = (document.getElementById('tg-reg-phone')?.value || '').trim();
    const pass  = (document.getElementById('tg-reg-pass')?.value  || '');
    const pass2 = (document.getElementById('tg-reg-pass2')?.value || '');

    // Validate
    if (!name || !email || !phone || !pass || !pass2) {
      this._showError('⚠️ Please fill in all fields.'); return;
    }
    if (!/^\d{10}$/.test(phone)) {
      this._showError('⚠️ Phone number must be exactly 10 digits.'); return;
    }
    if (pass.length < 6) {
      this._showError('⚠️ Password must be at least 6 characters.'); return;
    }
    if (pass !== pass2) {
      this._showError('⚠️ Passwords do not match.'); return;
    }

    this._setLoading('tg-reg-btn', true, 'Create Account →');

    try {
      if (!window.supabaseClient) throw new Error('Supabase not configured.');

      // 1. Create auth user
      const { data, error } = await window.supabaseClient.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
            phone:     '+91' + phone,
          },
        },
      });
      if (error) throw error;

      // 2. Upsert phone into profiles table (best-effort)
      try {
        if (data.user) {
          await window.supabaseClient
            .from('profiles')
            .upsert({
              id:        data.user.id,
              full_name: name,
              email:     email,
              phone:     '+91' + phone,
            }, { onConflict: 'id' });
        }
      } catch (profileErr) {
        // Non-fatal — profile upsert may fail if table missing
        console.warn('[TB] Profile upsert skipped:', profileErr.message);
      }

      // 3. Auto-login if email confirmation not required
      if (data.session) {
        typeof showToast === 'function' && showToast('🎉 Account created! Welcome!', 'success');
        this.dismiss();
      } else {
        // Email confirmation required — show message, switch to login
        this._clearError();
        const errEl = document.getElementById('tg-error');
        if (errEl) {
          errEl.style.background = '#d1fae5';
          errEl.style.color      = '#065f46';
          errEl.textContent      = '✅ Account created! Check your email to confirm, then login.';
          errEl.style.display    = 'block';
        }
        this._switchTab('login');
        this._setLoading('tg-reg-btn', false, 'Create Account →');
      }

    } catch (err) {
      this._showError('❌ ' + (err.message || 'Registration failed.'));
      this._setLoading('tg-reg-btn', false, 'Create Account →');
    }
  },

  // ---------- Bind events ----------
  _bindEvents() {
    // Prevent clicks on overlay from propagating behind it
    const overlay = document.getElementById(this._overlayId);
    if (overlay) {
      overlay.addEventListener('click', e => {
        // Only close if clicking directly on overlay (not modal content)
        if (e.target === overlay) {
          // Do NOT close — login is mandatory
          e.stopPropagation();
        }
      });
    }
  },

  // ---------- Main init ----------
  async init() {
    // Never show popup on the auth page itself
    if (tbIsAuthPage()) return;

    if (!window.supabaseClient) {
      console.warn('[TB] Supabase not ready — skipping auth guard');
      return;
    }

    try {
      const { data } = await window.supabaseClient.auth.getSession();
      if (data?.session?.user) {
        // Already logged in — just update navbar
        await updateNavbar();
        return;
      }
      // Not logged in → show mandatory popup
      this.show();
    } catch (err) {
      console.warn('[TB] Auth guard init error:', err);
    }
  },
};

// ============================================================
// 4. SINGLE AUTH STATE LISTENER (replaces ALL duplicates)
// ============================================================
(function setupAuthListener() {
  // Wait for supabaseClient to be ready
  const _setup = () => {
    if (!window.supabaseClient) {
      return setTimeout(_setup, 100);
    }

    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      // Update navbar on every auth event
      updateNavbar();

      if (event === 'SIGNED_IN' && session) {
        // Dismiss the guard popup if still open
        TBAuthGuard.dismiss();
        window.currentUser = session.user;
      }

      if (event === 'SIGNED_OUT') {
        window.currentUser = null;
        // Don't show popup immediately on signout — page will redirect
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _setup);
  } else {
    _setup();
  }
})();

// ============================================================
// 5. PAGE INIT — runs after DOM is ready
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Always update navbar first
  await updateNavbar();

  // Then check auth and show popup if needed
  await TBAuthGuard.init();
});

// ============================================================
// 6. PATCH auth.html's existing auth.js handlers to also update
//    the navbar (works because updateNavbar is now global)
// ============================================================
// updateNavbar is already global — auth.js calls it via onAuthStateChange above.
