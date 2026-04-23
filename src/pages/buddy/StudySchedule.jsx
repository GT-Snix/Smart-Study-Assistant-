import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Users, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAppStore from '../../store/useAppStore';
import { isValidUniqueId } from '../../utils/uniqueId';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const StudySchedule = () => {
  const { studySessions, addStudySession, removeStudySession, userRegistry } = useAppStore();
  const [form, setForm] = useState({ subject: '', buddyId: '', date: '', time: '', type: 'video' });

  const handleSchedule = () => {
    if (!form.subject.trim()) { toast.error('Enter a subject.'); return; }
    if (!form.buddyId.trim()) { toast.error('Enter buddy\'s unique ID.'); return; }
    if (!isValidUniqueId(form.buddyId.trim())) {
      toast.error('Invalid buddy ID format.');
      return;
    }
    const buddyName = userRegistry[form.buddyId.trim()]?.name || 'Buddy';
    addStudySession({
      ...form,
      buddyId: form.buddyId.trim(),
      buddyName,
    });
    toast.success(`Session scheduled with ${buddyName}!`);
    setForm({ subject: '', buddyId: '', date: '', time: '', type: 'video' });
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Study Schedule</h1>
        <p className="text-gray-400 text-sm mt-1">Plan joint study sessions with your buddies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2"><Plus size={14} /> Schedule Session</h2>
          <div>
            <label className="label">Subject/Topic *</label>
            <input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Calculus Derivatives" />
          </div>
          <div>
            <label className="label">Buddy's Unique ID *</label>
            <input className="input font-mono tracking-widest" maxLength={6} value={form.buddyId} onChange={(e) => setForm({ ...form, buddyId: e.target.value })} placeholder="e.g. k3$Af9" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="label">Time</label><input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
          </div>
          <div>
            <label className="label">Session Type</label>
            <div className="flex gap-2">
              {['video', 'chat', 'in-person'].map((t) => (
                <button key={t} onClick={() => setForm({ ...form, type: t })} className={`flex-1 py-2 rounded-xl border text-xs capitalize transition-all ${form.type === t ? 'bg-teal/10 border-teal text-teal' : 'border-border text-gray-400'}`}>{t}</button>
              ))}
            </div>
          </div>
          <Button fullWidth icon={Calendar} onClick={handleSchedule}>Schedule</Button>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2"><Calendar size={14} /> Scheduled Sessions</h2>
          {studySessions.length > 0 ? (
            studySessions.slice().reverse().map((s) => (
              <div key={s.id} className="p-4 bg-surface2 rounded-xl border border-border">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white text-sm font-semibold">{s.subject}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="teal" className="capitalize">{s.type}</Badge>
                    <button onClick={() => { removeStudySession(s.id); toast.success('Session removed.'); }} className="p-1 text-gray-500 hover:text-danger transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-xs flex items-center gap-1"><Users size={11} /> with {s.buddyName} <span className="font-mono text-gray-600 ml-1">({s.buddyId})</span></p>
                <p className="text-gray-400 text-xs mt-1">{s.date || 'No date'} {s.time ? `at ${s.time}` : ''}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-xs">No sessions scheduled yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StudySchedule;
