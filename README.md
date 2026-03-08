# SMentor — AI-Powered Stacks Ecosystem Learning Platform

> **"Learn Stacks. Earn from Stacks."**

**Live App:** [smentorai.lovable.app](https://smentorai.lovable.app)

![Sammy the AI](https://smentorai.lovable.app/assets/ai-character-BeaQ9cz_.png)

---

## What is SMentor?

SMentor is an AI-powered, interactive educational platform purpose-built for the [Stacks](https://stacks.org/) blockchain ecosystem. It serves as a comprehensive onboarding and learning companion — powered by **Sammy**, an AI mentor with deep, curated Stacks knowledge — that transforms how newcomers and intermediate users understand Stacks architecture, Clarity smart contracts, DeFi, sBTC, NFTs, and the broader Bitcoin Layer ecosystem.

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat (Sammy)** | Streaming AI conversations with 1,600+ lines of curated Stacks knowledge |
| 📚 **Topic Learning Paths** | 8 guided topics with persistent progress tracking |
| 🧠 **Interactive Quiz** | 50+ questions across 6 categories with explanations and score tracking |
| 📊 **Live Metrics Dashboard** | Real-time STX price, block height, PoX cycle, mempool, signers via Hiro & CoinGecko |
| 🗳️ **Community Knowledge Base** | User-contributed entries with voting, comments, and admin moderation |
| 🏆 **Achievements & Badges** | Gamified progression with unlockable badges and shareable accomplishments |
| 🎙️ **Voice Narration** | Text-to-speech accessibility for all AI responses |
| 🖼️ **AI Infographics** | Auto-generated visual explanations for complex topics |
| 📱 **dApp Showcase** | Directory of 36+ curated Stacks ecosystem projects |
| 🔑 **Wallet Connect** | Stacks wallet integration (Xverse, Leather, Asigna) |
| 👶🧑🎓 **Age-Adaptive Modes** | Content delivered at child, teen, adult, or expert level |
| 💰 **PoX Yield Rewards** *(Q1)* | Treasury STX stacked via Proof of Transfer → BTC yield distributed weekly to learners |

---

## 🎓 Learning Modes

| Mode | Audience | Style |
|------|----------|-------|
| **Kid Mode** | Ages 6–10 | Super simple & fun |
| **Teen Mode** | Ages 11–17 | Clear and engaging |
| **Adult Mode** | Ages 18+ | Detailed with examples |
| **Expert Mode** | Developers | Technical and precise |

---

## 📖 Topics Covered

| Domain | Key Areas |
|--------|-----------|
| **Architecture** | Proof of Transfer, Nakamoto upgrade, Bitcoin finality, Signers, microblocks |
| **Clarity** | Decidability, post-conditions, traits, SIP standards, data types, functions |
| **DeFi** | Zest, Granite, Bitflow, ALEX, Arkadiko, Velar, Hermetica, USDCx |
| **sBTC** | Peg mechanism, deposit caps, withdrawal process, security partnerships |
| **NFTs** | Gamma marketplace, The Guests, BNS, Ordinals bridge, collection categories |
| **Stacking** | STX + sBTC yield strategies, StackingDAO, PoX mechanics |
| **Security** | Xverse, Leather, Asigna, Fordefi wallets, best practices |
| **Community** | DeFAI, institutional adoption, Stacks Ascent, Nakamojo culture |

---

## 💰 Yield Reward System *(Coming Q1)*

SMentor operates a **treasury** that stacks STX through Proof of Transfer (PoX). BTC yield generated each cycle is distributed **weekly** to engaged learners — **the principal is never touched**.

### Weekly Yield Tiers

| Tier | Weekly Points | Yield Share |
|------|:---:|:---:|
| 🥇 **Gold** | 150+ pts | 50% |
| 🥈 **Silver** | 75–149 pts | 30% |
| 🥉 **Bronze** | 25–74 pts | 15% |
| 🏛️ **Platform** | N/A | 5% (ops) |

### Earning Points

| Activity | Points |
|----------|--------|
| Daily AI chat session | +5 pts |
| Topic explored | +10 pts |
| Quiz completed | +20 pts |
| Weekly quiz top 10 | +50 pts bonus |
| Knowledge contribution approved | +30 pts |
| 7-day streak | +25 pts |

---

## 🛠️ Tech Stack

### Frontend

| Tool | Role |
|------|------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tooling |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **shadcn/ui** | Component library |
| **@stacks/connect** | Wallet integration |

### Backend (Lovable Cloud)

| Tool | Role |
|------|------|
| **PostgreSQL** | User profiles, progress, knowledge base |
| **Edge Functions** | AI chat, metrics, voice, infographics, moderation |
| **Row Level Security** | Per-user data isolation |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `defi-chat` | Sammy AI conversation engine (streaming SSE) |
| `stacks-metrics` | Live network stats (Hiro + CoinGecko) |
| `text-to-speech` | Voice narration |
| `generate-infographic` | Visual explanations |
| `review-contribution` | Admin content moderation |

### External APIs

| Service | Data |
|---------|------|
| **Hiro Stacks API** | Block height, transactions, PoX cycle, STX locked, signers |
| **CoinGecko** | STX & BTC price and market data |

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profile info, display name, avatar, learning level |
| `topic_progress` | Per-user topic exploration tracking |
| `knowledge_base` | Community-submitted knowledge entries |
| `knowledge_votes` | Upvote/downvote records |
| `knowledge_comments` | Discussion threads on entries |
| `user_roles` | Role-based access (`admin`, `moderator`, `user`) |

All tables protected with **Row Level Security (RLS)** policies.

---

## 🚀 Getting Started

```sh
# Clone the repository
git clone https://github.com/YOUR_USERNAME/smentor.git
cd smentor

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

> **Note:** The app requires a Lovable Cloud backend connection for full functionality (AI chat, live metrics, authentication, database). You can also edit and deploy directly via [Lovable](https://lovable.dev).

---

## 🔐 Authentication

SMentor supports two authentication methods:

1. **Email/Password** — Standard signup with email verification
2. **Stacks Wallet Connect** — Connect via Xverse, Leather, or Asigna

Guest mode is available with temporary session-only progress.

---

## 🗺️ Roadmap

### ✅ Q0 — Foundation (Completed)
- AI chat with streaming responses (Sammy)
- 8 topic learning paths with progress tracking
- 50+ question quiz system
- Live metrics dashboard
- dApp showcase (36+ projects)
- User accounts, achievements, and admin moderation
- Voice narration and AI-generated infographics
- Stacks wallet connect with onboarding flow
- Age-adaptive learning modes

### 🔄 Q1 — Engagement & Yield Foundation
- PoX treasury launch — begin stacking and yield accumulation
- Yield tier dashboard (Gold/Silver/Bronze tracker)
- Weekly quiz events with yield bonuses
- Leaderboard system
- Structured learning paths (Beginner → Intermediate → Advanced)

### 🔮 Q2 — Growth & Integration
- Multi-language support (Spanish, Portuguese, Turkish)
- On-chain achievement NFTs (SIP-009)
- DeFiLlama TVL integration
- Yield smart contract V1 (Clarity)
- 5 ecosystem project partner campaigns
- PWA / mobile-optimized experience

### 🔮 Q3 — Scale & Sustainability
- Public API for partner embedding (embeddable Sammy widget)
- Builder spotlight features
- Yield smart contract V2 (audited)
- DAO governance preparation

### 🔮 Q4 — Long-Term
- Stacks Academy Certification (on-chain NFT certificates)
- Premium subscription tier
- DAO treasury handoff
- Native mobile app (iOS/Android)

---

## 🏆 KPI Targets

| Metric | Month 1 | Month 6 |
|--------|:-------:|:-------:|
| New Installs | 400 | 1,200 |
| Monthly Active Users | 150 | 500 |
| Wallet Connects | 40 | 120 |
| Course Finishers | 60 | 200 |

---

## 🤝 Key Beneficiaries

| Who | How They Benefit |
|-----|-----------------|
| **New users** | Learn Stacks without reading technical docs; earn yield while doing it |
| **STX holders** | Understand stacking, yield, and ecosystem news; access PoX yield rewards |
| **Developers** | Get code examples and Clarity explanations |
| **Stacks projects** | Gain visibility through the dApp directory |
| **Stacks Foundation** | More educated, incentivized users = stronger ecosystem |

---

## 📄 Documentation

- [Whitepaper](./WHITEPAPER.md) — Full technical and economic model
- [Grant Proposal](./GRANT_PROPOSAL.md) — Detailed grant application for Stacks Foundation

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────┐
│            FRONTEND (React + Vite)           │
│  Chat Interface · Quiz · Knowledge Base      │
│  dApp Showcase · Live Metrics · Achievements │
└────────────────────┬────────────────────────┘
                     │ Supabase Client SDK
┌────────────────────┴────────────────────────┐
│           BACKEND (Lovable Cloud)            │
│                                              │
│  defi-chat ──────► Lovable AI Gateway        │
│  stacks-metrics ─► Hiro API + CoinGecko      │
│  text-to-speech                              │
│  generate-infographic                        │
│  review-contribution                         │
│                                              │
│  PostgreSQL + Row Level Security             │
└──────────────────────────────────────────────┘
```

---

## 📜 License

MIT

---

**Website:** [smentorai.lovable.app](https://smentorai.lovable.app) · **AI:** Sammy · **Built on:** [Stacks](https://stacks.org/)

*Last updated: March 2026*
