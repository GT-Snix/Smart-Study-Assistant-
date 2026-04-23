const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { linkChildSchema, addStudentSchema, addBuddySchema } = require('../validators/data');
const {
  linkChild,
  unlinkChild,
  addStudent,
  removeStudent,
  addBuddy,
  removeBuddy,
  lookupUser,
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// Parent routes
router.post('/link-child', authorize('parent'), validate(linkChildSchema), linkChild);
router.delete('/unlink-child/:childId', authorize('parent'), unlinkChild);

// Teacher routes
router.post('/add-student', authorize('teacher'), validate(addStudentSchema), addStudent);
router.delete('/remove-student/:studentId', authorize('teacher'), removeStudent);

// Student/Buddy routes
router.post('/add-buddy', authorize('student'), validate(addBuddySchema), addBuddy);
router.delete('/remove-buddy/:buddyId', authorize('student'), removeBuddy);

// Lookup (any authenticated user)
router.get('/lookup/:uniqueId', lookupUser);

module.exports = router;
