const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getChildProgress, getChildDetail } = require('../controllers/parentController');

// All routes require auth + parent role
router.use(protect, authorize('parent'));

router.get('/child-progress', getChildProgress);
router.get('/child-progress/:childId', getChildDetail);

module.exports = router;
