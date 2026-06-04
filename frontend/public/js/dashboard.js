/* ============================================
   NoteFlow - Dashboard App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  if (!api.isLoggedIn()) { window.location.href = '/login'; return; }

  // ── State ──────────────────────────────────
  const state = {
    notes: [],
    pinnedNotes: [],
    tags: [],
    stats: {},
    view: localStorage.getItem('nf_view') || 'grid',
    currentSection: 'all',
    searchQuery: '',
    filterTag: null,
    editingNote: null,   // note object or null (null = new)
    isEditorOpen: false,
    user: api.getUser(),
    isSaving: false,
  };

  // ── DOM Refs ───────────────────────────────
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const notesContainer = $('notes-container');
  const pinnedContainer = $('pinned-container');
  const pinnedSection = $('pinned-section');
  const editorPanel = $('editor-panel');
  const searchInput = $('search-input');

  // ── Init ───────────────────────────────────
  applyUserInfo();
  await loadAll();
  bindEvents();

  // ── Load Everything ────────────────────────
  async function loadAll() {
    await Promise.all([loadNotes(), loadTags(), loadStats()]);
  }

  async function loadNotes() {
    try {
      const params = {};
      if (state.searchQuery) params.search = state.searchQuery;
      if (state.filterTag)   params.tag = state.filterTag;
      if (state.currentSection === 'archived') params.archived = 'true';
      if (state.currentSection === 'pinned')   params.pinned = 'true';

      let data;
      if (state.currentSection === 'trash') {
        data = await api.notes.getTrash();
        state.pinnedNotes = [];
        state.notes = data.notes || [];
        renderNotes(state.notes, false);
        return;
      }

      data = await api.notes.getAll(params);
      const all = data.notes || [];
      state.pinnedNotes = all.filter(n => n.isPinned);
      state.notes = all.filter(n => !n.isPinned);
      renderNotes(state.notes, state.currentSection === 'all');
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function loadTags() {
    try {
      const data = await api.tags.getAll();
      state.tags = data.tags || [];
      renderTags();
    } catch {}
  }

  async function loadStats() {
    try {
      const data = await api.notes.getStats();
      state.stats = data.stats || {};
      updateStatCounts();
    } catch {}
  }

  // ── Render Notes ───────────────────────────
  function renderNotes(notes, showPinned = true) {
    // Pinned section
    if (showPinned && state.pinnedNotes.length > 0) {
      pinnedSection.classList.remove('hidden');
      renderNoteCards(pinnedContainer, state.pinnedNotes, true);
    } else {
      pinnedSection.classList.add('hidden');
    }

    // Main notes
    const hasPinned = showPinned && state.pinnedNotes.length > 0;
    if (notes.length === 0 && !hasPinned) {
      notesContainer.innerHTML = getEmptyState();
    } else if (notes.length === 0 && showPinned) {
      notesContainer.innerHTML = '';
    } else {
      renderNoteCards(notesContainer, notes, false);
    }
  }

  function renderNoteCards(container, notes, isPinned) {
    const isGrid = state.view === 'grid';
    container.className = isGrid ? 'notes-grid' : 'notes-list';
    container.innerHTML = notes.map(note => buildNoteCard(note, isPinned)).join('');
    attachCardEvents(container);
  }

  function buildNoteCard(note, isPinned) {
    const bg = getNoteCardBg(note.color);
    const tagsHtml = note.tags.slice(0,3).map(t =>
      `<span class="tag-chip">${escapeHtml(t)}</span>`
    ).join('');

    const isTrash = state.currentSection === 'trash';

    const actions = isTrash ? `
      <button class="card-action-btn restore-btn" data-id="${note._id}" title="Restore">↩</button>
      <button class="card-action-btn perm-delete-btn" data-id="${note._id}" title="Delete permanently">🗑</button>
    ` : `
      <button class="card-action-btn pin-btn ${note.isPinned ? 'pinned' : ''}" data-id="${note._id}" title="${note.isPinned ? 'Unpin' : 'Pin'}">📌</button>
      <button class="card-action-btn archive-btn" data-id="${note._id}" title="${note.isArchived ? 'Unarchive' : 'Archive'}">📦</button>
      <button class="card-action-btn trash-btn" data-id="${note._id}" title="Move to trash">🗑</button>
    `;

    return `
      <div class="note-card ${state.view === 'list' ? 'list-card' : ''}"
           style="background:${bg}"
           data-id="${note._id}">
        ${note.isPinned && !isPinned ? '<span class="pin-indicator">📌</span>' : ''}
        <div class="card-actions">${actions}</div>
        <div class="note-card-title card-open" data-id="${note._id}">${escapeHtml(note.title || 'Untitled')}</div>
        ${note.content ? `<div class="note-card-content card-open" data-id="${note._id}">${escapeHtml(note.content)}</div>` : ''}
        ${note.tags.length ? `<div class="note-card-tags">${tagsHtml}</div>` : ''}
        <div class="note-card-meta">
          <span>${formatDate(note.updatedAt)}</span>
          ${note.wordCount > 0 ? `<span>${note.wordCount}w</span>` : ''}
        </div>
      </div>`;
  }

  function attachCardEvents(container) {
    container.querySelectorAll('.card-open').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openNote(id);
      });
    });
    container.querySelectorAll('.pin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); togglePin(btn.dataset.id); });
    });
    container.querySelectorAll('.archive-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); toggleArchive(btn.dataset.id); });
    });
    container.querySelectorAll('.trash-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); trashNote(btn.dataset.id); });
    });
    container.querySelectorAll('.restore-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); restoreNote(btn.dataset.id); });
    });
    container.querySelectorAll('.perm-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); permanentDelete(btn.dataset.id); });
    });
  }

  function getEmptyState() {
    const messages = {
      all:      { icon: '📝', title: 'No notes yet', desc: 'Click the + button to create your first note.' },
      pinned:   { icon: '📌', title: 'No pinned notes', desc: 'Pin important notes to find them quickly.' },
      archived: { icon: '📦', title: 'No archived notes', desc: 'Archived notes will appear here.' },
      trash:    { icon: '🗑️', title: 'Trash is empty', desc: 'Deleted notes will appear here.' },
    };
    const m = messages[state.currentSection] || messages.all;
    return `<div class="empty-state"><div class="empty-state-icon">${m.icon}</div><h3>${m.title}</h3><p>${m.desc}</p></div>`;
  }

  // ── Editor ─────────────────────────────────
  function openEditor(note = null) {
    state.editingNote = note;
    state.isEditorOpen = true;

    const isNew = !note;
    $('editor-title').value = isNew ? '' : note.title;
    $('editor-content').value = isNew ? '' : note.content;
    $('editor-save-btn').textContent = isNew ? 'Create' : 'Save';
    $('editor-word-count').textContent = isNew ? '0 words' : `${note.wordCount || 0} words`;

    // Color picker
    const color = isNew ? '#ffffff' : note.color;
    $$('.color-dot').forEach(dot => {
      dot.classList.toggle('selected', dot.dataset.color === color);
    });
    updateEditorColor(color);

    // Tags
    const tags = isNew ? [] : [...note.tags];
    renderEditorTags(tags);

    editorPanel.classList.remove('hidden');
    setTimeout(() => $('editor-title').focus(), 100);
  }

  async function openNote(id) {
    try {
      const data = await api.notes.getById(id);
      openEditor(data.note);
    } catch (err) { showToast(err.message, 'error'); }
  }

  function closeEditor() {
    state.isEditorOpen = false;
    state.editingNote = null;
    editorPanel.classList.add('hidden');
  }

  async function saveNote() {
    if (state.isSaving) return;
    const title = $('editor-title').value.trim() || 'Untitled Note';
    const content = $('editor-content').value;
    const color = document.querySelector('.color-dot.selected')?.dataset.color || '#ffffff';
    const tags = Array.from($$('.tag-pill')).map(el => el.dataset.tag);

    state.isSaving = true;
    const btn = $('editor-save-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="border-top-color:var(--ink)"></span>';

    try {
      if (state.editingNote) {
        await api.notes.update(state.editingNote._id, { title, content, color, tags });
        showToast('Note updated ✓', 'success');
      } else {
        await api.notes.create({ title, content, color, tags });
        showToast('Note created ✓', 'success');
      }
      closeEditor();
      await loadAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      state.isSaving = false;
      btn.disabled = false;
      btn.textContent = state.editingNote ? 'Save' : 'Create';
    }
  }

  function updateEditorColor(hex) {
    $('editor-color-bar').style.background = hex === '#ffffff' ? 'var(--border)' : hex;
    $('editor-panel-modal').style.background = getNoteCardBg(hex);
  }

  // ── Tags in Editor ─────────────────────────
  function renderEditorTags(tags) {
    const wrap = $('tags-input-wrap');
    $$('.tag-pill').forEach(p => p.remove());
    tags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.dataset.tag = tag;
      pill.innerHTML = `${escapeHtml(tag)}<button type="button" data-tag="${tag}">×</button>`;
      pill.querySelector('button').addEventListener('click', () => {
        pill.remove();
        updateWordCount();
      });
      wrap.insertBefore(pill, $('tags-input'));
    });
  }

  function addTag(val) {
    const tag = val.toLowerCase().trim().replace(/\s+/g, '-');
    if (!tag) return;
    const existing = Array.from($$('.tag-pill')).map(p => p.dataset.tag);
    if (existing.includes(tag) || existing.length >= 10) return;
    renderEditorTags([...existing, tag]);
    $('tags-input').value = '';
  }

  // ── Note Actions ───────────────────────────
  async function togglePin(id) {
    const note = [...state.notes, ...state.pinnedNotes].find(n => n._id === id);
    if (!note) return;
    await api.notes.update(id, { isPinned: !note.isPinned });
    await loadAll();
  }

  async function toggleArchive(id) {
    const note = [...state.notes, ...state.pinnedNotes].find(n => n._id === id);
    if (!note) return;
    await api.notes.update(id, { isArchived: !note.isArchived });
    showToast(note.isArchived ? 'Note unarchived' : 'Note archived', 'info');
    await loadAll();
  }

  async function trashNote(id) {
    await api.notes.trash(id);
    showToast('Moved to trash', 'info');
    await loadAll();
  }

  async function restoreNote(id) {
    await api.notes.restore(id);
    showToast('Note restored ✓', 'success');
    await loadAll();
  }

  async function permanentDelete(id) {
    showConfirm('This note will be permanently deleted and cannot be recovered.', async () => {
      await api.notes.deletePermanent(id);
      showToast('Note permanently deleted', 'info');
      await loadAll();
    }, { title: 'Delete permanently?', danger: true });
  }

  // ── Sidebar Navigation ─────────────────────
  function setSection(section) {
    state.currentSection = section;
    state.filterTag = null;
    state.searchQuery = '';
    if (searchInput) searchInput.value = '';

    $$('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.section === section);
    });

    const titles = {
      all: 'All Notes', pinned: 'Pinned', archived: 'Archive', trash: 'Trash'
    };
    $('page-title').textContent = titles[section] || 'Notes';

    // Show/hide FAB
    $('fab-new').classList.toggle('hidden', section === 'trash');
    $('empty-trash-btn')?.classList.toggle('hidden', section !== 'trash');

    loadNotes();
  }

  function filterByTag(tag) {
    state.filterTag = tag;
    state.currentSection = 'all';
    state.searchQuery = '';

    $$('.sidebar-item').forEach(el => el.classList.remove('active'));
    $('page-title').textContent = `#${tag}`;
    loadNotes();
  }

  // ── Tags Sidebar ───────────────────────────
  function renderTags() {
    const list = $('tags-list');
    if (!list) return;
    list.innerHTML = state.tags.slice(0, 15).map(t => `
      <button class="sidebar-item tag-sidebar-item" data-tag="${escapeHtml(t.name)}">
        <span class="tag-item-dot"></span>
        <span class="truncate">${escapeHtml(t.name)}</span>
        <span class="item-count">${t.count}</span>
      </button>`).join('');

    list.querySelectorAll('.tag-sidebar-item').forEach(btn => {
      btn.addEventListener('click', () => filterByTag(btn.dataset.tag));
    });
  }

  // ── Stats Counts ───────────────────────────
  function updateStatCounts() {
    const s = state.stats;
    const map = {
      'count-all':      s.total || 0,
      'count-pinned':   s.pinned || 0,
      'count-archived': s.archived || 0,
      'count-trash':    s.trashed || 0,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = $(id);
      if (el) el.textContent = val;
    });
  }

  // ── User Info ──────────────────────────────
  function applyUserInfo() {
    const user = state.user;
    if (!user) return;
    const initials = getInitials(user.name);
    $$('.user-avatar').forEach(el => el.textContent = initials);
    $$('.user-name').forEach(el => el.textContent = user.name);
    $$('.user-email').forEach(el => el.textContent = user.email);
  }

  // ── Word Count ─────────────────────────────
  function updateWordCount() {
    const content = $('editor-content')?.value || '';
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const el = $('editor-word-count');
    if (el) el.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  }

  // ── Bind Events ────────────────────────────
  function bindEvents() {
    // FAB new note
    $('fab-new')?.addEventListener('click', () => openEditor());

    // Sidebar nav
    $$('.sidebar-item[data-section]').forEach(btn => {
      btn.addEventListener('click', () => setSection(btn.dataset.section));
    });

    // Search
    if (searchInput) {
      searchInput.addEventListener('input', debounce(async (e) => {
        state.searchQuery = e.target.value.trim();
        await loadNotes();
      }, 350));
    }

    // View toggle
    $$('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.view = btn.dataset.view;
        localStorage.setItem('nf_view', state.view);
        $$('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
        renderNotes(state.notes, state.currentSection === 'all');
      });
    });
    // Set initial active view btn
    $$('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));

    // Editor close
    $('editor-close')?.addEventListener('click', closeEditor);
    editorPanel?.addEventListener('click', e => { if (e.target === editorPanel) closeEditor(); });

    // Editor save
    $('editor-save-btn')?.addEventListener('click', saveNote);

    // Keyboard shortcut: Ctrl+S to save, Esc to close
    document.addEventListener('keydown', (e) => {
      if (state.isEditorOpen) {
        if (e.key === 'Escape') closeEditor();
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNote(); }
      }
    });

    // Editor word count
    $('editor-content')?.addEventListener('input', updateWordCount);

    // Color picker
    $$('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        $$('.color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        updateEditorColor(dot.dataset.color);
      });
    });

    // Tags input
    const tagsInput = $('tags-input');
    tagsInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(tagsInput.value);
      }
      if (e.key === 'Backspace' && !tagsInput.value) {
        const pills = $$('.tag-pill');
        if (pills.length) pills[pills.length - 1].remove();
      }
    });

    // Theme toggle
    $('theme-toggle')?.addEventListener('click', () => {
      toggleTheme();
      $('theme-toggle').textContent = getTheme() === 'dark' ? '☀️' : '🌙';
    });
    const tt = $('theme-toggle');
    if (tt) tt.textContent = getTheme() === 'dark' ? '☀️' : '🌙';

    // Sidebar mobile toggle
    $('sidebar-toggle')?.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('open');
    });

    // Profile dropdown
    $('user-menu-btn')?.addEventListener('click', () => {
      $('user-dropdown').classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#user-menu-btn') && !e.target.closest('#user-dropdown')) {
        $('user-dropdown')?.classList.add('hidden');
      }
    });

    // Logout
    $('logout-btn')?.addEventListener('click', () => {
      showConfirm('You will be signed out of NoteFlow.', () => api.logout(), { title: 'Sign out?' });
    });

    // Empty trash
    $('empty-trash-btn')?.addEventListener('click', () => {
      showConfirm('All notes in trash will be permanently deleted.', async () => {
        await api.notes.emptyTrash();
        showToast('Trash emptied', 'info');
        await loadAll();
      }, { title: 'Empty trash?', danger: true });
    });

    // Toolbar formatting buttons
    $$('.toolbar-fmt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fmt = btn.dataset.fmt;
        const ta = $('editor-content');
        const start = ta.selectionStart, end = ta.selectionEnd;
        const selected = ta.value.substring(start, end);
        const wrap = { bold: '**', italic: '_', code: '`' };
        if (wrap[fmt]) {
          const w = wrap[fmt];
          const newText = selected ? `${w}${selected}${w}` : `${w}text${w}`;
          ta.setRangeText(newText, start, end, 'select');
        }
        updateWordCount();
        ta.focus();
      });
    });
  }
});
