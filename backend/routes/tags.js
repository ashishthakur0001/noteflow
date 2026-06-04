const express = require('express');
const router = express.Router();
const { getTags } = require('../controllers/tagController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getTags);

module.exports = router;
