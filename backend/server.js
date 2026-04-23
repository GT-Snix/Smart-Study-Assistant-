const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const studyRoutes = require('./src/routes/studyRoutes');
const teacherRoutes = require('./src/routes/teacherRoutes');
const parentRoutes = require('./src/routes/parentRoutes');

// ── Connect Database ──
connectDB();

const app = express();

// ── Security Middleware ──
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  })
);

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Body Parser ──
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'MINXY API is running', timestamp: new Date().toISOString() });
});

// ── Mount Routes ──
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/study', studyRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/parent', parentRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──
app.use(errorHandler);

// ── Start Server ──
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 MINXY server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
