import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const MEDALS = ['🥇', '🥈', '🥉'];
const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const Leaderboard = () => {
  const { leaderboard, fetchLeaderboard } = useAppStore();

  useEffect(() => { fetchLeaderboard(); }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Leaderboard</h1>
        <p className="text-gray-400 text-sm mt-1">Real rankings based on quiz performance</p>
      </div>

      {leaderboard.length > 0 ? (
        <>
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {leaderboard.slice(0, 3).map((p, i) => (
                <motion.div key={p._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`card text-center py-6 ${i === 0 ? 'ring-1 ring-accent/30' : ''} ${p.isYou ? 'border-accent/30' : ''}`}>
                  <p className="text-3xl mb-2">{MEDALS[i]}</p>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white mx-auto mb-2 ${p.isYou ? 'bg-accent/20 ring-1 ring-accent/40' : 'bg-surface2'}`}>
                    {p.avatar}
                  </div>
                  <p className={`text-xs font-semibold truncate ${p.isYou ? 'text-accent' : 'text-white'}`}>{p.isYou ? 'You' : p.name}</p>
                  <p className="text-accent font-bold mt-1">{(p.totalScore || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{p.quizCount} quizzes</p>
                </motion.div>
              ))}
            </div>
          )}

          <div className="card space-y-2">
            {leaderboard.map((p, i) => (
              <motion.div key={p._id || i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${p.isYou ? 'bg-accent/5 border border-accent/20' : 'hover:bg-surface2'}`}>
                <span className="text-lg w-8 text-center">{i < 3 ? MEDALS[i] : <span className="text-gray-500 font-mono text-sm">#{i + 1}</span>}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 ${p.isYou ? 'bg-accent/20 ring-1 ring-accent/30' : 'bg-surface2'}`}>
                  {p.avatar}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${p.isYou ? 'text-accent' : 'text-white'}`}>{p.isYou ? 'You' : p.name}</p>
                  <p className="text-xs text-gray-500">🔥 {p.streak} day streak · {p.quizCount} quizzes · Avg: {p.avgScore}%</p>
                </div>
                <p className={`font-bold font-mono ${i === 0 ? 'text-accent' : 'text-gray-300'}`}>{(p.totalScore || 0).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="card text-center py-16 text-gray-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No rankings yet</p>
          <p className="text-xs mt-1">Complete quizzes to appear on the leaderboard.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
