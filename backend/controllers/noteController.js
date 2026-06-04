const { db } = require('../config/firebase');

const notesRef = db.collection('notes');

const nowIso = () => new Date().toISOString();

const serializeNote = (doc) => ({
  _id: doc.id,
  ...doc.data(),
});

const normalizeTags = (tags = []) => {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(tag => String(tag).toLowerCase().trim())
    .filter(Boolean)
    .slice(0, 10);
};

const countWords = (content = '') => {
  const words = String(content).trim().split(/\s+/).filter(Boolean);
  return words.length;
};

const getUserNotes = async (userId) => {
  const snapshot = await notesRef.where('user', '==', userId).get();
  return snapshot.docs.map(serializeNote);
};

const sortNotes = (notes, sort = '-updatedAt') => {
  const direction = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');

  return [...notes].sort((a, b) => {
    const av = a[field] || '';
    const bv = b[field] || '';
    if (av < bv) return -1 * direction;
    if (av > bv) return 1 * direction;
    return 0;
  });
};

const getOwnedNote = async (id, userId) => {
  const doc = await notesRef.doc(id).get();
  if (!doc.exists) return null;

  const note = serializeNote(doc);
  return note.user === userId ? note : null;
};

const getNotes = async (req, res) => {
  try {
    const { search, tag, color, pinned, archived, page = 1, limit = 50, sort = '-updatedAt' } = req.query;
    const searchText = search ? String(search).toLowerCase() : '';

    let notes = await getUserNotes(req.user.id);
    notes = notes.filter(note => note.isTrashed === false);

    if (archived === 'true') {
      notes = notes.filter(note => note.isArchived === true);
    } else if (archived !== 'all') {
      notes = notes.filter(note => note.isArchived === false);
    }

    if (pinned === 'true') notes = notes.filter(note => note.isPinned === true);
    if (tag) notes = notes.filter(note => (note.tags || []).includes(String(tag).toLowerCase()));
    if (color) notes = notes.filter(note => note.color === color);

    if (searchText) {
      notes = notes.filter(note => {
        const title = String(note.title || '').toLowerCase();
        const content = String(note.content || '').toLowerCase();
        const tags = (note.tags || []).join(' ').toLowerCase();
        return title.includes(searchText) || content.includes(searchText) || tags.includes(searchText);
      });
    }

    const total = notes.length;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.max(parseInt(limit, 10) || 50, 1);
    const skip = (pageNumber - 1) * pageLimit;
    const pagedNotes = sortNotes(notes, sort).slice(skip, skip + pageLimit);

    res.json({
      success: true,
      count: pagedNotes.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageLimit),
      notes: pagedNotes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTrashedNotes = async (req, res) => {
  try {
    const notes = sortNotes(
      (await getUserNotes(req.user.id)).filter(note => note.isTrashed === true),
      '-trashedAt',
    );
    res.json({ success: true, count: notes.length, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const notes = await getUserNotes(req.user.id);
    const activeNotes = notes.filter(note => note.isTrashed === false);
    const tags = new Set(activeNotes.flatMap(note => note.tags || []));

    res.json({
      success: true,
      stats: {
        total: activeNotes.filter(note => note.isArchived === false).length,
        pinned: activeNotes.filter(note => note.isPinned === true).length,
        archived: activeNotes.filter(note => note.isArchived === true).length,
        trashed: notes.filter(note => note.isTrashed === true).length,
        uniqueTags: tags.size,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await getOwnedNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const viewCount = (note.viewCount || 0) + 1;
    await notesRef.doc(req.params.id).update({ viewCount, updatedAt: note.updatedAt });

    res.json({ success: true, note: { ...note, viewCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, tags, color, isPinned, reminderAt } = req.body;
    const timestamp = nowIso();
    const noteData = {
      user: req.user.id,
      title: title || 'Untitled Note',
      content: content || '',
      tags: normalizeTags(tags),
      color: color || '#ffffff',
      isPinned: Boolean(isPinned),
      isArchived: false,
      isTrashed: false,
      trashedAt: null,
      reminderAt: reminderAt || null,
      viewCount: 0,
      wordCount: countWords(content),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const doc = await notesRef.add(noteData);
    res.status(201).json({ success: true, message: 'Note created', note: { _id: doc.id, ...noteData } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await getOwnedNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    const allowedFields = ['title', 'content', 'tags', 'color', 'isPinned', 'isArchived', 'reminderAt'];
    const updates = { updatedAt: nowIso() };

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'tags' ? normalizeTags(req.body[field]) : req.body[field];
      }
    });

    if (updates.content !== undefined) {
      updates.wordCount = countWords(updates.content);
    }

    await notesRef.doc(req.params.id).update(updates);
    const updated = await notesRef.doc(req.params.id).get();

    res.json({ success: true, message: 'Note updated', note: serializeNote(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const trashNote = async (req, res) => {
  try {
    const note = await getOwnedNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await notesRef.doc(req.params.id).update({
      isTrashed: true,
      trashedAt: nowIso(),
      updatedAt: nowIso(),
    });

    res.json({ success: true, message: 'Note moved to trash' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const restoreNote = async (req, res) => {
  try {
    const note = await getOwnedNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await notesRef.doc(req.params.id).update({
      isTrashed: false,
      trashedAt: null,
      updatedAt: nowIso(),
    });
    const restored = await notesRef.doc(req.params.id).get();

    res.json({ success: true, message: 'Note restored', note: serializeNote(restored) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteNotePermanent = async (req, res) => {
  try {
    const note = await getOwnedNote(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await notesRef.doc(req.params.id).delete();
    res.json({ success: true, message: 'Note permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const emptyTrash = async (req, res) => {
  try {
    const trashedNotes = (await getUserNotes(req.user.id)).filter(note => note.isTrashed === true);

    for (let i = 0; i < trashedNotes.length; i += 500) {
      const batch = db.batch();
      trashedNotes.slice(i, i + 500).forEach(note => {
        batch.delete(notesRef.doc(note._id));
      });
      await batch.commit();
    }

    res.json({ success: true, message: `${trashedNotes.length} notes permanently deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotes, getTrashedNotes, getStats, getNoteById,
  createNote, updateNote, trashNote, restoreNote,
  deleteNotePermanent, emptyTrash,
};
