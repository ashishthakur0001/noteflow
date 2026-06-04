const { db } = require('../config/firebase');

const getTags = async (req, res) => {
  try {
    const snapshot = await db
      .collection('notes')
      .where('user', '==', req.user.id)
      .get();

    const counts = new Map();

    snapshot.docs.forEach(doc => {
      const note = doc.data();
      if (note.isTrashed) return;

      (note.tags || []).forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

    const tags = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    res.json({ success: true, tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTags };
