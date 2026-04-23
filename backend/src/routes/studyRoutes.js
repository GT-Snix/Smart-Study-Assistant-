const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { studyDataSchema, aiGenerateSchema } = require('../validators/data');
const { getStudyData, updateStudyData, addScore } = require('../controllers/studyController');
const { generateContent, getLeaderboard } = require('../controllers/aiController');

// All routes require auth
router.use(protect);

// Study data CRUD (student only)
router.get('/', authorize('student'), getStudyData);
router.put('/', authorize('student'), validate(studyDataSchema), updateStudyData);
router.post('/score', authorize('student'), addScore);

// Leaderboard (any authenticated user)
router.get('/leaderboard', getLeaderboard);

// AI generation (rate limited — student & teacher)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AI_RATE_LIMIT_MAX) || 20,
  message: { success: false, error: 'Too many AI requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/generate',
  authorize('student', 'teacher'),
  aiLimiter,
  validate(aiGenerateSchema),
  generateContent
);

module.exports = router;
