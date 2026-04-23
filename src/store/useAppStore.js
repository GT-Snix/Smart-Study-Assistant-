import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth State ──
      token: null,
      currentUser: null, // { _id, name, email, role, uniqueId, avatar, children, students, buddies }
      isAuthenticated: false,
      authLoading: false,

      // ── Study Setup (local UI state) ──
      subject: '',
      chapter: '',
      examDate: '',
      hoursPerDay: 2,
      level: 'intermediate',
      subtopics: [],
      noteStyle: 'concise',

      // ── Generated Content (synced with backend) ──
      notes: '',
      flashcards: [],
      planner: [],
      quizQuestions: [],
      quizState: null,
      scores: [],

      // ── Progress ──
      cardsStudied: 0,
      bookmarked: [],
      weakTopics: {},
      studyHeatmap: {},
      streak: 0,
      ratings: {},

      // ── Pomodoro (local only) ──
      pomodoroTime: 1500,
      pomodoroRunning: false,
      pomodoroMode: 'study',
      pomoSessions: 0,

      // ── Teacher data (fetched from API) ──
      students: [],
      assignments: [],

      // ── Parent data (fetched from API) ──
      childrenData: [],

      // ── Buddy ──
      challengeHistory: [],
      studySessions: [],

      // ── Leaderboard ──
      leaderboard: [],

      // ── Reminders (local for now) ──
      reminders: [],

      // ──────────────────────────────────────────────────────────────
      // ── AUTH ACTIONS ──
      // ──────────────────────────────────────────────────────────────

      register: async (name, email, password, role) => {
        set({ authLoading: true });
        try {
          const res = await api.post('/auth/register', { name, email, password, role });
          localStorage.setItem('minxy_token', res.token);
          set({
            token: res.token,
            currentUser: res.data,
            isAuthenticated: true,
            authLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ authLoading: false });
          return { error: err.message };
        }
      },

      login: async (email, password) => {
        set({ authLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          localStorage.setItem('minxy_token', res.token);
          set({
            token: res.token,
            currentUser: res.data,
            isAuthenticated: true,
            authLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ authLoading: false });
          return { error: err.message };
        }
      },

      logout: () => {
        localStorage.removeItem('minxy_token');
        set({
          token: null,
          currentUser: null,
          isAuthenticated: false,
          notes: '',
          flashcards: [],
          planner: [],
          quizQuestions: [],
          quizState: null,
          scores: [],
          students: [],
          assignments: [],
          childrenData: [],
          leaderboard: [],
          challengeHistory: [],
          studySessions: [],
        });
      },

      loadUser: async () => {
        const token = localStorage.getItem('minxy_token');
        if (!token) return;
        try {
          const res = await api.get('/auth/me');
          set({ token, currentUser: res.data, isAuthenticated: true });
        } catch {
          localStorage.removeItem('minxy_token');
          set({ token: null, currentUser: null, isAuthenticated: false });
        }
      },

      // ──────────────────────────────────────────────────────────────
      // ── STUDY SETUP (local) ──
      // ──────────────────────────────────────────────────────────────

      setSubject: (subject) => set({ subject }),
      setChapter: (chapter) => set({ chapter }),
      setExamDate: (examDate) => set({ examDate }),
      setHoursPerDay: (hoursPerDay) => set({ hoursPerDay }),
      setLevel: (level) => set({ level }),
      setSubtopics: (subtopics) => set({ subtopics }),
      setNoteStyle: (noteStyle) => set({ noteStyle }),

      // ──────────────────────────────────────────────────────────────
      // ── CONTENT (set locally, synced to backend) ──
      // ──────────────────────────────────────────────────────────────

      setNotes: (notes) => set({ notes }),
      setFlashcards: (flashcards) => set({ flashcards }),
      setPlanner: (planner) => set({ planner }),
      setQuizQuestions: (quizQuestions) => set({ quizQuestions }),
      setQuizState: (quizState) => set({ quizState }),

      // Sync all study data to backend
      syncStudyData: async () => {
        const s = get();
        if (!s.isAuthenticated || s.currentUser?.role !== 'student') return;
        try {
          await api.put('/study', {
            subject: s.subject,
            chapter: s.chapter,
            level: s.level,
            noteStyle: s.noteStyle,
            examDate: s.examDate,
            hoursPerDay: s.hoursPerDay,
            subtopics: s.subtopics,
            notes: s.notes,
            flashcards: s.flashcards,
            planner: s.planner,
            quizQuestions: s.quizQuestions,
            scores: s.scores,
            cardsStudied: s.cardsStudied,
            weakTopics: s.weakTopics,
            studyHeatmap: s.studyHeatmap,
            streak: s.streak,
            pomoSessions: s.pomoSessions,
            challengeHistory: s.challengeHistory,
            studySessions: s.studySessions,
          });
        } catch (err) {
          console.warn('Sync failed:', err.message);
        }
      },

      // Load study data from backend
      loadStudyData: async () => {
        if (get().currentUser?.role !== 'student') return;
        try {
          const res = await api.get('/study');
          const d = res.data;
          set({
            subject: d.subject || '',
            chapter: d.chapter || '',
            level: d.level || 'intermediate',
            noteStyle: d.noteStyle || 'concise',
            examDate: d.examDate || '',
            hoursPerDay: d.hoursPerDay || 2,
            subtopics: d.subtopics || [],
            notes: d.notes || '',
            flashcards: d.flashcards || [],
            planner: d.planner || [],
            quizQuestions: d.quizQuestions || [],
            scores: d.scores || [],
            cardsStudied: d.cardsStudied || 0,
            weakTopics: d.weakTopics || {},
            studyHeatmap: d.studyHeatmap || {},
            streak: d.streak || 0,
            pomoSessions: d.pomoSessions || 0,
            challengeHistory: d.challengeHistory || [],
            studySessions: d.studySessions || [],
          });
        } catch (err) {
          console.warn('Load study data failed:', err.message);
        }
      },

      addScore: async (score, weakTopicsUpdate) => {
        const scores = [...get().scores, score].slice(-50);
        const today = new Date().toISOString().split('T')[0];
        const heatmap = { ...get().studyHeatmap };
        heatmap[today] = (heatmap[today] || 0) + 1;
        set({ scores, studyHeatmap: heatmap });

        try {
          await api.post('/study/score', { score, weakTopics: weakTopicsUpdate || {} });
        } catch (err) {
          console.warn('Score sync failed:', err.message);
        }
      },

      addWeakTopic: (topic) => {
        const wt = { ...get().weakTopics };
        wt[topic] = (wt[topic] || 0) + 1;
        set({ weakTopics: wt });
      },

      toggleBookmark: (idx) => {
        const bm = [...get().bookmarked];
        const pos = bm.indexOf(idx);
        if (pos === -1) bm.push(idx);
        else bm.splice(pos, 1);
        set({ bookmarked: bm });
      },

      incrementCardsStudied: () => set((s) => ({ cardsStudied: s.cardsStudied + 1 })),

      markDayDone: (idx) => {
        const planner = get().planner.map((d, i) =>
          i === idx ? { ...d, done: !d.done } : d
        );
        set({ planner });
      },

      setPomodoro: (patch) => set((s) => ({ ...s, ...patch })),
      incrementPomoSessions: () => set((s) => ({ pomoSessions: s.pomoSessions + 1 })),

      setRating: (key, val) => set((s) => ({ ratings: { ...s.ratings, [key]: val } })),

      // ──────────────────────────────────────────────────────────────
      // ── TEACHER ACTIONS (API-backed) ──
      // ──────────────────────────────────────────────────────────────

      fetchStudents: async () => {
        try {
          const res = await api.get('/teacher/students');
          set({ students: res.data });
        } catch (err) {
          console.warn('Fetch students failed:', err.message);
        }
      },

      addStudentById: async (identifier) => {
        try {
          const res = await api.post('/user/add-student', { identifier });
          // Refresh students list
          await get().fetchStudents();
          return { success: true, data: res.data };
        } catch (err) {
          return { error: err.message };
        }
      },

      removeStudent: async (studentId) => {
        try {
          await api.delete(`/user/remove-student/${studentId}`);
          set((s) => ({ students: s.students.filter((st) => st._id !== studentId) }));
          return { success: true };
        } catch (err) {
          return { error: err.message };
        }
      },

      fetchAssignments: async () => {
        try {
          const res = await api.get('/teacher/assignments');
          set({ assignments: res.data });
        } catch (err) {
          console.warn('Fetch assignments failed:', err.message);
        }
      },

      createAssignment: async (assignment) => {
        try {
          const res = await api.post('/teacher/assignments', assignment);
          set((s) => ({ assignments: [res.data, ...s.assignments] }));
          return { success: true };
        } catch (err) {
          return { error: err.message };
        }
      },

      deleteAssignment: async (id) => {
        try {
          await api.delete(`/teacher/assignments/${id}`);
          set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) }));
          return { success: true };
        } catch (err) {
          return { error: err.message };
        }
      },

      // ──────────────────────────────────────────────────────────────
      // ── PARENT ACTIONS (API-backed) ──
      // ──────────────────────────────────────────────────────────────

      fetchChildProgress: async () => {
        try {
          const res = await api.get('/parent/child-progress');
          set({ childrenData: res.data });
        } catch (err) {
          console.warn('Fetch children failed:', err.message);
        }
      },

      linkChild: async (identifier) => {
        try {
          const res = await api.post('/user/link-child', { identifier });
          await get().loadUser();
          await get().fetchChildProgress();
          return { success: true, data: res.data };
        } catch (err) {
          return { error: err.message };
        }
      },

      unlinkChild: async (childId) => {
        try {
          await api.delete(`/user/unlink-child/${childId}`);
          set((s) => ({ childrenData: s.childrenData.filter((c) => c._id !== childId) }));
          await get().loadUser();
          return { success: true };
        } catch (err) {
          return { error: err.message };
        }
      },

      // ──────────────────────────────────────────────────────────────
      // ── BUDDY ACTIONS ──
      // ──────────────────────────────────────────────────────────────

      addBuddy: async (identifier) => {
        try {
          const res = await api.post('/user/add-buddy', { identifier });
          await get().loadUser();
          return { success: true, data: res.data };
        } catch (err) {
          return { error: err.message };
        }
      },

      removeBuddy: async (buddyId) => {
        try {
          await api.delete(`/user/remove-buddy/${buddyId}`);
          await get().loadUser();
          return { success: true };
        } catch (err) {
          return { error: err.message };
        }
      },

      addChallengeResult: (result) =>
        set((s) => ({
          challengeHistory: [...s.challengeHistory, { ...result, id: Date.now(), date: new Date().toISOString() }],
        })),

      addStudySession: (session) =>
        set((s) => ({ studySessions: [...s.studySessions, { ...session, id: Date.now() }] })),
      removeStudySession: (id) =>
        set((s) => ({ studySessions: s.studySessions.filter((ss) => ss.id !== id) })),

      // ──────────────────────────────────────────────────────────────
      // ── LEADERBOARD ──
      // ──────────────────────────────────────────────────────────────

      fetchLeaderboard: async () => {
        try {
          const res = await api.get('/study/leaderboard');
          set({ leaderboard: res.data });
        } catch (err) {
          console.warn('Fetch leaderboard failed:', err.message);
        }
      },

      // ──────────────────────────────────────────────────────────────
      // ── REMINDERS (local) ──
      // ──────────────────────────────────────────────────────────────

      addReminder: (reminder) =>
        set((s) => ({ reminders: [...s.reminders, { ...reminder, id: Date.now() }] })),
      removeReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      // ──────────────────────────────────────────────────────────────
      // ── CLEAR ──
      // ──────────────────────────────────────────────────────────────

      clearAllData: () =>
        set({
          notes: '',
          flashcards: [],
          planner: [],
          quizQuestions: [],
          quizState: null,
          scores: [],
          cardsStudied: 0,
          bookmarked: [],
          weakTopics: {},
          studyHeatmap: {},
          streak: 0,
          ratings: {},
          reminders: [],
          challengeHistory: [],
          studySessions: [],
        }),
    }),
    {
      name: 'minxy-storage',
      partialize: (state) => ({
        token: state.token,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        subject: state.subject,
        chapter: state.chapter,
        examDate: state.examDate,
        hoursPerDay: state.hoursPerDay,
        level: state.level,
        subtopics: state.subtopics,
        noteStyle: state.noteStyle,
        notes: state.notes,
        flashcards: state.flashcards,
        planner: state.planner,
        quizQuestions: state.quizQuestions,
        scores: state.scores,
        cardsStudied: state.cardsStudied,
        bookmarked: state.bookmarked,
        weakTopics: state.weakTopics,
        studyHeatmap: state.studyHeatmap,
        streak: state.streak,
        ratings: state.ratings,
        reminders: state.reminders,
        challengeHistory: state.challengeHistory,
        studySessions: state.studySessions,
      }),
    }
  )
);

export default useAppStore;
