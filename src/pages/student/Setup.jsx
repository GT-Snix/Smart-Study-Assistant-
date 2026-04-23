import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Sparkles, ChevronRight, BookOpen, Calendar, Clock, Layers, Copy, UserCircle2 } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import useAI from '../../hooks/useAI';
import { parseJSON } from '../../utils/parseAI';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const TEMPLATES = [
  'Photosynthesis', 'French Revolution', 'Quadratic Equations',
  'Newton\'s Laws', 'DNA Replication', 'World War II',
  'Trigonometry', 'Periodic Table', 'The Great Gatsby', 'Thermodynamics',
];

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const NOTE_STYLES = ['concise', 'detailed', 'bullet', 'narrative'];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Setup = () => {
  const store = useAppStore();
  const { generate, loading } = useAI();
  const navigate = useNavigate();
  const [localSubtopics, setLocalSubtopics] = useState(store.subtopics.join(', '));
  const [userName, setUserName] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  // Auto-init user on mount if not already created
  useEffect(() => {
    if (!store.currentUser) {
      setShowProfile(true);
    }
  }, [store.currentUser]);

  const handleCreateProfile = () => {
    if (!userName.trim()) { toast.error('Please enter your name.'); return; }
    const user = store.initUser(userName.trim());
    toast.success(`Welcome, ${user.name}! Your ID is ${user.uniqueId}`);
    setShowProfile(false);
  };

  const copyUniqueId = () => {
    if (store.currentUser?.uniqueId) {
      navigator.clipboard.writeText(store.currentUser.uniqueId);
      toast.success('Unique ID copied!');
    }
  };

  const handleGenerate = async () => {
    if (!store.subject || !store.chapter) {
      toast.error('Please enter a subject and chapter name.');
      return;
    }
    const apiKey = store.apiKey || localStorage.getItem('or_key');
    if (!apiKey) {
      toast.error('API key is missing! Please add it in Settings.');
      return;
    }
    const subtopicsArr = localSubtopics.split(',').map((s) => s.trim()).filter(Boolean);
    store.setSubtopics(subtopicsArr);

    toast.loading('Generating your study content…', { id: 'gen' });
    try {
      // Parallel AI calls
      const [notesText, flashcardsText, plannerText, quizText] = await Promise.all([
        generate(
          `Generate structured ${store.noteStyle} study notes for:\nSubject: ${store.subject}\nChapter: ${store.chapter}\nLevel: ${store.level}\nSubtopics: ${subtopicsArr.join(', ') || 'all main topics'}\n\nFormat as markdown with ## headings, bullet points, key terms bolded.`,
          '', 'notes'
        ),
        generate(
          `Generate exactly 12 flashcards for "${store.chapter}" in ${store.subject} at ${store.level} level.\nReturn ONLY a JSON array: [{"q":"...","a":"...","hint":"...","topic":"...","difficulty":"easy|medium|hard"}]`,
          '', 'flashcards'
        ),
        generate(
          `Create a study planner from today for "${store.chapter}" exam on ${store.examDate || 'in 14 days'}. ${store.hoursPerDay} hours/day.\nReturn ONLY a JSON array: [{"day":1,"date":"YYYY-MM-DD","topics":["..."],"hours":2,"focus":"...","type":"study|revision|practice|rest","done":false}]`,
          '', 'planner'
        ),
        generate(
          `Generate 10 multiple-choice questions for "${store.chapter}" in ${store.subject} at ${store.level} level.\nReturn ONLY a JSON array: [{"q":"...","options":["A...","B...","C...","D..."],"answer":"A|B|C|D","topic":"...","difficulty":"easy|medium|hard","explanation":"..."}]`,
          '', 'quiz'
        ),
      ]);

      store.setNotes(notesText || '# Notes\nCould not generate notes. Try again.');
      store.setFlashcards(parseJSON(flashcardsText, []).map((c, i) => ({ ...c, id: i })));
      store.setPlanner(parseJSON(plannerText, []));
      store.setQuizQuestions(parseJSON(quizText, []));

      toast.success('Study content ready!', { id: 'gen' });
      navigate('/student/notes');
    } catch (e) {
      toast.error(e.message || 'Generation failed', { id: 'gen' });
    }
  };

  // ── Profile creation overlay ──
  if (showProfile && !store.currentUser) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-md mx-auto">
        <div className="text-center">
          <UserCircle2 size={56} className="mx-auto text-accent mb-4" />
          <h1 className="text-3xl font-bold font-display text-white">Welcome!</h1>
          <p className="text-gray-400 mt-2 text-sm">Create your profile to get started. You'll receive a unique 6-character ID to share with teachers, parents, and buddies.</p>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="label">Your Name *</label>
            <input
              className="input"
              placeholder="e.g. John Doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
            />
          </div>
          <Button fullWidth onClick={handleCreateProfile} icon={Sparkles}>Create My Profile</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Study Setup</h1>
        <p className="text-gray-400 mt-1 text-sm">Configure your study session and let AI generate everything</p>
      </div>

      {/* User ID card */}
      {store.currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-accent/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 ring-1 ring-accent/30 flex items-center justify-center text-sm font-bold text-accent">
              {store.currentUser.avatar}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{store.currentUser.name}</p>
              <p className="text-gray-500 text-[10px] font-mono">ID: {store.currentUser.uniqueId}</p>
            </div>
          </div>
          <button
            onClick={copyUniqueId}
            className="flex items-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium rounded-xl border border-accent/20 transition-all"
          >
            <Copy size={12} /> Copy ID
          </button>
        </motion.div>
      )}

      {/* Current summary */}
      {store.subject && (
        <div className="card flex flex-wrap gap-3 items-center">
          <Badge variant="accent"><BookOpen size={11} /> {store.subject}</Badge>
          <Badge variant="purple">{store.chapter}</Badge>
          <Badge variant="ghost">{store.level}</Badge>
          {store.examDate && <Badge variant="teal"><Calendar size={11} /> {store.examDate}</Badge>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Subject Details</h2>
            <div>
              <label className="label">Subject *</label>
              <input className="input" placeholder="e.g. Biology, Mathematics" value={store.subject} onChange={(e) => store.setSubject(e.target.value)} />
            </div>
            <div>
              <label className="label">Chapter / Topic *</label>
              <input className="input" placeholder="e.g. Chapter 5: Genetics" value={store.chapter} onChange={(e) => store.setChapter(e.target.value)} />
            </div>
            <div>
              <label className="label">Subtopics (comma-separated)</label>
              <input className="input" placeholder="e.g. Mitosis, Meiosis, DNA" value={localSubtopics} onChange={(e) => setLocalSubtopics(e.target.value)} />
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Schedule</h2>
            <div>
              <label className="label">Exam Date</label>
              <input
                type="date" className="input"
                value={store.examDate}
                onChange={(e) => store.setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="label">Hours per Day: <span className="text-accent font-bold">{store.hoursPerDay}h</span></label>
              <input type="range" min={1} max={10} value={store.hoursPerDay}
                onChange={(e) => store.setHoursPerDay(Number(e.target.value))}
                className="w-full accent-yellow-400 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Learning Preferences</h2>
            <div>
              <label className="label">Level</label>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button key={l} onClick={() => store.setLevel(l)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${store.level === l ? 'bg-accent/10 border-accent text-accent' : 'border-border text-gray-400 hover:border-gray-500'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Note Style</label>
              <div className="grid grid-cols-2 gap-2">
                {NOTE_STYLES.map((s) => (
                  <button key={s} onClick={() => store.setNoteStyle(s)}
                    className={`py-2 rounded-xl border text-sm font-medium capitalize transition-all ${store.noteStyle === s ? 'bg-purple/10 border-purple text-purple' : 'border-border text-gray-400 hover:border-gray-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick templates */}
          <div className="card space-y-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Quick Templates</h2>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button key={t} onClick={() => { store.setChapter(t); }}
                  className="px-3 py-1.5 bg-surface2 rounded-lg border border-border text-xs text-gray-400 hover:text-accent hover:border-accent/40 transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleGenerate} loading={loading} size="lg" icon={Sparkles} className="w-full sm:w-auto">
        Generate All Study Content
      </Button>
    </motion.div>
  );
};

export default Setup;
