import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUniqueId } from '../utils/uniqueId';

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth & Role
      role: 'student',
      apiKey: '',

      // ── Current User Profile (created on first load)
      currentUser: null, // { uniqueId, name, role, avatar, createdAt }

      // ── Study Setup
      subject: '',
      chapter: '',
      examDate: '',
      hoursPerDay: 2,
      level: 'intermediate',
      subtopics: [],
      noteStyle: 'concise',

      // ── Generated Content
      notes: '',
      flashcards: [],
      planner: [],

      // ── Quiz
      quizQuestions: [],
      quizState: null,
      scores: [],

      // ── Progress
      cardsStudied: 0,
      bookmarked: [],
      weakTopics: {},
      studyHeatmap: {},
      streak: 0,
      ratings: {},

      // ── Pomodoro
      pomodoroTime: 1500,
      pomodoroRunning: false,
      pomodoroMode: 'study',
      pomoSessions: 0,

      // ── Teacher Data (real students, no mocks)
      students: [],       // [{ uniqueId, name, subject, score, streak, status, lastSeen, linkedAt }]
      assignments: [],     // [{ id, title, subject, dueDate, status, assignedTo: [uniqueId], submissions: [] }]
      customQuestions: [],
      sharedNotes: [],

      // ── Parent Data (linked children)
      linkedChildren: [], // [{ uniqueId, name, linkedAt }]

      // ── Buddy Data
      buddyRequests: [],   // [{ id, fromId, fromName, subject, status, createdAt }]
      challengeHistory: [], // [{ id, opponentId, opponentName, subject, myScore, theirScore, date }]
      studySessions: [],   // [{ id, buddyId, buddyName, subject, date, time, type }]

      // ── Reminders (parent)
      reminders: [],

      // ── Leaderboard (computed from real users — stored registry)
      userRegistry: {},   // { [uniqueId]: { name, avatar, totalScore, streak, quizCount, lastActive } }

      // ──────────────────────────────────────────────────────────────
      // ── Auth & User Actions
      // ──────────────────────────────────────────────────────────────

      initUser: (name) => {
        const existing = get().currentUser;
        if (existing) return existing;
        const user = {
          uniqueId: generateUniqueId(),
          name: name || 'Student',
          role: get().role,
          avatar: (name || 'ST').slice(0, 2).toUpperCase(),
          createdAt: new Date().toISOString(),
        };
        // Also register self in leaderboard registry
        const registry = { ...get().userRegistry };
        registry[user.uniqueId] = {
          name: user.name,
          avatar: user.avatar,
          totalScore: 0,
          streak: 0,
          quizCount: 0,
          lastActive: new Date().toISOString(),
        };
        set({ currentUser: user, userRegistry: registry });
        return user;
      },

      updateUserName: (name) => {
        const user = get().currentUser;
        if (!user) return;
        const avatar = name.slice(0, 2).toUpperCase();
        const updated = { ...user, name, avatar };
        const registry = { ...get().userRegistry };
        if (registry[user.uniqueId]) {
          registry[user.uniqueId] = { ...registry[user.uniqueId], name, avatar };
        }
        set({ currentUser: updated, userRegistry: registry });
      },

      setRole: (role) => set({ role }),
      setApiKey: (apiKey) => set({ apiKey }),

      // ──────────────────────────────────────────────────────────────
      // ── Study Setup
      // ──────────────────────────────────────────────────────────────

      setSubject: (subject) => set({ subject }),
      setChapter: (chapter) => set({ chapter }),
      setExamDate: (examDate) => set({ examDate }),
      setHoursPerDay: (hoursPerDay) => set({ hoursPerDay }),
      setLevel: (level) => set({ level }),
      setSubtopics: (subtopics) => set({ subtopics }),
      setNoteStyle: (noteStyle) => set({ noteStyle }),

      // ──────────────────────────────────────────────────────────────
      // ── Generated Content
      // ──────────────────────────────────────────────────────────────

      setNotes: (notes) => set({ notes }),
      setFlashcards: (flashcards) => set({ flashcards }),
      setPlanner: (planner) => set({ planner }),

      setQuizQuestions: (quizQuestions) => set({ quizQuestions }),
      setQuizState: (quizState) => set({ quizState }),

      addScore: (score) => {
        const scores = [...get().scores, score].slice(-20);
        set({ scores });
        // Update heatmap
        const today = new Date().toISOString().split('T')[0];
        const heatmap = { ...get().studyHeatmap };
        heatmap[today] = (heatmap[today] || 0) + 1;
        set({ studyHeatmap: heatmap });

        // Update leaderboard registry for current user
        const user = get().currentUser;
        if (user) {
          const registry = { ...get().userRegistry };
          const entry = registry[user.uniqueId] || { name: user.name, avatar: user.avatar, totalScore: 0, streak: 0, quizCount: 0 };
          entry.totalScore += score;
          entry.quizCount += 1;
          entry.streak = get().streak;
          entry.lastActive = new Date().toISOString();
          registry[user.uniqueId] = entry;
          set({ userRegistry: registry });
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

      incrementCardsStudied: () => {
        set((s) => ({ cardsStudied: s.cardsStudied + 1 }));
        get().recordActivity();
      },

      markDayDone: (idx) => {
        const planner = get().planner.map((d, i) =>
          i === idx ? { ...d, done: !d.done } : d
        );
        set({ planner });
        get().recordActivity();
      },

      setPomodoro: (patch) => set((s) => ({ ...s, ...patch })),
      incrementPomoSessions: () => set((s) => ({ pomoSessions: s.pomoSessions + 1 })),

      setRating: (key, val) => {
        set((s) => ({ ratings: { ...s.ratings, [key]: val } }));
        get().recordActivity();
      },

      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0];
        const heatmap = { ...get().studyHeatmap };
        heatmap[today] = (heatmap[today] || 0) + 1;
        set({ studyHeatmap: heatmap });
      },

      // ──────────────────────────────────────────────────────────────
      // ── Teacher Actions
      // ──────────────────────────────────────────────────────────────

      addStudentByUniqueId: (uniqueId, name, subject = '') => {
        const existing = get().students.find((s) => s.uniqueId === uniqueId);
        if (existing) return { error: 'Student already linked' };
        // Look up registry
        const registryEntry = get().userRegistry[uniqueId];
        const student = {
          uniqueId,
          name: name || registryEntry?.name || 'Unknown',
          subject: subject || 'General',
          score: registryEntry?.totalScore ? Math.round(registryEntry.totalScore / Math.max(registryEntry.quizCount, 1)) : 0,
          streak: registryEntry?.streak || 0,
          status: 'active',
          lastSeen: registryEntry?.lastActive || new Date().toISOString().split('T')[0],
          linkedAt: new Date().toISOString(),
        };
        set((s) => ({ students: [...s.students, student] }));
        return { success: true, student };
      },

      removeStudent: (uniqueId) =>
        set((s) => ({ students: s.students.filter((st) => st.uniqueId !== uniqueId) })),

      refreshStudentData: () => {
        const registry = get().userRegistry;
        const students = get().students.map((s) => {
          const entry = registry[s.uniqueId];
          if (!entry) return s;
          return {
            ...s,
            name: entry.name || s.name,
            score: entry.quizCount ? Math.round(entry.totalScore / entry.quizCount) : s.score,
            streak: entry.streak || s.streak,
            lastSeen: entry.lastActive?.split('T')[0] || s.lastSeen,
          };
        });
        set({ students });
      },

      addAssignment: (a) =>
        set((s) => ({
          assignments: [...s.assignments, {
            ...a,
            id: Date.now(),
            assignedTo: a.assignedTo || [],
            submissions: [],
          }],
        })),
      removeAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),

      addCustomQuestion: (q) =>
        set((s) => ({ customQuestions: [...s.customQuestions, { ...q, id: Date.now() }] })),
      removeCustomQuestion: (id) =>
        set((s) => ({ customQuestions: s.customQuestions.filter((q) => q.id !== id) })),

      // ──────────────────────────────────────────────────────────────
      // ── Parent Actions
      // ──────────────────────────────────────────────────────────────

      linkChild: (uniqueId, name) => {
        const existing = get().linkedChildren.find((c) => c.uniqueId === uniqueId);
        if (existing) return { error: 'Child already linked' };
        const child = {
          uniqueId,
          name: name || get().userRegistry[uniqueId]?.name || 'Unknown',
          linkedAt: new Date().toISOString(),
        };
        set((s) => ({ linkedChildren: [...s.linkedChildren, child] }));
        return { success: true };
      },

      unlinkChild: (uniqueId) =>
        set((s) => ({ linkedChildren: s.linkedChildren.filter((c) => c.uniqueId !== uniqueId) })),

      getChildData: (uniqueId) => {
        const entry = get().userRegistry[uniqueId];
        if (!entry) return null;
        return {
          ...entry,
          uniqueId,
          avgScore: entry.quizCount ? Math.round(entry.totalScore / entry.quizCount) : 0,
        };
      },

      // ──────────────────────────────────────────────────────────────
      // ── Buddy Actions
      // ──────────────────────────────────────────────────────────────

      sendBuddyChallenge: (toId, subject) => {
        const user = get().currentUser;
        if (!user) return { error: 'Not logged in' };
        const request = {
          id: Date.now(),
          fromId: user.uniqueId,
          fromName: user.name,
          toId,
          subject,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ buddyRequests: [...s.buddyRequests, request] }));
        return { success: true, request };
      },

      addChallengeResult: (result) =>
        set((s) => ({ challengeHistory: [...s.challengeHistory, { ...result, id: Date.now(), date: new Date().toISOString() }] })),

      addStudySession: (session) =>
        set((s) => ({ studySessions: [...s.studySessions, { ...session, id: Date.now() }] })),
      removeStudySession: (id) =>
        set((s) => ({ studySessions: s.studySessions.filter((ss) => ss.id !== id) })),

      // ──────────────────────────────────────────────────────────────
      // ── Reminders
      // ──────────────────────────────────────────────────────────────

      addReminder: (reminder) =>
        set((s) => ({ reminders: [...s.reminders, { ...reminder, id: Date.now() }] })),
      removeReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      // ──────────────────────────────────────────────────────────────
      // ── Leaderboard (computed from userRegistry)
      // ──────────────────────────────────────────────────────────────

      getLeaderboard: () => {
        const registry = get().userRegistry;
        const currentId = get().currentUser?.uniqueId;
        return Object.entries(registry)
          .map(([id, data]) => ({
            uniqueId: id,
            name: id === currentId ? 'You' : data.name,
            avatar: data.avatar || data.name?.slice(0, 2).toUpperCase() || '??',
            score: data.totalScore || 0,
            avgScore: data.quizCount ? Math.round(data.totalScore / data.quizCount) : 0,
            streak: data.streak || 0,
            quizCount: data.quizCount || 0,
            isYou: id === currentId,
          }))
          .filter((e) => e.quizCount > 0)
          .sort((a, b) => b.score - a.score);
      },

      // Register or update an external user (e.g. from buddy code entry)
      registerUser: (uniqueId, name) => {
        const registry = { ...get().userRegistry };
        if (!registry[uniqueId]) {
          registry[uniqueId] = {
            name: name || 'Unknown',
            avatar: (name || 'UN').slice(0, 2).toUpperCase(),
            totalScore: 0,
            streak: 0,
            quizCount: 0,
            lastActive: new Date().toISOString(),
          };
          set({ userRegistry: registry });
        }
      },

      // ──────────────────────────────────────────────────────────────
      // ── Clear
      // ──────────────────────────────────────────────────────────────

      clearAllData: () => set({
        notes: '', flashcards: [], planner: [], quizQuestions: [], quizState: null,
        scores: [], cardsStudied: 0, bookmarked: [], weakTopics: {}, studyHeatmap: {},
        streak: 0, ratings: {}, customQuestions: [], reminders: [],
        students: [], assignments: [], linkedChildren: [],
        buddyRequests: [], challengeHistory: [], studySessions: [], sharedNotes: [],
      }),
    }),
    {
      name: 'smart-study-storage',
      partialize: (state) => ({
        role: state.role,
        apiKey: state.apiKey,
        currentUser: state.currentUser,
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
        customQuestions: state.customQuestions,
        reminders: state.reminders,
        assignments: state.assignments,
        students: state.students,
        linkedChildren: state.linkedChildren,
        buddyRequests: state.buddyRequests,
        challengeHistory: state.challengeHistory,
        studySessions: state.studySessions,
        userRegistry: state.userRegistry,
      }),
    }
  )
);

export default useAppStore;
