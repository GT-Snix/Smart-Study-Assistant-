import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, RefreshCw, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const StudentReports = () => {
  const { students, fetchStudents, addStudentById, removeStudent } = useAppStore();
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const handleAddStudent = async () => {
    if (!identifier.trim()) { toast.error('Enter the student\'s unique ID or email.'); return; }
    setAdding(true);
    const result = await addStudentById(identifier.trim());
    setAdding(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success(`${result.data.name} added successfully!`);
    setIdentifier('');
    setOpen(false);
  };

  const handleRemove = async (id, name) => {
    const result = await removeStudent(id);
    if (result.error) toast.error(result.error);
    else toast.success(`${name} removed.`);
  };

  const handleRefresh = () => {
    fetchStudents();
    toast.success('Student data refreshed!');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Students</h1>
          <p className="text-gray-400 text-sm mt-1">Add students using their unique ID or email</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={handleRefresh}>Refresh</Button>
          <Button icon={UserPlus} size="sm" onClick={() => setOpen(true)}>Add Student</Button>
        </div>
      </div>

      {students.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {students.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center text-sm font-bold text-white">
                    {s.avatar || s.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.name}</p>
                    <p className="text-gray-500 text-[10px] font-mono">{s.uniqueId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(s.avgScore || 0) < 70 && <AlertTriangle size={16} className="text-danger" />}
                  <button onClick={() => handleRemove(s._id, s.name)} className="p-1.5 text-gray-500 hover:text-danger transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Avg Score</span>
                  <span className={`font-bold ${s.avgScore >= 80 ? 'text-success' : s.avgScore >= 70 ? 'text-accent' : 'text-danger'}`}>{s.avgScore || 0}%</span>
                </div>
                <ProgressBar value={s.avgScore || 0} max={100} color={s.avgScore >= 80 ? 'success' : s.avgScore >= 70 ? 'accent' : 'danger'} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>🔥 {s.streak || 0} day streak</span>
                <span>{s.quizCount || 0} quizzes</span>
              </div>
              <p className="text-[10px] text-gray-600">Last active: {s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}</p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16 text-gray-500">
          <UserPlus size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No students added yet.</p>
          <p className="text-xs mt-1">Ask your students for their unique ID or email and add them here.</p>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Student">
        <div className="space-y-4">
          <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl">
            <p className="text-xs text-gray-400">Enter the student's <span className="text-accent font-bold">unique ID</span> or <span className="text-accent font-bold">email address</span>.</p>
          </div>
          <div>
            <label className="label">Student's ID or Email *</label>
            <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. k3$Af9 or student@email.com" onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleAddStudent} loading={adding} icon={UserPlus}>Add Student</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default StudentReports;
