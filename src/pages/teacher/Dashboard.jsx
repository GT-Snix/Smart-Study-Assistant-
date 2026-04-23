import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, CheckCircle2, TrendingUp, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import MetricCard from '../../components/ui/MetricCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';

const pageVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const { students, fetchStudents } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => { fetchStudents(); }, []);

  const atRisk    = students.filter((s) => s.avgScore < 70).length;
  const avgScore  = students.length ? Math.round(students.reduce((a, s) => a + (s.avgScore || 0), 0) / students.length) : 0;
  const topScore  = students.length ? Math.max(...students.map((s) => s.avgScore || 0)) : 0;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Teacher Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of your class performance</p>
        </div>
        {students.length === 0 && (
          <Button icon={UserPlus} size="sm" onClick={() => navigate('/teacher/students')}>Add Students</Button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Students" value={students.length} icon={Users}         color="accent"  index={0} />
        <MetricCard label="At Risk"         value={atRisk}          icon={AlertTriangle} color="danger"  index={1} />
        <MetricCard label="Avg Score"       value={avgScore}        suffix="%" icon={TrendingUp} color="purple" index={2} />
        <MetricCard label="Top Score"       value={topScore}        suffix="%" icon={CheckCircle2} color="success" index={3} />
      </div>

      {students.length > 0 ? (
        <div className="card">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">Student Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Name</th>
                  <th className="text-left py-3 pr-4">ID</th>
                  <th className="text-left py-3 pr-4">Avg Score</th>
                  <th className="text-left py-3 pr-4">Quizzes</th>
                  <th className="text-left py-3 pr-4">Streak</th>
                  <th className="text-left py-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-surface2/50 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{s.uniqueId}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3 min-w-32">
                        <span className={`font-bold ${s.avgScore >= 80 ? 'text-success' : s.avgScore >= 70 ? 'text-accent' : 'text-danger'}`}>{s.avgScore}%</span>
                        <ProgressBar value={s.avgScore} max={100} color={s.avgScore >= 80 ? 'success' : s.avgScore >= 70 ? 'accent' : 'danger'} className="flex-1" />
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{s.quizCount}</td>
                    <td className="py-3 pr-4 text-gray-400">🔥 {s.streak}d</td>
                    <td className="py-3 text-gray-500 text-xs">{s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-16 text-gray-500">
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No students yet</p>
          <p className="text-xs mt-1">Go to the Students tab to add students using their unique ID or email.</p>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
