🧠 MINXY — Smart Study Assistant+

A multi-actor, AI-driven learning system that models real-world educational workflows across students, teachers, parents, and peers.

Engineered as a modular, role-based SPA with dynamic AI content generation and state persistence.

🔍 Problem Statement

Most ed-tech tools optimize for a single user (typically the student), ignoring the interconnected nature of learning ecosystems.

MINXY addresses this by:

Modeling multiple stakeholders
Enabling shared state across roles
Integrating AI as a first-class system component, not a feature
🧠 System Overview

MINXY is a role-segmented frontend architecture where each role operates within an isolated UI boundary but shares a unified data layer.

Key Properties
Role-based routing
Persistent client-side state
On-demand AI content pipeline
Modular feature isolation
🧩 Role-Based Architecture
🎓 Student Interface
AI-generated notes (structured markdown)
Flashcards (difficulty + hint metadata)
Adaptive study planner (N-day scheduling)
Quiz engine (MCQ + speed mode)
Pomodoro-based focus system
Progress tracking (charts + weak areas)
📚 Teacher Interface
Assignment lifecycle management
Question bank system
Student analytics dashboard
Class-level content distribution
🤝 Buddy System
Shared flashcards
Competitive quiz challenges
Leaderboard system
Collaborative scheduling
👤 Parent Dashboard
Performance summaries
Behavioral insights
Schedule tracking
Reminder system
🤖 AI Integration Layer

Powered via OpenRouter

Pipeline Design
Stateless request model
Prompt templates per feature
Structured output enforcement
Capabilities
Context-aware study notes
12-card flashcard generation (difficulty-tagged)
Personalized study plans (time-distributed)
Quiz generation (10 MCQs + speed round)
Post-quiz evaluation (natural language feedback)
🏗️ Architecture
Frontend Stack
Layer	Technology
Framework	React 18
Build Tool	Vite 5
Routing	React Router v6
State	Zustand
Styling	Tailwind CSS 3
Animation	Framer Motion 11
Charts	Recharts 2
Architectural Decisions
1. Zustand over Redux
Lower boilerplate
Faster iteration
Sufficient for current scale
2. Client-Side Persistence
localStorage-backed store
Eliminates backend dependency for MVP
Trade-off: no cross-device sync
3. Role-Based Routing
Clean separation of UI domains
Enables independent scaling per role
4. AI as a Service Layer
Abstracted prompt system
Reusable generation logic
Easy provider swap (OpenRouter → others)
🔄 Data Flow
User action triggers feature (e.g., generate quiz)
Prompt template constructed
API request sent to OpenRouter
Structured response parsed
State updated via Zustand
UI re-renders with persisted data
⚙️ Setup
Install
npm install
Configure
cp .env.example .env
VITE_OPENROUTER_API_KEY=sk-or-v1-...
Run
npm run dev
http://localhost:3000
Runtime Injection

API key can be set via in-app settings panel (no restart required).

📦 Scripts
npm run dev
npm run build
npm run preview
🎨 Design System
Token	Value	Purpose
bg	#0e0f14	Base
surface	#16181f	Containers
accent	#f5c842	Primary
purple	#8b7cf8	Teacher
teal	#3dcfb4	Buddy
blue	#5baef5	Parent
⚠️ Constraints & Trade-offs
No backend → limited persistence scope
AI latency dependent on external provider
No authentication layer (single-user assumption)
Large AI responses may affect performance
📈 Scalability Considerations

Planned evolution:

Backend (Node + DB) for multi-user sync
Auth + RBAC
WebSocket layer for real-time collaboration
AI response caching + streaming
Micro-frontend split per role
🧪 What This Project Demonstrates
Multi-role system design
AI-first product architecture
State management at scale (frontend-only)
Modular UI engineering
Real-world feature composition
🚫 Repository Hygiene
dist/
node_modules/
.env
📌 Positioning

MINXY is not a UI demo—it is a system design prototype for next-gen ed-tech platforms integrating AI at the workflow level.

🧭 Next Targets (High Impact)
Deploy (Vercel + edge functions)
Add backend sync layer
Introduce real-time collaboration
Optimize AI cost + latency
Convert into mobile-first UX
