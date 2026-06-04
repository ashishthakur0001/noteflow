/* ============================================
   NoteFlow - API Client
   ============================================ */

const API_BASE = '/api';

const api = {
  // ── Token Management ──────────────────────
  getToken() { return localStorage.getItem('nf_token'); },
  setToken(t) { localStorage.setItem('nf_token', t); },
  removeToken() { localStorage.removeItem('nf_token'); },

  getUser() {
    try { return JSON.parse(localStorage.getItem('nf_user')); } catch { return null; }
  },
  setUser(u) { localStorage.setItem('nf_user', JSON.stringify(u)); },
  removeUser() { localStorage.removeItem('nf_user'); },

  isLoggedIn() { return !!this.getToken(); },

  logout() {
    this.removeToken();
    this.removeUser();
    window.location.href = '/login';
  },

  // ── Base Request ──────────────────────────
  async request(method, path, body = null, requireAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (requireAuth) {
      const token = this.getToken();
      if (!token) { window.location.href = '/login'; return; }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);
    const data = await res.json();

    if (res.status === 401) {
      this.logout();
      return;
    }

    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get(path, requireAuth = true)       { return this.request('GET', path, null, requireAuth); },
  post(path, body, requireAuth = true) { return this.request('POST', path, body, requireAuth); },
  put(path, body)                      { return this.request('PUT', path, body); },
  delete(path)                         { return this.request('DELETE', path); },

  // ── Auth ──────────────────────────────────
  auth: {
    register: (d) => api.post('/auth/register', d, false),
    login:    (d) => api.post('/auth/login', d, false),
    me:       ()  => api.get('/auth/me'),
    updateProfile:  (d) => api.put('/auth/profile', d),
    changePassword: (d) => api.put('/auth/change-password', d),
  },

  // ── Notes ─────────────────────────────────
  notes: {
    getAll:    (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.get(`/notes${q ? '?' + q : ''}`);
    },
    getById:   (id) => api.get(`/notes/${id}`),
    getStats:  ()   => api.get('/notes/stats'),
    getTrash:  ()   => api.get('/notes/trash'),
    create:    (d)  => api.post('/notes', d),
    update:    (id, d) => api.put(`/notes/${id}`, d),
    trash:     (id) => api.delete(`/notes/${id}`),
    restore:   (id) => api.put(`/notes/${id}/restore`, {}),
    deletePermanent: (id) => api.delete(`/notes/${id}/permanent`),
    emptyTrash: ()  => api.delete('/notes/trash/empty'),
  },

  // ── Tags ──────────────────────────────────
  tags: {
    getAll: () => api.get('/tags'),
  },
};

window.api = api;
