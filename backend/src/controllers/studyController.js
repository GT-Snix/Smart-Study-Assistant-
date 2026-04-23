const StudyData = require('../models/StudyData');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');

/**
 * @desc    Get current user's study data
 * @route   GET /api/v1/study
 * @access  Private (student only)
 */
const getStudyData = async (req, res, next) => {
  try {
    let data = await StudyData.findOne({ userId: req.user._id });
    if (!data) {
      data = await StudyData.create({ userId: req.user._id });
    }
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update study data (partial update)
 * @route   PUT /api/v1/study
 * @access  Private (student only)
 */
const updateStudyData = async (req, res, next) => {
  try {
    let data = await StudyData.findOne({ userId: req.user._id });
    if (!data) {
      data = await StudyData.create({ userId: req.user._id, ...req.body });
    } else {
      Object.assign(data, req.body);
      await data.save();
    }

    // If scores were updated, refresh the report
    if (req.body.scores !== undefined || req.body.weakTopics !== undefined || req.body.streak !== undefined) {
      await updateReport(req.user._id, data);
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a quiz score and update report
 * @route   POST /api/v1/study/score
 * @access  Private (student only)
 */
const addScore = async (req, res, next) => {
  try {
    const { score, weakTopics } = req.body;
    if (score === undefined) return next(new AppError('Score is required', 400));

    let data = await StudyData.findOne({ userId: req.user._id });
    if (!data) data = await StudyData.create({ userId: req.user._id });

    data.scores = [...(data.scores || []), score].slice(-50);

    // Update heatmap
    const today = new Date().toISOString().split('T')[0];
    const heatmap = data.studyHeatmap || {};
    heatmap[today] = (heatmap[today] || 0) + 1;
    data.studyHeatmap = heatmap;

    // Update weak topics
    if (weakTopics && typeof weakTopics === 'object') {
      const wt = data.weakTopics || {};
      for (const [topic, count] of Object.entries(weakTopics)) {
        wt[topic] = (wt[topic] || 0) + count;
      }
      data.weakTopics = wt;
    }

    data.markModified('scores');
    data.markModified('studyHeatmap');
    data.markModified('weakTopics');
    await data.save();

    await updateReport(req.user._id, data);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Helper: update Report doc from StudyData
const updateReport = async (userId, studyData) => {
  const scores = studyData.scores || [];
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const quizCount = scores.length;
  const avgScore = quizCount > 0 ? Math.round(totalScore / quizCount) : 0;

  await Report.findOneAndUpdate(
    { studentId: userId },
    {
      totalScore,
      quizCount,
      avgScore,
      streak: studyData.streak || 0,
      weakTopics: studyData.weakTopics || {},
      lastActive: new Date(),
    },
    { upsert: true, new: true }
  );
};

module.exports = { getStudyData, updateStudyData, addScore };
