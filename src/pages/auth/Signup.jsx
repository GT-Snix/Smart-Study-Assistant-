import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, GraduationCap, BookOpen, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';

const ROLES = [
  {
    value: 'student',
    label: 'Student',
    desc: 'Study with AI, take quizzes, and connect with buddies',
    icon: GraduationCap,
    emoji: '🎓',
  },
  {
    value: 'teacher',
    label: 'Teacher',
    desc: 'Track students, create assignments, and share resources',
    icon: BookOpen,
    emoji: '📚',
  },
  {
    value: 'parent',
    label: 'Parent',
    desc: 'Monitor your child\'s progress and set reminders',
    icon: Users,
    emoji: '👤',
  },
];

const Signup = () => {
  const { register, authLoading } = useAppStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (!form.role) {
      toast.error('Please select your role');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const result = await register(form.name, form.email, form.password, form.role);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Account created! Welcome to MINXY!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 ring-1 ring-accent/30 flex items-center justify-center text-3xl mx-auto mb-4">
            🧠
          </div>
          <h1 className="text-3xl font-bold font-display text-white">Join MINXY</h1>
          <p className="text-gray-400 text-sm mt-2">Create your account and start learning smarter</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="label">I am a...</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${
                    form.role === r.value
                      ? 'bg-accent/10 border-accent ring-1 ring-accent/30 text-accent'
                      : 'border-border text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="font-semibold text-sm">{r.label}</span>
                  <span className="text-[10px] leading-tight opacity-70">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-accent text-bg rounded-xl font-semibold text-sm hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <span className="animate-spin w-4 h-4 border-2 border-bg border-t-transparent rounded-full" />
            ) : (
              <UserPlus size={16} />
            )}
            {authLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
