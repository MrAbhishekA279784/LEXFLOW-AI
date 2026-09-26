# LEXFLOW AI ⚖️

> **Turn Legal Complexity Into Clear Next Steps.**
>
> LEXFLOW is a premium AI-powered legal document intelligence platform featuring an interactive Legal Action Graph, multi-agent AI analysis, and What-If scenario stress-testing — built for lawyers, legal teams, and anyone who needs to understand complex legal documents fast.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📄 **Document Intelligence** | Upload PDF or DOCX contracts and get instant AI-powered analysis |
| 🔗 **Interactive Legal Action Graph** | Visualize how clauses, obligations, and risks connect using a zoomable force-directed graph |
| 🤖 **4-Agent AI Architecture** | Parallel AI agents debate findings using Gemini, then a synthesis engine resolves consensus |
| 🛡️ **Compliance Audit Engine** | Run structured audits against legal frameworks and regulations with evidence sourcing |
| ⚡ **What-If Scenario Stress Testing** | Simulate legal scenarios (e.g. breach, termination) and get projected timelines, financials, and risk chains |
| ⚖️ **Lawyer Kit** | Auto-generated negotiation questions, clause summaries, and recommended actions for legal professionals |
| 🔄 **Document Comparison** | Compare two documents side-by-side and detect conflicting clauses automatically |
| 📜 **Version History** | Full audit trail with diffing, revert capability, and revision notes |
| 💬 **Legal Assistant Chat** | Conversational AI assistant to ask questions about any uploaded document |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React 19)                  │
│  Vite · TypeScript · Tailwind CSS v4 · XY Flow · Motion    │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                  Backend (Express + TypeScript)             │
│  /api/v1  ·  Helmet  ·  CORS Hardening  ·  Rate Limiting   │
└────────┬─────────────────┬─────────────────┬───────────────┘
         │                 │                 │
   ┌─────▼──────┐  ┌───────▼──────┐  ┌──────▼──────┐
   │  Gemini AI │  │  Supabase DB │  │  Firebase   │
   │  (4 Agents)│  │  (pgvector)  │  │  (Auth)     │
   └────────────┘  └──────────────┘  └─────────────┘
```

**Multi-Agent AI Flow:**
1. **Extractor Agent** — Parses and chunks document text
2. **Analyst Agent** — Identifies clauses, risks, and obligations
3. **Retrieval Agent** — Fetches relevant case law and legal knowledge
4. **Synthesis Agent** — Resolves conflicts between agents and generates final output

---

## 🛠️ Tech Stack

**Frontend**
- React 19 with TypeScript
- Vite 6 (build & dev server)
- Tailwind CSS v4
- XY Flow (`@xyflow/react`) — legal graph visualization
- Motion (Framer Motion successor)
- Lucide React — icons

**Backend**
- Express.js with TypeScript (`tsx`)
- Helmet (security headers)
- Multer (file uploads up to 15MB)
- pdf-parse & Mammoth (document ingestion)
- PDFKit (PDF export generation)
- Zod (runtime schema validation)

**Database & Auth**
- Supabase (PostgreSQL + pgvector for semantic search)
- Firebase Auth (authentication & session management)

**AI**
- Google Gemini API (`@google/genai`) — 4-agent orchestration

**Testing & CI**
- Vitest with V8 coverage
- Testing Library (React)
- fast-check (property-based testing)
- GitHub Actions CI pipeline

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project
- A Firebase project
- A Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/MrAbhishekA279784/LEXFLOW-AI.git
cd LEXFLOW-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# AI
GEMINI_API_KEY=your_gemini_api_key

# Supabase
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 4. Run Database Migrations

Run the SQL migration files in order against your Supabase project:

```
src/backend/db/migrations/
  001_initial_schema.sql
  002_document_versions.sql
  003_multi_agent_system.sql
  004_compliance_audits_and_flexible_ids.sql
  005_scenario_stress_test_engine.sql
