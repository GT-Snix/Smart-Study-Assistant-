import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, Trash2, Search, RefreshCw, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import { isValidUniqueId } from '../../utils/uniqueId';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const StudentReports = () => {
  const { students, addStudentByUniqueId, removeStudent, refreshStudentData } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ uniqueId: '', name: '', subject: '' });
  const sorted = [...students].sort((a, b) => b.score - a.score);

  const handleAddStudent = () => {
    if (!form.uniqueId.trim()) { toast.error('Enter the student\'s unique ID.'); return; }
    if (!isValidUniqueId(form.uniqueId.trim())) {
      toast.error('Invalid ID format. Must be 6 characters with letters, numbers, and special chars.');
      return;
    }
    if (!form.name.trim()) { toast.error('Enter the student\'s name.'); return; }
    const result = addStudentByUniqueId(form.uniqueId.trim(), form.name.trim(), form.subject.trim());
    if (result.error) { toast.error(result.error); return; }
    toast.success(`${form.name} added successfully!`);
    setForm({ uniqueId: '', name: '', subject: '' });
    setOpen(false);
  };

  const handleRefresh = () => {
    refreshStudentData();
    toast.success('Student data refreshed!');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Students</h1>
          <p className="text-gray-400 text-sm mt-1">Add students using their 6-character unique ID</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleRefresh}>Refresh</Button>
          <Button icon={UserPlus} size="sm" onClick={() => setOpen(true)}>Add Student</Button>
        </div>
      </div>

      {/* Student cards */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {sorted.map((s, i) => (
            <motion.div key={s.uniqueId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center text-sm font-bold text-white">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.name}</p>
                    <p className="text-gray-500 text-[10px] font-mono">{s.uniqueId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.score < 70 && <AlertTriangle size={16} className="text-danger" />}
                  <button onClick={() => { removeStudent(s.uniqueId); toast.success('Student removed.'); }} className="p-1.5 text-gray-500 hover:text-danger transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-2">{s.subject}</p>
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Score</span>
                  <span className={`font-bold ${s.score >= 80 ? 'text-success' : s.score >= 70 ? 'text-accent' : 'text-danger'}`}>{s.score}%</span>
                </div>
                <ProgressBar value={s.score} max={100} color={s.score >= 80 ? 'success' : s.score >= 70 ? 'accent' : 'danger'} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>🔥 {s.streak} day streak</span>
                <Badge variant={s.status === 'active' ? 'success' : 'danger'} className="capitalize">{s.status}</Badge>
              </div>
              <p className="text-[10px] text-gray-600">Last seen: {s.lastSeen}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16 text-gray-500">
          <UserPlus size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No students added yet.</p>
          <p className="text-xs mt-1">Ask your students for their 6-character unique ID and add them here.</p>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Student by Unique ID">
        <div className="space-y-4">
          <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
            <p className="text-xs text-gray-400">Ask the student to share their <span className="text-accent font-bold">6-character unique ID</span> from their profile. It contains letters, numbers, and special characters.</p>
          </div>
          <div>
            <label className="label">Student's Unique ID *</label>
            <input className="input font-mono text-center text-lg tracking-widest" maxLength={6}
              value={form.uniqueId} onChange={(e) => setForm({ ...form, uniqueId: e.target.value })}
              placeholder="e.g. k3$Af9" />
          </div>
          <div>
            <label className="label">Student Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Alice Johnson" />
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleAddStudent} icon={UserPlus}>Add Student</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default StudentReports;
