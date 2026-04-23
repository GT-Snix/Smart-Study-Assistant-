const Assignment = require('../models/Assignment');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * @desc    Get assignments created by teacher
 * @route   GET /api/v1/assignments
 * @access  Private (teacher)
 */
const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.user._id })
      .populate('studentIds', 'name uniqueId avatar')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create assignment
 * @route   POST /api/v1/assignments
 * @access  Private (teacher)
 */
const createAssignment = async (req, res, next) => {
  try {
    const { title, subject, content, dueDate, studentIds } = req.body;

    // If studentIds provided, verify they belong to teacher's roster
    if (studentIds && studentIds.length > 0) {
      const teacher = await User.findById(req.user._id);
      for (const sid of studentIds) {
        if (!teacher.students.some((id) => id.equals(sid))) {
          return next(new AppError(`Student ${sid} is not in your roster`, 400));
        }
      }
    }

    const assignment = await Assignment.create({
      teacherId: req.user._id,
      title,
      subject,
      content,
      dueDate: dueDate || null,
      studentIds: studentIds || req.user.students, // default to all students
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete assignment
 * @route   DELETE /api/v1/assignments/:id
 * @access  Private (teacher)
 */
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return next(new AppError('Assignment not found', 404));

    // Data-level security: only the creating teacher can delete
    if (!assignment.teacherId.equals(req.user._id)) {
      return next(new AppError('Not authorized to delete this assignment', 403));
    }

    await assignment.deleteOne();
    res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get teacher's students with their reports
 * @route   GET /api/v1/students
 * @access  Private (teacher)
 */
const getStudents = async (req, res, next) => {
  try {
    const teacher = await User.findById(req.user._id).populate(
      'students',
      'name email uniqueId avatar'
    );

    // Fetch reports for all students
    const Report = require('../models/Report');
    const studentData = await Promise.all(
      teacher.students.map(async (student) => {
        const report = await Report.findOne({ studentId: student._id });
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          uniqueId: student.uniqueId,
          avatar: student.avatar,
          totalScore: report?.totalScore || 0,
          quizCount: report?.quizCount || 0,
          avgScore: report?.avgScore || 0,
          streak: report?.streak || 0,
          lastActive: report?.lastActive || null,
        };
      })
    );

    res.status(200).json({ success: true, count: studentData.length, data: studentData });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAssignments, createAssignment, deleteAssignment, getStudents };
