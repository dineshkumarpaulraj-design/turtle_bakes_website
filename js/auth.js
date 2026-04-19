// ============================================================
// AUTH PAGE — JS (Supabase Authentication)
// Handles the dedicated auth.html page (not the popup guard)
// ============================================================

function switchTab(tab) {
  const loginForm    = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');

  if (tab === 'login') {
    loginForm.style.display    = 'flex';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = 'flex';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
}

function showLoggedIn(user) {
  document.getElementById('login-form').style.display    = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('logged-in-view').style.display = 'block';
  document.querySelector('.auth-tabs').style.display = 'none';

  const emailDisplay = document.getElementById('user-email-display');
  if (emailDisplay) emailDisplay.textContent = user.email;

  const greeting = document.getElementById('user-greeting');
  if (greeting) {
    const name = user.user_metadata?.full_name || user.email.split('@')[0];
    greeting.textContent = `Welcome, ${name}! 🎂`;
  }
}

// ---- Login ----
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (!email || !pass) { showToast('⚠️ Please enter email and password', 'error'); return; }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Logging in...';

  try {
    if (!window.supabaseClient) throw new Error('Supabase not configured.');

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    showToast('✅ Logged in successfully!', 'success');
    setTimeout(() => window.location.href = '../index.html', 800);
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
    btn.disabled = false;
    btn.textContent = 'Login';
  }
}

// ---- Register ----
async function handleRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone')?.value.trim() || '';
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  if (!name || !email || !pass || !pass2) { showToast('⚠️ Please fill all fields', 'error'); return; }
  if (phone && !/^\d{10}$/.test(phone))   { showToast('⚠️ Phone must be 10 digits', 'error'); return; }
  if (pass.length < 6)                    { showToast('⚠️ Password must be at least 6 characters', 'error'); return; }
  if (pass !== pass2)                     { showToast('⚠️ Passwords do not match', 'error'); return; }

  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Creating account...';

  try {
    if (!window.supabaseClient) throw new Error('Supabase not configured.');

    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          phone: phone ? '+91' + phone : '',
        },
      },
    });
    if (error) throw error;

    // Save phone to profiles table (best-effort)
    if (data.user && phone) {
      try {
        await window.supabaseClient.from('profiles').upsert({
          id: data.user.id, full_name: name, email, phone: '+91' + phone,
        }, { onConflict: 'id' });
      } catch (_) {}
    }

    showToast('✅ Account created! Please login.', 'success');
    btn.disabled = false;
    btn.textContent = 'Create Account';
    switchTab('login');
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

async function handleLogout() {
  await Auth.signOut();
}

function initKeyListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const loginVisible = document.getElementById('login-form').style.display !== 'none';
    if (loginVisible) handleLogin();
    else handleRegister();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initKeyListeners();
  try {
    const user = await Auth.getUser();
    if (user) showLoggedIn(user);
  } catch (_) {}
});
