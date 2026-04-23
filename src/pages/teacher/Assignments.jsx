import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, BookMarked, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatDate } from '../../utils/formatters';

const STATUS_VARIANT = { active: 'success', overdue: 'danger', upcoming: 'accent' };
const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const Assignments = () => {
  const { assignments, addAssignment, removeAssignment, students } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '', assignedTo: [] });

  const toggleAssign = (uniqueId) => {
    setForm((f) => ({
      ...f,
      assignedTo: f.assignedTo.includes(uniqueId)
        ? f.assignedTo.filter((id) => id !== uniqueId)
        : [...f.assignedTo, uniqueId],
    }));
  };

  const handleCreate = () => {
    if (!form.title || !form.subject) { toast.error('Title and subject are required.'); return; }
    addAssignment({
      ...form,
      status: 'upcoming',
      total: form.assignedTo.length || students.length,
    });
    toast.success('Assignment created!');
    setOpen(false);
    setForm({ title: '', subject: '', dueDate: '', assignedTo: [] });
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Assignments</h1>
          <p className="text-gray-400 text-sm mt-1">{assignments.length} total assignments</p>
        </div>
        <Button icon={Plus} onClick={() => setOpen(true)}>New Assignment</Button>
      </div>

      {assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((a) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              className="card flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-purple/10 rounded-xl"><BookMarked size={18} className="text-purple" /></div>
                <div>
                  <p className="text-white font-semibold">{a.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{a.subject} · Due {formatDate(a.dueDate)}</p>
                  {a.assignedTo?.length > 0 && (
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                      <Users size={11} /> Assigned to {a.assignedTo.length} student{a.assignedTo.length > 1 ? 's' : ''}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-0.5">
                    {(a.submissions?.length || 0)} / {a.total || 0} submissions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={STATUS_VARIANT[a.status] || 'ghost'} className="capitalize">{a.status}</Badge>
                <button onClick={() => removeAssignment(a.id)} className="p-2 text-gray-500 hover:text-danger transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16 text-gray-500">
          <BookMarked size={40} className="mx-auto mb-4 opacity-20" />
          <p>No assignments yet. Create one to push to your students.</p>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Assignment">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" /></div>
          <div><label className="label">Subject *</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" /></div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>

          {/* Student assignment */}
          {students.length > 0 && (
            <div>
              <label className="label">Assign To Students</label>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 bg-surface2 rounded-xl border border-border">
                {students.map((s) => (
                  <label key={s.uniqueId} className="flex items-center gap-3 cursor-pointer hover:bg-surface rounded-lg px-2 py-1.5 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.assignedTo.includes(s.uniqueId)}
                      onChange={() => toggleAssign(s.uniqueId)}
                      className="w-4 h-4 accent-yellow-400 rounded"
                    />
                    <span className="text-sm text-white">{s.name}</span>
                    <span className="text-xs text-gray-500 font-mono ml-auto">{s.uniqueId}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">{form.assignedTo.length} selected · Leave empty to assign to all</p>
            </div>
          )}

          {students.length === 0 && (
            <div className="p-3 bg-surface2 rounded-xl border border-border">
              <p className="text-xs text-gray-500">No students added yet. Add students first from the Students tab.</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
            <Button fullWidth onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Assignments;
