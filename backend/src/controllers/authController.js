const User = require('../models/User');
const StudyData = require('../models/StudyData');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists', 400));
    }

    // Create user (password hashed & uniqueId generated in pre-save hook)
    const user = await User.create({ name, email, password, role });

    // Create empty StudyData doc for students
    if (role === 'student') {
      await StudyData.create({ userId: user._id });
      await Report.create({ studentId: user._id });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('children', 'name email uniqueId avatar role')
      .populate('students', 'name email uniqueId avatar role')
      .populate('buddies', 'name email uniqueId avatar role');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// Helper: create token and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  // Never return password
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: userData,
  });
};

module.exports = { register, login, getMe };
