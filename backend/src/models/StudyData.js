const mongoose = require('mongoose');

const studyDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: { type: String, default: '' },
    chapter: { type: String, default: '' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    noteStyle: { type: String, default: 'concise' },
    examDate: { type: String, default: '' },
    hoursPerDay: { type: Number, default: 2 },
    subtopics: [String],

    // Generated content
    notes: { type: String, default: '' },
    flashcards: { type: mongoose.Schema.Types.Mixed, default: [] },
    planner: { type: mongoose.Schema.Types.Mixed, default: [] },
    quizQuestions: { type: mongoose.Schema.Types.Mixed, default: [] },

    // Progress
    scores: [Number],
    cardsStudied: { type: Number, default: 0 },
    bookmarked: [Number],
    weakTopics: { type: mongoose.Schema.Types.Mixed, default: {} },
    studyHeatmap: { type: mongoose.Schema.Types.Mixed, default: {} },
    streak: { type: Number, default: 0 },
    ratings: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Pomodoro
    pomoSessions: { type: Number, default: 0 },

    // Buddy challenge history
    challengeHistory: { type: mongoose.Schema.Types.Mixed, default: [] },
    studySessions: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

studyDataSchema.index({ userId: 1 });

module.exports = mongoose.model('StudyData', studyDataSchema);
