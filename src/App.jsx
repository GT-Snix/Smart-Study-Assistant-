import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

import Layout from './components/layout/Layout';
import ProtectedRoute, { getHomeRoute } from './components/auth/ProtectedRoute';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import useAppStore from './store/useAppStore';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Student Pages
import Setup      from './pages/student/Setup';
import Notes      from './pages/student/Notes';
import Flashcards from './pages/student/Flashcards';
import Planner    from './pages/student/Planner';
import Quiz       from './pages/student/Quiz';
import Pomodoro   from './pages/student/Pomodoro';
import Progress   from './pages/student/Progress';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import Assignments      from './pages/teacher/Assignments';
import QuestionBank     from './pages/teacher/QuestionBank';
import StudentReports   from './pages/teacher/StudentReports';
import SharedNotes      from './pages/teacher/SharedNotes';

// Buddy Pages
import SharedFlashcards from './pages/buddy/SharedFlashcards';
import QuizChallenge    from './pages/buddy/QuizChallenge';
import Leaderboard      from './pages/buddy/Leaderboard';
import StudySchedule    from './pages/buddy/StudySchedule';

// Parent Pages
import Overview   from './pages/parent/Overview';
import Reports    from './pages/parent/Reports';
import Schedule   from './pages/parent/Schedule';
import Reminders  from './pages/parent/Reminders';

// ── Settings Modal ──
const SettingsModal = ({ open, onClose }) => {
  const { clearAllData, currentUser, logout } = useAppStore();
  const [apiKey, setApiKeyState] = useState(localStorage.getItem('openrouter_api_key') || '');
  const [showKey, setShowKey] = useState(false);

  const handleClearData = () => {
    if (confirm('Clear all generated content? (notes, flashcards, quiz, planner)')) {
      clearAllData();
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openrouter_api_key', apiKey.trim());
      toast.success('API Key saved successfully!');
    } else {
      localStorage.removeItem('openrouter_api_key');
      toast.success('API Key removed.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="⚙️ Settings" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* API Key */}
        <div>
          <label className="label">OpenRouter API Key</label>
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                className="input pr-10"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="sk-or-v1-..."
              />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                {showKey ? <span className="text-xs font-bold">HIDE</span> : <span className="text-xs font-bold">SHOW</span>}
              </button>
            </div>
            <Button onClick={handleSaveKey} size="sm">Save Key</Button>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Get your key at{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">openrouter.ai/keys</a>
          </p>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="p-4 bg-surface2 rounded-xl border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 ring-1 ring-accent/30 flex items-center justify-center text-sm font-bold text-accent">
                {currentUser.avatar}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{currentUser.name}</p>
                <p className="text-gray-500 text-[10px] font-mono">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-md font-medium capitalize">{currentUser.role}</span>
              <span>ID: <code className="font-mono text-gray-500">{currentUser.uniqueId}</code></span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="danger" onClick={handleClearData} icon={Trash2} size="sm">
            Clear Data
          </Button>
          <Button variant="ghost" onClick={handleLogout} size="sm">
            Log Out
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ── App ──
const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, currentUser, loadUser } = useAppStore();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // ── Auth pages (no layout) ──
  if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#16181f', color: '#e8eaf0', border: '1px solid #2e3040', borderRadius: '12px', fontSize: '13px' },
            success: { iconTheme: { primary: '#5dd97a', secondary: '#16181f' } },
            error:   { iconTheme: { primary: '#f26b6b', secondary: '#16181f' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </>
    );
  }

  // ── Not authenticated → redirect to login ──
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser?.role || 'student';

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#16181f', color: '#e8eaf0', border: '1px solid #2e3040', borderRadius: '12px', fontSize: '13px' },
          success: { iconTheme: { primary: '#5dd97a', secondary: '#16181f' } },
          error:   { iconTheme: { primary: '#f26b6b', secondary: '#16181f' } },
        }}
      />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Layout onSettings={() => setSettingsOpen(true)}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Default redirect based on role */}
            <Route index element={<Navigate to={getHomeRoute(role)} replace />} />

            {/* Student routes — accessible by students */}
            <Route path="/student/setup" element={
              <ProtectedRoute roles={['student']}><Setup /></ProtectedRoute>
            } />
            <Route path="/student/notes" element={
              <ProtectedRoute roles={['student']}><Notes /></ProtectedRoute>
            } />
            <Route path="/student/flashcards" element={
              <ProtectedRoute roles={['student']}><Flashcards /></ProtectedRoute>
            } />
            <Route path="/student/planner" element={
              <ProtectedRoute roles={['student']}><Planner /></ProtectedRoute>
            } />
            <Route path="/student/quiz" element={
              <ProtectedRoute roles={['student']}><Quiz /></ProtectedRoute>
            } />
            <Route path="/student/pomodoro" element={
              <ProtectedRoute roles={['student']}><Pomodoro /></ProtectedRoute>
            } />
            <Route path="/student/progress" element={
              <ProtectedRoute roles={['student']}><Progress /></ProtectedRoute>
            } />

            {/* Buddy routes — accessible by students */}
            <Route path="/buddy/flashcards" element={
              <ProtectedRoute roles={['student']}><SharedFlashcards /></ProtectedRoute>
            } />
            <Route path="/buddy/challenge" element={
              <ProtectedRoute roles={['student']}><QuizChallenge /></ProtectedRoute>
            } />
            <Route path="/buddy/leaderboard" element={
              <ProtectedRoute roles={['student']}><Leaderboard /></ProtectedRoute>
            } />
            <Route path="/buddy/schedule" element={
              <ProtectedRoute roles={['student']}><StudySchedule /></ProtectedRoute>
            } />

            {/* Teacher routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>
            } />
            <Route path="/teacher/assignments" element={
              <ProtectedRoute roles={['teacher']}><Assignments /></ProtectedRoute>
            } />
            <Route path="/teacher/questions" element={
              <ProtectedRoute roles={['teacher']}><QuestionBank /></ProtectedRoute>
            } />
            <Route path="/teacher/students" element={
              <ProtectedRoute roles={['teacher']}><StudentReports /></ProtectedRoute>
            } />
            <Route path="/teacher/notes" element={
              <ProtectedRoute roles={['teacher']}><SharedNotes /></ProtectedRoute>
            } />

            {/* Parent routes */}
            <Route path="/parent/overview" element={
              <ProtectedRoute roles={['parent']}><Overview /></ProtectedRoute>
            } />
            <Route path="/parent/reports" element={
              <ProtectedRoute roles={['parent']}><Reports /></ProtectedRoute>
            } />
            <Route path="/parent/schedule" element={
              <ProtectedRoute roles={['parent']}><Schedule /></ProtectedRoute>
            } />
            <Route path="/parent/reminders" element={
              <ProtectedRoute roles={['parent']}><Reminders /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={getHomeRoute(role)} replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </>
  );
};

export default App;
