const User = require('../models/User');
const Report = require('../models/Report');
const StudyData = require('../models/StudyData');
const AppError = require('../utils/AppError');

/**
 * @desc    Get progress for linked children
 * @route   GET /api/v1/child-progress
 * @access  Private (parent only)
 */
const getChildProgress = async (req, res, next) => {
  try {
    const parent = await User.findById(req.user._id).populate(
      'children',
      'name email uniqueId avatar'
    );

    const childData = await Promise.all(
      parent.children.map(async (child) => {
        const report = await Report.findOne({ studentId: child._id });
        return {
          _id: child._id,
          name: child.name,
          email: child.email,
          uniqueId: child.uniqueId,
          avatar: child.avatar,
          totalScore: report?.totalScore || 0,
          quizCount: report?.quizCount || 0,
          avgScore: report?.avgScore || 0,
          streak: report?.streak || 0,
          weakTopics: report?.weakTopics || {},
          lastActive: report?.lastActive || null,
        };
      })
    );

    res.status(200).json({ success: true, count: childData.length, data: childData });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get detailed study data for a specific child
 * @route   GET /api/v1/child-progress/:childId
 * @access  Private (parent only, must be linked)
 */
const getChildDetail = async (req, res, next) => {
  try {
    const parent = req.user;
    const childId = req.params.childId;

    // Data-level security: child must be linked
    if (!parent.children.some((id) => id.equals(childId))) {
      return next(new AppError('This child is not linked to your account', 403));
    }

    const child = await User.findById(childId).select('name uniqueId avatar');
    const studyData = await StudyData.findOne({ userId: childId });
    const report = await Report.findOne({ studentId: childId });

    res.status(200).json({
      success: true,
      data: {
        child,
        studyData: studyData
          ? {
              subject: studyData.subject,
              chapter: studyData.chapter,
              scores: studyData.scores,
              studyHeatmap: studyData.studyHeatmap,
              streak: studyData.streak,
              cardsStudied: studyData.cardsStudied,
              pomoSessions: studyData.pomoSessions,
            }
          : null,
        report,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getChildProgress, getChildDetail };
