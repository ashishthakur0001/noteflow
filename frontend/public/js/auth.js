/* ============================================
   NoteFlow - Auth Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (api.isLoggedIn()) {
    window.location.href = '/dashboard';
    return;
  }

  // ── Login Form ────────────────────────────
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('[type=submit]');
      const email = loginForm.querySelector('#email').value.trim();
      const password = loginForm.querySelector('#password').value;
      const errBox = document.getElementById('form-error');

      errBox.classList.add('hidden');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Signing in…';

      try {
        const data = await api.auth.login({ email, password });
        api.setToken(data.token);
        api.setUser(data.user);
        showToast('Welcome back! 👋', 'success');
        setTimeout(() => window.location.href = '/dashboard', 500);
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
      }
    });
  }

  // ── Register Form ─────────────────────────
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    const pwInput = document.getElementById('password');
    if (pwInput) {
      pwInput.addEventListener('input', () => {
        const val = pwInput.value;
        const bars = document.querySelectorAll('.strength-bar');
        bars.forEach(b => b.className = 'strength-bar');
        if (val.length >= 6) {
          let strength = 0;
          if (val.length >= 8) strength++;
          if (/[A-Z]/.test(val) && /[0-9]/.test(val)) strength++;
          if (/[^A-Za-z0-9]/.test(val)) strength++;
          const levels = ['weak', 'medium', 'strong'];
          bars.forEach((b, i) => { if (i <= strength) b.classList.add(levels[strength]); });
        }
      });
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('[type=submit]');
      const errBox = document.getElementById('form-error');
      errBox.classList.add('hidden');

      const name = registerForm.querySelector('#name').value.trim();
      const email = registerForm.querySelector('#email').value.trim();
      const password = registerForm.querySelector('#password').value;
      const confirmPw = registerForm.querySelector('#confirm-password')?.value;

      if (confirmPw && password !== confirmPw) {
        errBox.textContent = 'Passwords do not match';
        errBox.classList.remove('hidden');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Creating account…';

      try {
        const data = await api.auth.register({ name, email, password });
        api.setToken(data.token);
        api.setUser(data.user);
        showToast('Account created! Welcome 🎉', 'success');
        setTimeout(() => window.location.href = '/dashboard', 500);
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
      }
    });
  }

  // ── Password Toggle ───────────────────────
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁';
      }
    });
  });
});
