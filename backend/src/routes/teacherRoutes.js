const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { assignmentSchema } = require('../validators/data');
const {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getStudents,
} = require('../controllers/teacherController');

// All routes require auth + teacher role
router.use(protect, authorize('teacher'));

router.route('/assignments').get(getAssignments).post(validate(assignmentSchema), createAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/students', getStudents);

module.exports = router;
