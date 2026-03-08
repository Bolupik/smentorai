# SMentor — AI-Powered Stacks Ecosystem Learning Platform

> **"Learn Stacks. Earn from Stacks."**

**Live App:** [smentorai.lovable.app](https://smentorai.lovable.app)

---

## What is SMentor?

SMentor is an AI-powered interactive educational platform built exclusively for the [Stacks](https://stacks.org/) blockchain ecosystem. It is powered by **SAMMY THE AI** — a knowledgeable AI mentor with 1,600+ lines of curated, up-to-date Stacks knowledge — transforming how newcomers and experienced users learn about Stacks architecture, Clarity smart contracts, DeFi, sBTC, NFTs, memecoins, wallets, tools, and security.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **SAMMY THE AI (Chat)** | Streaming AI conversations — ask any Stacks question and get adaptive answers |
| 📚 **8 Topic Learning Paths** | Guided lessons across Architecture, Clarity, DeFi, NFTs, Memecoins, Tools, Wallets, Security |
| 🧠 **Interactive Quiz** | 50+ questions across 6 categories — timed mode, explanations, score tracking |
| 📊 **Live Metrics Dashboard** | Real-time STX price, BTC price, block height, PoX cycle, mempool, signers — auto-refreshes every 60s |
| 🗳️ **Community Knowledge Base** | User-contributed entries with upvotes/downvotes, threaded comments, and admin moderation |
| 🏆 **Achievements & Badges** | Gamified progress with unlockable badges, shareable on Twitter/X |
| 🎙️ **Voice Narration** | Text-to-speech for all AI responses |
| 🖼️ **AI-Generated Infographics** | Auto-generated visual explanations for complex topics |
| 📱 **dApp Showcase** | 36+ curated Stacks ecosystem projects browsable by category |
| 🔑 **Stacks Wallet Connect** | Sign in with Xverse, Leather, or Asigna wallets |
| 👶🧑🎓 **Age-Adaptive Modes** | Content adapts to Kid (6-10), Teen (11-17), Adult (18+), or Expert (Developer) level |
| 💰 **PoX Yield Rewards** *(Q1)* | Treasury STX stacked via Proof of Transfer → BTC yield distributed weekly to active learners |

---

## 📖 Learning Topics

| # | Topic | What You'll Learn |
|---|-------|-------------------|
| 01 | **Stacks Architecture** | Nakamoto upgrade, Proof of Transfer, sBTC rollout, Satoshi roadmap |
| 02 | **Clarity Language** | Decidable smart contracts, decidability, post-conditions, traits, SIP standards |
| 03 | **DeFi Protocols** | Zest, Granite, Bitflow, ALEX, Arkadiko, Velar, Hermetica, USDCx stablecoin |
| 04 | **NFTs & Collections** | Gamma marketplace, The Guests, Leo Cats, BNS, Ordinals bridge |
| 05 | **Memecoins** | WELSH, LEO, NOT, DOG, Teiko, PEPE on Bitflow/Velar/ALEX |
| 06 | **Tools** | BNS, BoostX, Hiro Platform, STXTools, STX City, Stacks Explorer |
| 07 | **Wallets** | Xverse, Leather, Asigna, Fordefi — comparison and use cases |
| 08 | **Security** | Smart contract auditing, Immunefi bug bounty, safe DeFi practices |

---

## 🧠 Quiz System

**50+ questions across 6 categories:**

| Category | Questions | Topics |
|----------|:---------:|--------|
| Architecture & Consensus | 10 | PoX, Nakamoto, Signers, mining, 51% attack resistance |
| Clarity Language | 15 | Decidability, types, principals, traits, built-ins, post-conditions |
| DeFi & sBTC | 10 | sBTC mechanics, deposit caps, withdrawal timeline, Zest, Granite |
| NFTs | 5 | SIP-009, Gamma, BNS, Ordinals |
| Security | 5 | Wallet security, post-conditions, key management |
| Advanced | 5 | Economic model, fee structures, governance |

Features: timed mode, per-question explanations, score tracking, category filtering, best-score persistence.

---

## 📱 dApp Showcase — 36+ Projects

| Category | Projects |
|----------|---------|
| **DeFi** | Zest Protocol, Bitflow, ALEX, Arkadiko, Velar, Hermetica, Granite, FastPool, Brotocol, Charisma, STX City, Moonlabs |
| **NFT** | Gamma, BNS Market, Boom, Tradeport |
| **Wallets** | Xverse, Leather, Asigna, Ryder |
| **Tools** | Hiro, STX Tools, BoostX, BlockSurvey, LunarCrush, STX20, STX Watch, Indexer, BNS One, SMentor AI |
| **Other** | Sigle, FAK, Zero Authority DAO, Chess on Chain, Stone Zone, Deorganized, Skullcoin |

---

## 🎓 Learning Modes

| Mode | Audience | Style |
|------|----------|-------|
| **Kid Mode** | Ages 6–10 | Super simple, fun, emoji-rich |
| **Teen Mode** | Ages 11–17 | Clear, engaging, relatable |
| **Adult Mode** | Ages 18+ | Detailed explanations with real examples |
| **Expert Mode** | Developers | Technical, precise, in-depth |

> Learning level is set once during onboarding and cannot be changed — it shapes how SAMMY explains every concept.

---

## 💰 Yield Reward System *(Launching Q1)*

SMentor operates a treasury that stacks STX via **Proof of Transfer (PoX)**. BTC yield generated each cycle is distributed weekly to engaged learners — **principal is never touched**.

### Weekly Yield Tiers

| Tier | Weekly Points | Yield Share |
|------|:---:|:---:|
| 🥇 **Gold** | 150+ pts | 50% |
| 🥈 **Silver** | 75–149 pts | 30% |
| 🥉 **Bronze** | 25–74 pts | 15% |
| 🏛️ **Platform** | N/A | 5% (operations) |

### Earning Points

| Activity | Points |
|----------|--------|
| Daily AI chat session | +5 |
| Topic explored | +10 |
| Quiz completed | +20 |
| Weekly quiz top 10 | +50 bonus |
| Knowledge contribution approved | +30 |
| 7-day streak | +25 |

---

## 🔐 Authentication

Two methods supported:

1. **Email/Password** — Standard signup with email verification
2. **Stacks Wallet Connect** — Xverse, Leather, or Asigna (progress saved to localStorage per wallet address)

Guest mode available with temporary session-only progress.

---

## 🛠️ Tech Stack

### Frontend

| Tool | Role |
|------|------|
| React 18 + TypeScript | UI framework |
| Vite | Build tooling |
| Tailwind CSS + shadcn/ui | Styling and components |
| Framer Motion | Animations |
| @stacks/connect | Wallet integration |
| react-markdown | Message rendering |

### Backend (Lovable Cloud)

| Tool | Role |
|------|------|
| PostgreSQL | Profiles, topic progress, knowledge base |
| Row Level Security | Per-user data isolation |
| Edge Functions (Deno) | AI chat, metrics, voice, infographics, moderation |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `defi-chat` | SAMMY AI streaming (Server-Sent Events) |
| `stacks-metrics` | Live Hiro API + CoinGecko aggregation |
| `text-to-speech` | Voice narration |
| `generate-infographic` | AI-generated visuals |
| `review-contribution` | Admin content moderation |

### External APIs

| Service | Data Provided |
|---------|--------------|
| **Hiro Stacks API** | Block height, transactions, mempool, PoX cycle, STX locked, signers count |
| **CoinGecko** | STX price, BTC price, market cap, volume |

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User display name, username, avatar, age/learning level |
| `topic_progress` | Per-user topic exploration state |
| `knowledge_base` | Community-submitted knowledge entries (with approve/reject) |
| `knowledge_votes` | Upvote/downvote records per entry |
| `knowledge_comments` | Threaded discussion on entries |
| `user_roles` | Role-based access control (`admin`, `moderator`, `user`) |

All tables protected with **Row Level Security (RLS)**.

---

## 🚀 Getting Started

```sh
# Clone the repository
git clone https://github.com/YOUR_USERNAME/smentor.git
cd smentor

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App runs at `http://localhost:8080`.

> Full functionality (AI chat, live metrics, authentication, database) requires the Lovable Cloud backend. Edit and deploy directly at [lovable.dev](https://lovable.dev).

---

## 🗺️ Roadmap

### ✅ Q0 — Foundation (Live)
- [x] SAMMY AI chat with streaming SSE responses
- [x] 8 topic learning paths with persistent progress tracking
- [x] 50+ question quiz with timed mode and explanations
- [x] Live metrics dashboard (Hiro + CoinGecko)
- [x] 36+ dApp showcase directory
- [x] User auth: email + Stacks wallet connect
- [x] Age-adaptive learning modes (locked after onboarding)
- [x] Achievement badges + shareable accomplishments
- [x] Community knowledge base (submit → moderate → approve → AI context injection)
- [x] Voice narration (text-to-speech)
- [x] AI-generated infographics
- [x] Admin panel with role-based moderation
- [x] Profile editor with contributor badges

### 🔄 Q1 — Engagement & Yield
- [ ] PoX treasury launch — begin stacking and yield accumulation
- [ ] Gold/Silver/Bronze yield tier dashboard
- [ ] Weekly quiz events with yield bonuses
- [ ] Leaderboard system
- [ ] Structured learning paths (Beginner → Intermediate → Advanced)

### 🔮 Q2 — Growth
- [ ] Multi-language support (Spanish, Portuguese, Turkish)
- [ ] On-chain achievement NFTs (SIP-009)
- [ ] DeFiLlama TVL integration
- [ ] Yield smart contract V1 (Clarity)
- [ ] 5 ecosystem partner campaigns
- [ ] PWA / mobile-optimized experience

### 🔮 Q3 — Scale
- [ ] Public API / embeddable Sammy widget
- [ ] Builder spotlight features
- [ ] Yield smart contract V2 (audited)
- [ ] DAO governance preparation

### 🔮 Q4 — Sustainability
- [ ] Stacks Academy Certification (on-chain NFT certificates)
- [ ] Premium subscription tier
- [ ] DAO treasury handoff
- [ ] Native mobile app (iOS/Android)

---

## 📊 KPI Targets

| Metric | Month 1 | Month 6 | Month 12 |
|--------|:-------:|:-------:|:--------:|
| New Installs | 400 | 1,200 | 3,000+ |
| Monthly Active Users | 150 | 500 | 1,000+ |
| Wallet Connects | 40 | 120 | 300+ |
| Course Finishers | 60 | 200 | 500+ |

---

## 🤝 Who Benefits

| Who | How |
|-----|-----|
| **New users** | Learn Stacks in plain language; earn yield while doing it |
| **STX holders** | Understand stacking, yield, ecosystem news; access PoX rewards |
| **Developers** | Get Clarity code examples, architecture deep-dives |
| **Stacks projects** | Gain visibility through the dApp showcase directory |
| **Stacks Foundation** | More educated, incentivized users = stronger ecosystem |

---

## 📄 Docs

- [WHITEPAPER.md](./WHITEPAPER.md) — Technical & economic model
- [GRANT_PROPOSAL.md](./GRANT_PROPOSAL.md) — Stacks Foundation grant application

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│              FRONTEND (React 18 + Vite)               │
│  SAMMY Chat · Topic Cards · Quiz · Knowledge Base     │
│  dApp Showcase · Live Metrics · Achievements · Profile│
└──────────────────┬───────────────────────────────────┘
                   │ Supabase Client SDK
┌──────────────────┴───────────────────────────────────┐
│              BACKEND (Lovable Cloud)                  │
│                                                       │
│  defi-chat ────────► Lovable AI Gateway (no key req.) │
│  stacks-metrics ───► Hiro API + CoinGecko             │
│  text-to-speech                                       │
│  generate-infographic                                 │
│  review-contribution                                  │
│                                                       │
│  PostgreSQL + Row Level Security (6 tables)           │
└───────────────────────────────────────────────────────┘
```

---

## 📜 License

MIT

---

**Website:** [smentorai.lovable.app](https://smentorai.lovable.app) · **AI:** SAMMY THE AI · **Built on:** [Stacks](https://stacks.org/) · **Last updated:** March 2026
