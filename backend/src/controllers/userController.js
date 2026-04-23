const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Helper: find a user by email or uniqueId
 */
const findByIdentifier = async (identifier) => {
  // Check if it looks like an email
  if (identifier.includes('@')) {
    return User.findOne({ email: identifier.toLowerCase() });
  }
  return User.findOne({ uniqueId: identifier });
};

/**
 * @desc    Link a child to parent account
 * @route   POST /api/v1/user/link-child
 * @access  Private (parent only)
 */
const linkChild = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const parent = req.user;

    const child = await findByIdentifier(identifier);
    if (!child) {
      return next(new AppError('No student found with that email or ID', 404));
    }
    if (child.role !== 'student') {
      return next(new AppError('You can only link student accounts as children', 400));
    }
    if (child._id.equals(parent._id)) {
      return next(new AppError('You cannot link yourself', 400));
    }

    // Prevent duplicates
    if (parent.children.some((id) => id.equals(child._id))) {
      return next(new AppError('This child is already linked', 400));
    }

    // Bidirectional — update both
    parent.children.push(child._id);
    await parent.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `${child.name} linked as your child`,
      data: { name: child.name, uniqueId: child.uniqueId, avatar: child.avatar },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Unlink a child from parent account
 * @route   DELETE /api/v1/user/unlink-child/:childId
 * @access  Private (parent only)
 */
const unlinkChild = async (req, res, next) => {
  try {
    const parent = req.user;
    const childObjectId = req.params.childId;

    parent.children = parent.children.filter((id) => !id.equals(childObjectId));
    await parent.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: 'Child unlinked' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add student to teacher's roster
 * @route   POST /api/v1/user/add-student
 * @access  Private (teacher only)
 */
const addStudent = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const teacher = req.user;

    const student = await findByIdentifier(identifier);
    if (!student) {
      return next(new AppError('No student found with that email or ID', 404));
    }
    if (student.role !== 'student') {
      return next(new AppError('You can only add student accounts', 400));
    }
    if (student._id.equals(teacher._id)) {
      return next(new AppError('You cannot add yourself', 400));
    }
    if (teacher.students.some((id) => id.equals(student._id))) {
      return next(new AppError('Student already in your roster', 400));
    }

    teacher.students.push(student._id);
    await teacher.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `${student.name} added to your students`,
      data: { name: student.name, uniqueId: student.uniqueId, avatar: student.avatar, _id: student._id },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove student from teacher's roster
 * @route   DELETE /api/v1/user/remove-student/:studentId
 * @access  Private (teacher only)
 */
const removeStudent = async (req, res, next) => {
  try {
    const teacher = req.user;
    const studentObjectId = req.params.studentId;

    teacher.students = teacher.students.filter((id) => !id.equals(studentObjectId));
    await teacher.save({ validateModifiedOnly: true });

    res.status(200).json({ success: true, message: 'Student removed' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add buddy (student only)
 * @route   POST /api/v1/user/add-buddy
 * @access  Private (student only)
 */
const addBuddy = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    const me = req.user;

    const buddy = await findByIdentifier(identifier);
    if (!buddy) {
      return next(new AppError('No student found with that email or ID', 404));
    }
    if (buddy.role !== 'student') {
      return next(new AppError('Buddies must be student accounts', 400));
    }
    if (buddy._id.equals(me._id)) {
      return next(new AppError('You cannot buddy yourself', 400));
    }
    if (me.buddies.some((id) => id.equals(buddy._id))) {
      return next(new AppError('Already buddies', 400));
    }

    // Bidirectional buddy link
    me.buddies.push(buddy._id);
    await me.save({ validateModifiedOnly: true });

    buddy.buddies.push(me._id);
    await buddy.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: `${buddy.name} added as buddy`,
      data: { name: buddy.name, uniqueId: buddy.uniqueId, avatar: buddy.avatar, _id: buddy._id },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Remove buddy (student only)
 * @route   DELETE /api/v1/user/remove-buddy/:buddyId
 * @access  Private (student only)
 */
const removeBuddy = async (req, res, next) => {
  try {
    const me = req.user;
    const buddyId = req.params.buddyId;

    // Remove from both sides
    me.buddies = me.buddies.filter((id) => !id.equals(buddyId));
    await me.save({ validateModifiedOnly: true });

    const buddy = await User.findById(buddyId);
    if (buddy) {
      buddy.buddies = buddy.buddies.filter((id) => !id.equals(me._id));
      await buddy.save({ validateModifiedOnly: true });
    }

    res.status(200).json({ success: true, message: 'Buddy removed' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Lookup user by uniqueId (public-facing info only)
 * @route   GET /api/v1/user/lookup/:uniqueId
 * @access  Private
 */
const lookupUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ uniqueId: req.params.uniqueId }).select(
      'name uniqueId avatar role'
    );
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  linkChild,
  unlinkChild,
  addStudent,
  removeStudent,
  addBuddy,
  removeBuddy,
  lookupUser,
};
