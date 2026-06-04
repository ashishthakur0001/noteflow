/* ============================================
   NoteFlow - Utility Functions
   ============================================ */

// ── Toast Notifications ───────────────────────
function showToast(message, type = 'default', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ', default: '●' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.default}</span><span>${message}</span>`;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('fadeout');
    setTimeout(() => toast.remove(), 300);
  };
  setTimeout(remove, duration);
  toast.addEventListener('click', remove);
}

// ── Confirm Dialog ────────────────────────────
function showConfirm(message, onConfirm, { title = 'Are you sure?', danger = false } = {}) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header"><h2>${title}</h2></div>
      <div class="modal-body"><p style="color:var(--ink-2)">${message}</p></div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" id="confirm-cancel">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-accent'} btn-sm" id="confirm-ok">Confirm</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#confirm-ok').addEventListener('click', () => { overlay.remove(); onConfirm(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── Date Formatting ───────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days < 7)    return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

// ── Debounce ──────────────────────────────────
function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ── Theme ─────────────────────────────────────
function getTheme() { return localStorage.getItem('nf_theme') || 'light'; }
function setTheme(theme) {
  localStorage.setItem('nf_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}
function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}
// Apply on load
setTheme(getTheme());

// ── User Initials ─────────────────────────────
function getInitials(name = '') {
  return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}

// ── Sanitize HTML ─────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Note color map ────────────────────────────
const NOTE_COLORS = [
  { value: '#ffffff', label: 'White',  css: 'var(--note-white)'  },
  { value: '#fef9c3', label: 'Yellow', css: 'var(--note-yellow)' },
  { value: '#fce7f3', label: 'Pink',   css: 'var(--note-pink)'   },
  { value: '#dbeafe', label: 'Blue',   css: 'var(--note-blue)'   },
  { value: '#dcfce7', label: 'Green',  css: 'var(--note-green)'  },
  { value: '#ede9fe', label: 'Purple', css: 'var(--note-purple)' },
  { value: '#ffedd5', label: 'Orange', css: 'var(--note-orange)' },
  { value: '#ccfbf1', label: 'Teal',   css: 'var(--note-teal)'   },
];

function getNoteCardBg(hexColor) {
  const found = NOTE_COLORS.find(c => c.value === hexColor);
  return found ? found.css : hexColor;
}

window.showToast = showToast;
window.showConfirm = showConfirm;
window.formatDate = formatDate;
window.debounce = debounce;
window.getTheme = getTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
window.getInitials = getInitials;
window.escapeHtml = escapeHtml;
window.NOTE_COLORS = NOTE_COLORS;
window.getNoteCardBg = getNoteCardBg;
