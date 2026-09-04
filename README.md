# ⚡ Market Pulse — Smart Market Watchlist

> **"Don't watch the market. Know what changed."**

Market Pulse is an intelligent attention filter for stock market watchlists. It suppresses market noise and highlights meaningful changes through deterministic anomaly detection, transparent evidence breakdown, and sector trend aggregation.

---

## 🏗️ Architecture Overview

The project is structured as a modern monorepo:

```
market-pulse/
├── backend/                  # FastAPI / Python 3.13 backend service
│   ├── app/
│   │   ├── api/v1/          # RESTful routers (auth, pulse, watchlist, stocks, settings, data-quality)
│   │   ├── core/            # Config, database engine, security (JWT & Bcrypt)
│   │   ├── engine/          # Meaningful-change scoring, evidence generator, sector aggregator
│   │   ├── models/          # SQLAlchemy async models
│   │   ├── providers/       # Multi-source abstractions (Rich Demo Provider & Live Adapter)
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   └── services/        # Pulse orchestrator, auth service, watchlist service
│   ├── tests/               # Pytest suite testing engine calculations & API endpoints
│   └── main.py              # Application entrypoint with auto-seeding
└── frontend/                 # Next.js 14 / TypeScript frontend web app
    ├── src/
    │   ├── app/             # App router pages (dashboard, stock timeline, watchlist, settings, data health)
    │   ├── components/      # UI components (HeroAway, ChangeCard, WhyModal, SectorStoryCard, SuppressedSection)
    │   └── lib/             # API client & Auth context provider
    └── package.json
```

---

## 🌟 Core Product Features

1. **"You Were Away" Hero Summary**: Calculates absence duration and filters out normal noise to present only high-value changes. Includes a "Mark Dashboard as Read" checkpoint button.
2. **Deterministic Attention Scoring Engine**: Multi-factor scoring model ($0\text{--}100$) evaluating price anomalies ($z$-score), volume surges relative to 30-day average, sector divergence, and material exchange announcements.
3. **Transparent Evidence Breakdown ("Why Am I Seeing This?")**: Provides exact, itemized score contributions and statistical justifications.
4. **Sector Story Aggregation**: Aggregates broad sector-wide movements into a single low-attention story card while highlighting stock-specific outliers.
5. **Chronological Change Timeline**: Intraday timeline tracking how events, sector divergence, volume surges, and price spikes unfolded throughout the trading day.
6. **"Nothing Meaningful Changed" Noise Suppression**: Explicitly lists stocks fluctuating within historical baseline limits.
7. **"My Signals" Personalization**: Toggle individual anomaly detectors and adjust global sensitivity multipliers ($0.5\times$ to $2.0\times$).
8. **Data Health & Trust Center**: Monitors ingestion feed health, latency metrics, and graceful degradation alerts.

---

## ⚡ Quickstart & Local Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Run Backend
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
- API Server: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- **Default Seed User**: `demo@marketpulse.io` / `demopassword123`

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests/ -v
```

### Frontend Type Check & Production Build
```bash
cd frontend
npm run build
```
