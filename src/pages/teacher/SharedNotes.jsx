import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import useAI from '../../hooks/useAI';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const SharedNotes = () => {
  const { generate, loading } = useAI();
  const [form, setForm] = useState({ subject: '', chapter: '', level: 'intermediate', style: 'detailed' });
  const [notes, setNotes] = useState('');

  const handleGenerate = async () => {
    if (!form.subject || !form.chapter) { toast.error('Fill in subject and chapter.'); return; }
    const text = await generate(
      `Generate ${form.style} class notes for teaching:\nSubject: ${form.subject}\nChapter: ${form.chapter}\nLevel: ${form.level}\n\nFormat as markdown. Include ## section headers, examples, key terms in bold, and a summary at the end.`,
      '', 'notes'
    );
    if (text) setNotes(text);
    else toast.error('Generation failed.');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Class Notes Generator</h1>
        <p className="text-gray-400 text-sm mt-1">Generate structured teaching notes for your class</p>
      </div>

      <div className="card space-y-4 max-w-xl">
        <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} placeholder="e.g. Biology" /></div>
        <div><label className="label">Chapter / Topic</label><input className="input" value={form.chapter} onChange={(e)=>setForm({...form,chapter:e.target.value})} placeholder="e.g. Chapter 4: Cell Division" /></div>
        <div>
          <label className="label">Level</label>
          <div className="flex gap-2">
            {['beginner','intermediate','advanced'].map((l)=>(
              <button key={l} onClick={()=>setForm({...form,level:l})} className={`flex-1 py-2 rounded-xl border text-sm capitalize transition-all ${form.level===l?'bg-accent/10 border-accent text-accent':'border-border text-gray-400'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Note Style</label>
          <div className="flex gap-2">
            {['concise','detailed','bullet','narrative'].map((s)=>(
              <button key={s} onClick={()=>setForm({...form,style:s})} className={`flex-1 py-1.5 rounded-xl border text-sm capitalize transition-all ${form.style===s?'bg-purple/10 border-purple text-purple':'border-border text-gray-400'}`}>{s}</button>
            ))}
          </div>
        </div>
        <Button fullWidth icon={Sparkles} onClick={handleGenerate} loading={loading}>Generate Class Notes</Button>
      </div>

      {loading && <Loader text="Generating class notes…" />}

      {notes && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-accent" />
            <span className="text-sm font-semibold text-white uppercase tracking-wide">Generated Notes</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none prose-h2:text-accent prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-strong:text-accent prose-p:text-gray-300 prose-li:text-gray-300">
            <ReactMarkdown>{notes}</ReactMarkdown>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SharedNotes;
