const Joi = require('joi');

const linkChildSchema = Joi.object({
  identifier: Joi.string().trim().required().messages({
    'string.empty': 'Child email or uniqueId is required',
  }),
});

const addStudentSchema = Joi.object({
  identifier: Joi.string().trim().required().messages({
    'string.empty': 'Student email or uniqueId is required',
  }),
});

const addBuddySchema = Joi.object({
  identifier: Joi.string().trim().required().messages({
    'string.empty': 'Buddy email or uniqueId is required',
  }),
});

const assignmentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  subject: Joi.string().trim().min(1).max(100).required(),
  content: Joi.string().allow('').max(5000).default(''),
  dueDate: Joi.date().iso().allow(null, ''),
  studentIds: Joi.array().items(Joi.string()).default([]),
});

const studyDataSchema = Joi.object({
  subject: Joi.string().allow(''),
  chapter: Joi.string().allow(''),
  level: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  noteStyle: Joi.string().allow(''),
  examDate: Joi.string().allow(''),
  hoursPerDay: Joi.number().min(1).max(16),
  subtopics: Joi.array().items(Joi.string()),
  notes: Joi.string().allow(''),
  flashcards: Joi.any(),
  planner: Joi.any(),
  quizQuestions: Joi.any(),
  scores: Joi.array().items(Joi.number()),
  cardsStudied: Joi.number(),
  bookmarked: Joi.array().items(Joi.number()),
  weakTopics: Joi.object().pattern(Joi.string(), Joi.number()),
  studyHeatmap: Joi.object().pattern(Joi.string(), Joi.number()),
  streak: Joi.number(),
  ratings: Joi.any(),
  pomoSessions: Joi.number(),
  challengeHistory: Joi.any(),
  studySessions: Joi.any(),
}).min(1);

const aiGenerateSchema = Joi.object({
  prompt: Joi.string().trim().min(5).max(5000).required(),
  system: Joi.string().allow('').max(2000).default(''),
  taskType: Joi.string().valid('notes', 'flashcards', 'planner', 'quiz', 'general').default('general'),
});

module.exports = {
  linkChildSchema,
  addStudentSchema,
  addBuddySchema,
  assignmentSchema,
  studyDataSchema,
  aiGenerateSchema,
};
