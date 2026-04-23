const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: [true, 'Title is required'] },
    subject: { type: String, required: [true, 'Subject is required'] },
    content: { type: String, default: '' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'overdue', 'completed'],
      default: 'upcoming',
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    submissions: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        submittedAt: { type: Date, default: Date.now },
        score: Number,
        content: String,
      },
    ],
  },
  { timestamps: true }
);

assignmentSchema.index({ teacherId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
