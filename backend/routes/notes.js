const express = require('express');
const router = express.Router();
const {
  getNotes, getTrashedNotes, getStats, getNoteById,
  createNote, updateNote, trashNote, restoreNote,
  deleteNotePermanent, emptyTrash,
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotes);
router.post('/', createNote);
router.get('/stats', getStats);
router.get('/trash', getTrashedNotes);
router.delete('/trash/empty', emptyTrash);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', trashNote);
router.put('/:id/restore', restoreNote);
router.delete('/:id/permanent', deleteNotePermanent);

module.exports = router;
