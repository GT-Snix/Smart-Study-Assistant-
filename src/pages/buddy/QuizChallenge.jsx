import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Send, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const INCOMING = [
  { from: 'Clara Davis',  subject: 'Biology Quiz',       questions: 10, expires: '2h' },
  { from: 'Frank Miller', subject: 'Math Speed Round',   questions: 5,  expires: '45m' },
];

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const QuizChallenge = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');

  const handleSend = () => {
    if (!to || !subject) { toast.error('Fill in all fields.'); return; }
    toast.success(`Challenge sent to ${to}!`);
    setTo(''); setSubject('');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Quiz Challenge</h1>
        <p className="text-gray-400 text-sm mt-1">Challenge your study buddy to a quiz duel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2"><Send size={14} /> Send Challenge</h2>
          <div><label className="label">Buddy's Name</label><input className="input" value={to} onChange={(e)=>setTo(e.target.value)} placeholder="e.g. Alice Johnson" /></div>
          <div><label className="label">Subject/Topic</label><input className="input" value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="e.g. Chapter 5 Physics" /></div>
          <Button fullWidth icon={Zap} onClick={handleSend}>Send Challenge</Button>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2"><Clock size={14} /> Incoming Challenges</h2>
          {INCOMING.map((c, i) => (
            <div key={i} className="p-4 bg-surface2 rounded-xl border border-border flex items-center justify-between gap-3">
              <div>
                <p className="text-white text-sm font-medium">{c.from}</p>
                <p className="text-gray-400 text-xs">{c.subject} · {c.questions} Qs · {c.expires} left</p>
              </div>
              <Button size="sm" onClick={() => toast.success('Challenge accepted!')}>Accept</Button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizChallenge;
