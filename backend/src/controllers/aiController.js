const { callOpenRouter } = require('../services/aiService');
const AppError = require('../utils/AppError');

/**
 * @desc    Generate AI content (notes, flashcards, quiz, planner)
 * @route   POST /api/v1/study/generate
 * @access  Private
 */
const generateContent = async (req, res, next) => {
  try {
    const { prompt, system, taskType } = req.body;

    // Get subject from study data context if available
    const subject = req.body.subject || '';

    const result = await callOpenRouter(req, prompt, system, taskType, subject);

    res.status(200).json({
      success: true,
      data: {
        text: result.text,
        model: result.model,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get leaderboard (top students by total score)
 * @route   GET /api/v1/study/leaderboard
 * @access  Private
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const Report = require('../models/Report');
    const User = require('../models/User');

    const reports = await Report.find({ quizCount: { $gt: 0 } })
      .sort('-totalScore')
      .limit(50)
      .lean();

    const leaderboard = await Promise.all(
      reports.map(async (report) => {
        const user = await User.findById(report.studentId).select('name uniqueId avatar');
        return {
          _id: report.studentId,
          name: user?.name || 'Unknown',
          uniqueId: user?.uniqueId || '',
          avatar: user?.avatar || '??',
          totalScore: report.totalScore,
          avgScore: report.avgScore,
          quizCount: report.quizCount,
          streak: report.streak,
          isYou: report.studentId.equals(req.user._id),
        };
      })
    );

    res.status(200).json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateContent, getLeaderboard };
