const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    totalScore: { type: Number, default: 0 },
    quizCount: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    weakTopics: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

reportSchema.index({ studentId: 1 });

module.exports = mongoose.model('Report', reportSchema);
