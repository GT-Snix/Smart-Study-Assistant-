import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Zap, Brain, RefreshCw, ChevronRight } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import useAI from '../../hooks/useAI';
import useQuiz from '../../hooks/useQuiz';
import { parseJSON } from '../../utils/parseAI';
import QuizQuestion from '../../components/quiz/QuizQuestion';
import QuizResults from '../../components/quiz/QuizResults';
import SpeedTimer from '../../components/quiz/SpeedTimer';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import Loader from '../../components/ui/Loader';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const scoreColor = (s) =>
  s >= 80 ? 'text-success border-success/30' : s >= 60 ? 'text-accent border-accent/30' : 'text-danger border-danger/30';

const Quiz = () => {
  const store = useAppStore();
  const { generate, loading } = useAI();
  const { quizState, currentQuestion, quizQuestions, scorePercent, startQuiz, answer, resetQuiz, nextQuestion } = useQuiz();
  const [feedback, setFeedback] = useState('');
  const [timedOut, setTimedOut] = useState(false);
  const [weakList, setWeakList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleGenerate = async () => {
    if (!store.subject) { toast.error('Setup your subject first.'); return; }
    const text = await generate(
      `Generate 10 multiple-choice questions for "${store.chapter || store.subject}" at ${store.level} level.\nReturn ONLY a JSON array: [{"q":"...","options":["A...","B...","C...","D..."],"answer":"A|B|C|D","topic":"...","difficulty":"easy|medium|hard","explanation":"..."}]`,
      '', 'quiz'
    );
    const q = parseJSON(text, []);
    if (q.length) { store.setQuizQuestions(q); toast.success('Questions ready!'); }
    else toast.error('Could not parse questions.');
  };

  const handleStart = (mode) => {
    setFeedback(''); setTimedOut(false); setWeakList([]); setFeedbackLoading(false);
    startQuiz(mode);
  };

  const handleAnswer = async (key) => {
    if (timedOut) return;
    answer(key);

    // Check if this was the last question — read fresh state
    const freshState = useAppStore.getState().quizState;
    if (freshState?.finished) {
      // Compute fresh score from store
      const freshScores = useAppStore.getState().scores;
      const latestScore = freshScores[freshScores.length - 1] || 0;
      const weak = Object.entries(useAppStore.getState().weakTopics).sort(([,a],[,b]) => b - a).slice(0, 3).map(([t]) => t);
      setWeakList(weak);
      setFeedbackLoading(true);
      const fb = await generate(
        `The student just scored ${latestScore}% on a ${store.subject} quiz about ${store.chapter}. Weak topics: ${weak.join(', ') || 'none'}. Give 2-3 sentences of encouraging, personalized feedback.`,
        'You are a helpful study coach. Be concise and positive.', 'feedback'
      );
      setFeedback(fb);
      setFeedbackLoading(false);
    }
  };

  const handleTimeout = () => {
    setTimedOut(true);
    if (currentQuestion) answer('__timeout__');
  };

  const handleNext = useCallback(() => {
    setTimedOut(false);
    nextQuestion();
  }, [nextQuestion]);

  if (loading && !quizState) return <Loader text="Generating quiz questions…" />;

  // Landing: no questions loaded
  if (!quizState && !quizQuestions.length) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
        <h1 className="text-3xl font-bold font-display text-white">Quiz</h1>
        <div className="card text-center py-12 space-y-4">
          <Brain size={48} className="mx-auto text-accent" />
          <p className="text-gray-400">No questions loaded. Generate them first.</p>
          <Button onClick={handleGenerate} loading={loading}>Generate Questions</Button>
        </div>
        {store.scores.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Attempts</h2>
            <div className="flex flex-wrap gap-2">
              {store.scores.slice(-10).map((s, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-sm font-bold border ${scoreColor(s)}`}>{s}%</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Mode selection: questions loaded but quiz not started
  if (!quizState) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-display text-white">Quiz</h1>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleGenerate} loading={loading}>New Questions</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <motion.div whileHover={{ scale: 1.02 }} onClick={() => handleStart('standard')}
            className="card cursor-pointer hover:border-accent/40 transition-all text-center py-10 space-y-3">
            <Brain size={36} className="mx-auto text-accent" />
            <h2 className="text-lg font-bold text-white">Standard Quiz</h2>
            <p className="text-sm text-gray-400">Answer at your own pace · See explanations</p>
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm rounded-full">{quizQuestions.length} questions</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} onClick={() => handleStart('speed')}
            className="card cursor-pointer hover:border-teal/40 transition-all text-center py-10 space-y-3 border-teal/20">
            <Zap size={36} className="mx-auto text-teal" />
            <h2 className="text-lg font-bold text-white">Speed Round</h2>
            <p className="text-sm text-gray-400">15 seconds per question · Test your reaction</p>
            <span className="inline-block px-4 py-1.5 bg-teal/10 text-teal text-sm rounded-full">Timed Mode</span>
          </motion.div>
        </div>
        {store.scores.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Scores</h2>
            <div className="flex flex-wrap gap-2">
              {store.scores.slice(-10).map((s, i) => (
                <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreColor(s)}`}>{s}%</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Results screen
  if (quizState.finished) {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
        <h1 className="text-3xl font-bold font-display text-white">Quiz Results</h1>
        <QuizResults
          scorePercent={scorePercent}
          score={quizState.score}
          total={quizQuestions.length}
          feedback={feedbackLoading ? 'Generating feedback…' : feedback}
          weakTopics={weakList}
          onRetry={() => handleStart(quizState.mode)}
          onReset={resetQuiz}
        />
      </motion.div>
    );
  }

  // Active quiz
  const current = quizState.current;
  const answered = quizState.answered[current];
  const isLast = current >= quizQuestions.length - 1;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-white">
          Question {current + 1} <span className="text-gray-500 text-lg">/ {quizQuestions.length}</span>
        </h1>
        {quizState.mode === 'speed' && (
          <SpeedTimer duration={15} active={!answered} onTimeout={handleTimeout} key={current} />
        )}
      </div>
      <ProgressBar value={current + 1} max={quizQuestions.length} color="accent" height="h-1.5" />
      <div className="card">
        <QuizQuestion question={currentQuestion} onAnswer={handleAnswer} answered={answered} mode={quizState.mode} />
      </div>
      {/* ── Next / Finish button after answering ── */}
      {answered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {isLast ? (
            <Button onClick={() => answer('__force_finish__')} icon={ChevronRight} fullWidth className="hidden">
              See Results
            </Button>
          ) : (
            <Button onClick={handleNext} icon={ChevronRight} fullWidth>
              Next Question
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Quiz;