```

### 5. Start the Development Server

```bash
npm run dev
```

The app runs at **http://localhost:3000** (Express serves both the API and Vite dev middleware).

---

## 📁 Project Structure

```
LEXFLOW-AI/
├── server.ts                    # Express entry point
├── index.html                   # HTML shell
├── vite.config.ts
├── .env.example
│
├── src/
│   ├── App.tsx                  # Root router with lazy-loaded screens
│   ├── main.tsx
│   ├── index.css
│   │
│   ├── backend/
│   │   ├── config/              # Constants, env validation (Zod)
│   │   ├── controllers/         # Route handlers (analysis, documents, compliance…)
│   │   ├── db/
│   │   │   └── migrations/      # SQL schema migrations (001–005)
│   │   ├── middleware/          # Auth, rate limiting, error handler, validation
│   │   ├── repositories/        # Supabase repositories + in-memory store
│   │   ├── routes/              # API v1 route definitions
│   │   ├── services/
│   │   │   ├── ai/              # 4-agent orchestrator, debate engine, Gemini provider
│   │   │   ├── complianceAudit/ # Audit engine, debate, consensus
│   │   │   ├── comparison/      # Document diff & conflict detection
│   │   │   ├── extraction/      # PDF/DOCX text extraction pipeline
│   │   │   ├── graph/           # Legal Action Graph builder
│   │   │   ├── lawyerKit/       # Negotiation kit generator
│   │   │   ├── legalKnowledge/  # Legal retrieval & knowledge base
│   │   │   ├── risks/           # Risk scoring & detection
│   │   │   ├── scenarios/       # What-If stress test engine
│   │   │   └── export/          # PDF report export
│   │   └── __tests__/           # Comprehensive backend test suites
│   │
│   ├── components/
│   │   ├── common/              # BackgroundAura, BottomNav, Modals…
│   │   ├── complianceAudit/     # Compliance workspace UI
│   │   ├── desktop/             # Desktop shell, sidebar, dashboard
│   │   ├── graph/               # InteractiveLegalGraph (XY Flow)
│   │   ├── history/             # Document version history UI
│   │   ├── lawyerKit/           # Lawyer Kit panel components
│   │   ├── scenario/            # Scenario result cards
│   │   └── screens/             # Full-page screens (Home, Upload, Auth…)
│   │
│   ├── context/                 # React context (App, Document, Compliance…)
│   ├── data/                    # Seed data & initial state
│   ├── hooks/                   # useHapticFeedback
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # apiAuth, dateUtils, graphExporter
│
└── e2e/
    └── browserFlows.test.ts     # End-to-end browser flow tests
```

---

## 🧪 Testing

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:coverage
```

Test suites cover:
- AI provider failover and structured outputs
- Multi-agent debate and consensus
- Database persistence (Supabase repositories)
- Document ingestion (PDF/DOCX binary fixtures)
- Legal knowledge retrieval
- Compliance audit workflow
- Scenario stress test engine
- Lawyer Kit and export engine
- Authentication and security
- Property-based and fuzz tests

---

## 🔒 Security

- **Helmet** security headers on all responses
- **CORS hardening** with allowlist in production (`ALLOWED_ORIGINS` env var)
- **Rate limiting**: 120 req/15min (standard), 30 req/15min (AI endpoints)
- **File validation**: MIME type + extension whitelist, 15MB max
- **Firebase Auth** JWT verification on protected routes
- **Zod** schema validation on all API inputs
- **Supabase Row-Level Security** (RLS) on database tables

---

## 📤 Supported File Formats

| Format | Extension | Max Size |
|---|---|---|
| PDF | `.pdf` | 15 MB |
| Word Document | `.docx`, `.doc` | 15 MB |
| Plain Text | `.txt` | 15 MB |

Max 100 pages per PDF · Max 250,000 characters per document.

---

## ⚙️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Express + Vite HMR) |
| `npm run build` | Build frontend + bundle server for production |
| `npm start` | Run production build (`dist/server.cjs`) |
| `npm test` | Run Vitest test suite |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` and build artifacts |

---

## 📡 API Reference

Base URL: `/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/documents/upload` | Upload a legal document |
| GET | `/documents` | List user's documents |
| GET | `/documents/:id` | Get document details |
| POST | `/analysis/:id` | Run full AI analysis |
| POST | `/scenarios` | Create What-If scenario |
| GET | `/scenarios/:id/result` | Get scenario result |
| POST | `/compliance/audit` | Start compliance audit |
| GET | `/compliance/audit/:id` | Get audit result |
| GET | `/lawyer-kit/:id` | Get Lawyer Kit for document |
| POST | `/compare` | Compare two documents |
| GET | `/graph/:id` | Get Legal Action Graph data |
| GET | `/documents/:id/history` | Get version history |
| POST | `/assistant/chat` | Chat with Legal Assistant |

---

## ⚠️ Disclaimer

LEXFLOW provides informational analysis based on the provided document and retrieved legal sources. **It does not provide legal advice and does not replace a qualified legal professional.** Always consult a licensed attorney for legal decisions.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request against `main`

All PRs must pass the CI pipeline (type check + tests + build) before merging.

---

## 📝 License

This project is private. All rights reserved.

---

<div align="center">
  <strong>LEX</strong><span style="color:#FF6B22">FLOW</span> — Legal Intelligence, Reimagined.
</div>
