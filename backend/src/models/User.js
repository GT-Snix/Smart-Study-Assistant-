const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUniqueId } = require('../utils/uniqueId');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent'],
      required: [true, 'Role is required'],
    },
    uniqueId: {
      type: String,
      unique: true,
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },

    // ── Relationships ──
    // Parent → children (student user IDs)
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Teacher → students (student user IDs)
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Student → buddies (other student user IDs)
    buddies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups
userSchema.index({ email: 1 });
userSchema.index({ uniqueId: 1 });

// Generate uniqueId before saving (if new)
userSchema.pre('save', async function (next) {
  // Generate unique ID for new users
  if (this.isNew && !this.uniqueId) {
    // Keep generating until we get a unique one
    let id;
    let exists = true;
    while (exists) {
      id = generateUniqueId();
      exists = await mongoose.model('User').findOne({ uniqueId: id });
    }
    this.uniqueId = id;
  }

  // Generate avatar from name
  if (this.isNew || this.isModified('name')) {
    this.avatar = this.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = mongoose.model('User', userSchema);
