import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, AlertTriangle, TrendingUp, Flame, UserPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';
import MetricCard from '../../components/ui/MetricCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const Overview = () => {
  const { childrenData, fetchChildProgress, linkChild, unlinkChild } = useAppStore();
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => { fetchChildProgress(); }, []);

  const atRisk   = childrenData.filter((c) => (c.avgScore || 0) < 70).length;
  const avgScore = childrenData.length ? Math.round(childrenData.reduce((a, c) => a + (c.avgScore || 0), 0) / childrenData.length) : 0;
  const maxStreak = childrenData.length ? Math.max(...childrenData.map((c) => c.streak || 0), 0) : 0;

  const handleLink = async () => {
    if (!identifier.trim()) { toast.error('Enter your child\'s unique ID or email.'); return; }
    setLinking(true);
    const result = await linkChild(identifier.trim());
    setLinking(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success('Child linked!');
    setIdentifier('');
    setOpen(false);
  };

  const handleUnlink = async (id, name) => {
    const result = await unlinkChild(id);
    if (result.error) toast.error(result.error);
    else toast.success(`${name} unlinked.`);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Parent Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor your children's academic progress</p>
        </div>
        <Button icon={UserPlus} size="sm" onClick={() => setOpen(true)}>Link Child</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Children"    value={childrenData.length} icon={GraduationCap} color="accent"  index={0} />
        <MetricCard label="At Risk"     value={atRisk}              icon={AlertTriangle} color="danger"  index={1} />
        <MetricCard label="Avg Score"   value={avgScore}            suffix="%" icon={TrendingUp} color="purple" index={2} />
        <MetricCard label="Best Streak" value={maxStreak}           suffix="d" icon={Flame}     color="success" index={3} />
      </div>

      {childrenData.length > 0 ? (
        <div className="card">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Performance Summary</h2>
          <div className="space-y-4">
            {childrenData.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 sm:w-48">
                  <div className="w-9 h-9 rounded-xl bg-surface2 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {s.avatar || s.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <p className="text-gray-500 text-[10px] font-mono">{s.uniqueId}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <ProgressBar value={s.avgScore || 0} max={100} color={s.avgScore >= 80 ? 'success' : s.avgScore >= 70 ? 'accent' : 'danger'} className="flex-1" />
                  <span className={`text-sm font-bold shrink-0 ${s.avgScore >= 80 ? 'text-success' : s.avgScore >= 70 ? 'text-accent' : 'text-danger'}`}>{s.avgScore || 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">🔥{s.streak || 0}d · {s.quizCount || 0} quizzes</span>
                  {(s.avgScore || 0) < 70 && <Badge variant="danger">At Risk</Badge>}
                  <button onClick={() => handleUnlink(s._id, s.name)} className="p-1 text-gray-500 hover:text-danger transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-16 text-gray-500">
          <GraduationCap size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No children linked yet</p>
          <p className="text-xs mt-1">Ask your child for their unique ID or email from their student profile.</p>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Link Your Child">
        <div className="space-y-4">
          <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
            <p className="text-xs text-gray-400">Enter your child's <span className="text-accent font-bold">unique ID</span> or <span className="text-accent font-bold">email address</span>.</p>
          </div>
          <div>
            <label className="label">Child's ID or Email *</label>
            <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. k3$Af9 or child@email.com" onKeyDown={(e) => e.key === 'Enter' && handleLink()} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleLink} loading={linking} icon={UserPlus}>Link Child</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Overview;
