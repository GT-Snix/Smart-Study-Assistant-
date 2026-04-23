import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, Trophy, Brain, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';
import useAI from '../../hooks/useAI';
import { parseJSON } from '../../utils/parseAI';
import { isValidUniqueId } from '../../utils/uniqueId';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Loader from '../../components/ui/Loader';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];
const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const QuizChallenge = () => {
  const store = useAppStore();
  const { generate, loading } = useAI();

  // Challenge setup
  const [buddyId, setBuddyId] = useState('');
  const [subject, setSubject] = useState('');

  // Challenge state
  const [phase, setPhase] = useState('setup'); // setup | playing | results
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [myAnswers, setMyAnswers] = useState([]);
  const [myScore, setMyScore] = useState(0);
  const [simulatedScore, setSimulatedScore] = useState(0);
  const [buddyName, setBuddyName] = useState('');
  const [timer, setTimer] = useState(15);
  const [answered, setAnswered] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing' || answered) return;
    if (timer <= 0) { handleAnswer('__timeout__'); return; }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [phase, timer, answered]);

  const handleStartChallenge = async () => {
    if (!buddyId.trim()) { toast.error('Enter your buddy\'s unique ID.'); return; }
    if (!isValidUniqueId(buddyId.trim())) {
      toast.error('Invalid ID. Must be 6 characters (letters + numbers + special chars).');
      return;
    }
    if (!subject.trim()) { toast.error('Enter a subject for the challenge.'); return; }

    // Lookup buddy
    const registry = store.userRegistry;
    const buddy = registry[buddyId.trim()];
    setBuddyName(buddy?.name || 'Buddy');

    toast.loading('Generating challenge questions...', { id: 'chal' });
    const text = await generate(
      `Generate 5 multiple-choice questions about "${subject}" at intermediate level for a quick quiz challenge.\nReturn ONLY a JSON array: [{"q":"...","options":["A...","B...","C...","D..."],"answer":"A|B|C|D","topic":"...","explanation":"..."}]`,
      '', 'quiz'
    );
    const qs = parseJSON(text, []);
    if (qs.length < 2) { toast.error('Could not generate questions. Try again.', { id: 'chal' }); return; }

    setQuestions(qs);
    setCurrentQ(0);
    setMyAnswers([]);
    setMyScore(0);
    setSimulatedScore(0);
    setTimer(15);
    setAnswered(false);
    setPhase('playing');
    toast.success('Challenge started!', { id: 'chal' });
  };

  const handleAnswer = useCallback((key) => {
    if (answered) return;
    setAnswered(true);
    const q = questions[currentQ];
    const correct = key === q.answer;
    const newScore = correct ? myScore + 1 : myScore;
    setMyScore(newScore);
    setMyAnswers((prev) => [...prev, { selected: key, correct }]);

    // Simulate buddy answer (60-80% accuracy)
    const buddyCorrect = Math.random() > 0.3;
    if (buddyCorrect) setSimulatedScore((s) => s + 1);

    // Auto-advance after 1.5s
    setTimeout(() => {
      if (currentQ >= questions.length - 1) {
        // Finish
        const finalMyPct = Math.round((newScore / questions.length) * 100);
        const finalBuddyPct = Math.round(((buddyCorrect ? simulatedScore + 1 : simulatedScore) / questions.length) * 100);
        store.addChallengeResult({
          opponentId: buddyId.trim(),
          opponentName: buddyName,
          subject,
          myScore: finalMyPct,
          theirScore: finalBuddyPct,
        });
        setPhase('results');
      } else {
        setCurrentQ((c) => c + 1);
        setTimer(15);
        setAnswered(false);
      }
    }, 1200);
  }, [answered, currentQ, questions, myScore, simulatedScore, buddyId, buddyName, subject, store]);

  // ── Setup Phase ──
  if (phase === 'setup') {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Quiz Challenge</h1>
          <p className="text-gray-400 text-sm mt-1">Challenge a buddy by entering their unique ID</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2"><Send size={14} /> New Challenge</h2>
            <div>
              <label className="label">Buddy's Unique ID *</label>
              <input className="input font-mono text-center text-lg tracking-widest" maxLength={6}
                value={buddyId} onChange={(e) => setBuddyId(e.target.value)} placeholder="e.g. k3$Af9" />
            </div>
            <div>
              <label className="label">Subject/Topic *</label>
              <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Chapter 5 Physics" />
            </div>
            <Button fullWidth icon={Zap} onClick={handleStartChallenge} loading={loading}>Start Challenge</Button>
          </div>

          {/* Challenge history */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2"><Trophy size={14} /> Past Challenges</h2>
            {store.challengeHistory.length > 0 ? (
              store.challengeHistory.slice(-5).reverse().map((c) => (
                <div key={c.id} className="p-3 bg-surface2 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium">vs. {c.opponentName}</p>
                    <Badge variant={c.myScore > c.theirScore ? 'success' : c.myScore < c.theirScore ? 'danger' : 'ghost'}>
                      {c.myScore > c.theirScore ? 'Won' : c.myScore < c.theirScore ? 'Lost' : 'Draw'}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs">{c.subject} · You: {c.myScore}% vs {c.theirScore}%</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs">No challenges yet. Start one!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Playing Phase ──
  if (phase === 'playing') {
    const q = questions[currentQ];
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display text-white">
            Q{currentQ + 1} <span className="text-gray-500 text-lg">/ {questions.length}</span>
          </h1>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${timer <= 5 ? 'text-danger border-danger/30 bg-danger/5' : 'text-teal border-teal/30 bg-teal/5'}`}>
            <Clock size={14} /> {timer}s
          </div>
        </div>

        <ProgressBar value={currentQ + 1} max={questions.length} color="accent" height="h-1.5" />

        {/* Side-by-side score */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center py-3 border-accent/20">
            <p className="text-xs text-gray-500">You</p>
            <p className="text-2xl font-bold text-accent">{myScore}</p>
          </div>
          <div className="card text-center py-3 border-purple/20">
            <p className="text-xs text-gray-500">{buddyName}</p>
            <p className="text-2xl font-bold text-purple">{simulatedScore}</p>
          </div>
        </div>

        <div className="card space-y-4">
          <p className="text-lg font-medium text-white leading-relaxed">{q?.q}</p>
          <div className="grid gap-3">
            {q?.options?.map((opt, i) => {
              const key = OPTION_KEYS[i];
              const isSelected = myAnswers[currentQ]?.selected === key;
              const isCorrect = key === q.answer;
              let style = 'bg-surface2 border-border text-gray-300 hover:border-accent/50';
              if (answered) {
                if (isCorrect) style = 'bg-success/10 border-success text-success';
                else if (isSelected && !myAnswers[currentQ]?.correct) style = 'bg-danger/10 border-danger text-danger';
                else style = 'bg-surface2 border-border text-gray-500 opacity-50';
              }
              return (
                <button key={key} disabled={answered} onClick={() => handleAnswer(key)}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border text-left text-sm font-medium transition-all ${style}`}>
                  <span className="w-7 h-7 rounded-lg border border-current flex items-center justify-center text-xs font-bold shrink-0">{key}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Results Phase ──
  const finalMyPct = Math.round((myScore / questions.length) * 100);
  const finalBuddyPct = Math.round((simulatedScore / questions.length) * 100);
  const won = finalMyPct > finalBuddyPct;
  const draw = finalMyPct === finalBuddyPct;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold font-display text-white text-center">Challenge Results</h1>

      <div className="card text-center py-8 space-y-4">
        <p className="text-5xl">{draw ? '🤝' : won ? '🏆' : '😤'}</p>
        <p className={`text-2xl font-bold font-display ${draw ? 'text-accent' : won ? 'text-success' : 'text-danger'}`}>
          {draw ? 'It\'s a Draw!' : won ? 'You Won!' : 'You Lost!'}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
            <p className="text-xs text-gray-500 mb-1">You</p>
            <p className="text-3xl font-bold text-accent">{finalMyPct}%</p>
            <p className="text-xs text-gray-500">{myScore}/{questions.length}</p>
          </div>
          <div className="p-4 bg-purple/5 rounded-xl border border-purple/20">
            <p className="text-xs text-gray-500 mb-1">{buddyName}</p>
            <p className="text-3xl font-bold text-purple">{finalBuddyPct}%</p>
            <p className="text-xs text-gray-500">{simulatedScore}/{questions.length}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" fullWidth onClick={() => { setPhase('setup'); setBuddyId(''); setSubject(''); }}>New Challenge</Button>
        <Button fullWidth onClick={() => { setPhase('playing'); setCurrentQ(0); setMyAnswers([]); setMyScore(0); setSimulatedScore(0); setTimer(15); setAnswered(false); }}>Rematch</Button>
      </div>
    </motion.div>
  );
};

export default QuizChallenge;
