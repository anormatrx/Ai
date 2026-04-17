<div align="center">
<img width="1200" height="475" alt="ANOR-MATRIX Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ANOR-MATRX 🦁🔥

**Unified AI Development Platform** with Swarm Orchestration v4 and OpenClaw Core v9

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-9.0-blue.svg)](https://github.com/anormatrx/Ai)
[![Platform](https://img.shields.io/badge/Platform-Windows-green.svg)](https://github.com/anormatrx/Ai)

---

## ✨ Features

- **Swarm Orchestration v4** - True autonomous loop with task decomposition, AI routing, and self-correction
- **OpenClaw Core v9** - Intelligent intent detection and automatic model selection
- **19 Functional Modules** - Dashboard, Chat, Python IDE, Terminal, Skills Library, and more
- **Multi-Provider Support** - Ollama (local), OpenAI, Gemini (cloud)
- **Python IDE** - Browser-based Pyodide execution environment
- **Glassmorphism UI** - Modern futuristic interface with 3D elements

---

## 🏗️ Architecture

```
┌──────────────────────┐
│     FRONTEND         │  ← React + Vite + TypeScript
│   (Interface Only)   │
└──────────────────────┘
            │
            ▼
┌──────────────────────┐
│      OPENCLAW        │  ← Main Orchestrator
│   (All requests)     │
└──────────────────────┘
      │       │       │
      ▼       ▼       ▼
┌─────────┐ ┌───────┐ ┌────────┐
│ OLLAMA  │ │Python │ │Backend │
│(Models)│ │ Room  │ │ (APIs) │
└─────────┘ │(Exec) │ └────────┘
            └───────┘
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Required | Notes |
|------------|---------|----------|-------|
| **Node.js** | 18+ | ✅ Yes | Runtime for frontend & backend |
| **Python** | 3.8+ | ✅ Yes | For Python agent execution |
| **Ollama** | Latest | ❌ Optional | Local AI models |
| **RAM** | 8GB+ (16GB recommended) | ✅ Yes | System memory |
| **Storage** | 5GB+ | ✅ Yes | For dependencies & models |

### Installation

```bash
# Clone the repository
git clone https://github.com/anormatrx/Ai.git
cd Ai

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env
# GEMINI_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here

# Start development
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | No |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `BACKEND_PORT` | Backend port (default: 3002) | No |
| `FRONTEND_PORT` | Frontend port (default: 3000) | No |
| `OLLAMA_BASE_URL` | Ollama URL (default: http://127.0.0.1:11435) | No |

---

## 📱 Running

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint check
npm run lint
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3002
- Ollama: http://127.0.0.1:11435

---

## 📦 Modules

| # | Module | Description |
|---|-------|------------|
| 1 | Dashboard | Central information hub |
| 2 | Chat | Smart chat interface with Swarm v4 |
| 3 | Model Connect | Model API management |
| 4 | OpenClaw Core | OpenClaw integration center |
| 5 | Skill Builder | Build custom skills |
| 6 | Skills Library | Skills repository |
| 7 | Forge | Agent craftsmanship |
| 8 | Lab | Isolated safe environment |
| 9 | Editor | Monaco code editor |
| 10 | Python IDE | Pyodide-based Python IDE |
| 11 | Terminal | Advanced terminal |
| 12 | Explorer | File explorer |
| 13 | Diagnostics | Resource monitor |
| 14 | System Automation | AI command center |
| 15 | Cloud Sync | Cloud storage |
| 16 | GitHub | Version control hub |
| 17 | Memory | Vector database |
| 18 | Fx Setup | Effects configuration |
| 19 | Launchpad | Export and deploy |

---

## 🔌 API Endpoints

### Main Endpoints

| Endpoint | Method | Description |
|---------|--------|------------|
| `/api/health` | GET | System health |
| `/api/chat/complete` | POST | Chat completion |
| `/api/ollama/models` | GET | List Ollama models |
| `/api/providers/health` | GET | Provider health status |
| `/api/settings` | GET/POST | Settings management |
| `/swarm` | POST | Swarm v4 execution |

### OpenClaw Intent Routing

| Keyword | Intent | Executor |
|---------|--------|----------|
| `fix`, `bug` | maintenance | ollama |
| `python` | python-room | python-room |
| `terminal` | terminal | python-agent |
| `analyze` | analysis | ollama |

---

## 📁 Project Structure

```
anor-matrx/
├── src/                    # Frontend (React)
│   ├── components/         # UI components
│   ├── api/              # API clients
│   ├── config/            # Runtime config
│   ├── hooks/            # React hooks
│   ├── lib/              # Services
│   ├── services/         # Frontend services
│   └── store/            # State management
│
├── apps/backend/           # Backend (Express.js)
│   └── src/
│       ├── routes/       # API routes
│       ├── services/    # Backend services
│       ├── swarm/     # Swarm orchestration
│       └── providers/  # Model providers
│
├── dist/                # Built output
├── package.json         # Root dependencies
└── server.ts          # Main server
```

---

## 🛠️ Technologies

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, Zustand 5, Three.js
- **Backend:** Express.js, TypeScript
- **AI Models:** Ollama, OpenAI, Gemini
- **Python:** Pyodide (browser-based execution)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Ollama for local AI models
- Google Gemini for cloud AI
- OpenAI for GPT models
- React and Vite communities

---

<div align="center">

**ANOR-MATRX** 🦁🔥 - Unified AI Development Platform

[Documentation](Documentation/) • [Report Bug](https://github.com/anormatrx/Ai/issues) • [Request Feature](https://github.com/anormatrx/Ai/issues)

</div>