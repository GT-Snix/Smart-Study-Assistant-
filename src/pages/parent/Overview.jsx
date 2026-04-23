import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, AlertTriangle, TrendingUp, Flame, UserPlus, Trash2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';
import { isValidUniqueId } from '../../utils/uniqueId';
import MetricCard from '../../components/ui/MetricCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const Overview = () => {
  const { linkedChildren, linkChild, unlinkChild, getChildData, userRegistry } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ uniqueId: '', name: '' });

  // Compute child data from registry
  const childrenData = linkedChildren.map((c) => {
    const data = getChildData(c.uniqueId);
    return {
      ...c,
      score: data?.avgScore || 0,
      streak: data?.streak || 0,
      quizCount: data?.quizCount || 0,
      totalScore: data?.totalScore || 0,
      lastActive: data?.lastActive || '—',
    };
  });

  const atRisk   = childrenData.filter((c) => c.score < 70).length;
  const avgScore = childrenData.length ? Math.round(childrenData.reduce((a, c) => a + c.score, 0) / childrenData.length) : 0;
  const maxStreak = childrenData.length ? Math.max(...childrenData.map((c) => c.streak), 0) : 0;

  const handleLink = () => {
    if (!form.uniqueId.trim()) { toast.error('Enter your child\'s unique ID.'); return; }
    if (!isValidUniqueId(form.uniqueId.trim())) {
      toast.error('Invalid ID format. Must be 6 characters with letters, numbers, and special chars.');
      return;
    }
    if (!form.name.trim()) { toast.error('Enter your child\'s name.'); return; }
    const result = linkChild(form.uniqueId.trim(), form.name.trim());
    if (result.error) { toast.error(result.error); return; }
    toast.success(`${form.name} linked!`);
    setForm({ uniqueId: '', name: '' });
    setOpen(false);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Parent Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor your children's academic progress using their unique ID</p>
        </div>
        <Button icon={UserPlus} size="sm" onClick={() => setOpen(true)}>Link Child</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Children"   value={linkedChildren.length} icon={GraduationCap} color="accent"  index={0} />
        <MetricCard label="At Risk"    value={atRisk}                icon={AlertTriangle} color="danger"  index={1} />
        <MetricCard label="Avg Score"  value={avgScore}              suffix="%" icon={TrendingUp} color="purple" index={2} />
        <MetricCard label="Best Streak" value={maxStreak}            suffix="d" icon={Flame}     color="success" index={3} />
      </div>

      {childrenData.length > 0 ? (
        <div className="card">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Performance Summary</h2>
          <div className="space-y-4">
            {childrenData.map((s, i) => (
              <motion.div key={s.uniqueId} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 sm:w-48">
                  <div className="w-9 h-9 rounded-xl bg-surface2 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <p className="text-gray-500 text-[10px] font-mono">{s.uniqueId}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <ProgressBar value={s.score} max={100} color={s.score >= 80 ? 'success' : s.score >= 70 ? 'accent' : 'danger'} className="flex-1" />
                  <span className={`text-sm font-bold shrink-0 ${s.score >= 80 ? 'text-success' : s.score >= 70 ? 'text-accent' : 'text-danger'}`}>{s.score}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">🔥{s.streak}d · {s.quizCount} quizzes</span>
                  {s.score < 70 && <Badge variant="danger">At Risk</Badge>}
                  <button onClick={() => { unlinkChild(s.uniqueId); toast.success('Child unlinked.'); }} className="p-1 text-gray-500 hover:text-danger transition-colors">
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
          <p className="text-xs mt-1">Ask your child for their 6-character unique ID from their student profile.</p>
        </div>
      )}

      {/* Link Child Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Link Your Child">
        <div className="space-y-4">
          <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
            <p className="text-xs text-gray-400">Ask your child to share their <span className="text-accent font-bold">6-character unique ID</span> from their Student Setup profile page.</p>
          </div>
          <div>
            <label className="label">Child's Unique ID *</label>
            <input className="input font-mono text-center text-lg tracking-widest" maxLength={6}
              value={form.uniqueId} onChange={(e) => setForm({ ...form, uniqueId: e.target.value })} placeholder="e.g. k3$Af9" />
          </div>
          <div>
            <label className="label">Child's Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Alice" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleLink} icon={UserPlus}>Link Child</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Overview;
