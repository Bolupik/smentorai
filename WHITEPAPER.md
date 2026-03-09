# SMentor — Whitepaper

### AI-Powered Onboarding & Yield Rewards for the Stacks Ecosystem

**Version 2.1 | March 2026 | 12-Month Plan**

---

## 1. Problem

New users trying to join the Stacks ecosystem face four barriers:

1. **Too complicated** — Concepts like Proof of Transfer, Clarity smart contracts, and sBTC have no simple, accessible explanations aimed at everyday people.
2. **Information is scattered** — Useful content is spread across GitHub, Discord, Twitter/X, and various blogs. There is no single place to learn everything.
3. **People leave** — Without guided help, most newcomers get overwhelmed and never come back.
4. **No incentive to learn** — There is no financial reward for investing time and effort in learning about the Stacks ecosystem.

**Bottom line:** Stacks has world-class technology but not enough people understand it — and nothing currently rewards them for trying.

---

## 2. Proposed Solution

**SMentor** is an AI-powered interactive learning platform featuring **SAMMY THE AI**  a knowledgeable AI mentor that teaches Stacks in plain, adaptive language and rewards learners with real Bitcoin yield for engaging.

| Action | Result |
|--------|--------|
| Ask any question | Get a clear, level-adapted answer from SAMMY |
| Pick a topic | Follow one of 8 guided learning paths |
| Take a quiz | Test knowledge across 50+ questions in 6 categories |
| See live data | Real-time STX/BTC prices, block height, PoX cycle, mempool |
| Browse dApps | Explore 36+ curated Stacks projects |
| **Earn yield** *(Q1)* | Treasury STX stacked via PoX → BTC rewards distributed weekly |

The platform works for beginners (including children) through expert developers.

---

## 3. Key Beneficiaries

| Who | How They Benefit |
|-----|-----------------|
| **New users** | Learn Stacks without reading technical docs; earn yield while doing it |
| **STX holders** | Understand stacking, yield, and ecosystem news; access PoX yield rewards |
| **Developers** | Get Clarity code examples and architecture deep-dives |
| **Stacks projects** | Gain visibility through the 36+ dApp showcase directory |
| **Stacks Foundation** | More educated, incentivized users = stronger, more resilient ecosystem |

---

## 4. Platform Features

### 4.1 SAMMY THE AI — Chat Interface

The core of SMentor is an intelligent conversational interface:

- **Streaming responses** via Server-Sent Events (SSE) for a real-time feel
- **1,600+ lines** of curated system prompt covering all major Stacks topics
- **Community knowledge injection** — approved knowledge base entries are dynamically included in the AI context
- **Age-adaptive responses** — Kid, Teen, Adult, and Expert modes change language and complexity
- **Auto-infographic generation** — complex topics trigger AI-generated visual explanations
- **Voice narration** — text-to-speech for all responses

**Topics the AI covers deeply:**

| Domain | Key Areas |
|--------|-----------|
| Architecture | PoX, Nakamoto upgrade, Bitcoin finality, Signers, microblocks, Satoshi roadmap |
| Clarity | Decidability, post-conditions, traits, SIP standards, principals, data types |
| DeFi | Zest, Granite, Bitflow, ALEX, Arkadiko, Velar, Hermetica, USDCx (Circle) and more |
| sBTC | Peg mechanism, deposit caps (150 BTC/day withdrawal), security partnerships |
| NFTs | Gamma marketplace, The Guests, Leo Cats, BNS, SpaghettiPunk Club |
| Memecoins | WELSH, LEO, NOT, DOG, Teiko, PEPE, sAI and more traded on Bitflow, Velar, ALEX |
| Tools | BNS (bns.one), BoostX, Hiro Platform, STXTools, STX City, Stacks Explorer |
| Wallets | Xverse, Leather, Asigna, Fordefi — security models and use cases |
| Security | Smart contract audits, Immunefi bug bounty, Clarity safety, DeFi best practices |

### 4.2 Interactive Quiz System

50+ questions across 6 categories, each with detailed explanations and age-adapted simple explanations:

| Category | Questions |
|----------|:---------:|
| Architecture & Consensus | |
| Clarity Language |  |
| DeFi & sBTC |  |
| NFTs |  |
| Security | |
| Advanced | |

Features: optional timed mode, score persistence, category filtering, **weekly quiz yield bonus** for top performers.

### 4.3 Community Knowledge Base

A collaborative, moderated repository:

- Users submit knowledge entries (topic, content, category, optional link and image)
- Admin review pipeline: submit → review → approve/reject
- Community upvote/downvote system to surface quality content
- Threaded comments on entries
- **Approved entries are dynamically injected into SAMMY's AI context** — creating a self-improving knowledge loop
- Categories: General, NFTs, DeFi, Stacking, Clarity, sBTC, Security, Architecture

### 4.4 Live Community Sentiment Dashboard

Real-time ecosystem pulse:

- **Live Metrics**: STX price, BTC price, block height, transactions, mempool, PoX cycle, STX locked, signers count sourced from Hiro API and CoinGecko
- **Trending Topics**: Dual Stacking, sBTC milestones, BitGo partnership, Clarity 4 WASM, DeFAI
- **Auto-refresh** every 60 seconds
- **Sentiment Meter**: community bullish/bearish indicator

### 4.5 dApp Showcase — 36+ Projects

Curated directory filterable by category:

| Category | Projects |
|----------|---------|
| **DeFi** | Zest Protocol, Bitflow, ALEX, Arkadiko, Velar, Hermetica, Granite, FastPool, Brotocol, Charisma, STX City, Moonlabs |
| **NFT** | Gamma, BNS Market, Boom, Tradeport |
| **Wallets** | Xverse, Leather, Asigna, Ryder |
| **Tools** | Hiro, STX Tools, BoostX, BlockSurvey, LunarCrush, STX20, STX Watch, Indexer, BNS One, SMentor AI |
| **Other** | Sigle, FAK, Zero Authority DAO, Chess on Chain, Stone Zone, Deorganized, Skullcoin |

Each entry shows: logo, tagline, description, highlights, rating, and external link.

### 4.6 Gamification & Achievements

- **8 topic progress tracking** with visual progress bar persisted in database
- **Unlockable achievement badges** (Explorer, Scholar, DeFi Degen, etc.)
- **Animated badge reveals** with spring physics
- **Shareable achievements** via Twitter/X
- **Profile achievement wall** showing earned badges across topics, quizzes, and contributions

### 4.7 Age-Adaptive Learning Modes

Selected once during onboarding — locked to prevent gaming the system:

| Mode | Age | Style |
|------|-----|-------|
| **Kid Mode** | 6–10 | Simple, fun, emoji-rich explanations |
| **Teen Mode** | 11–17 | Clear, engaging, relatable |
| **Adult Mode** | 18+ | Detailed with real-world examples |
| **Expert Mode** | Developers | Technical, precise, developer-focused |

---

## 5. Yield Generation & Reward System (soon)

### Overview

SMentor plans to operates a **treasury** that stacks STX through the Stacks **Proof of Transfer (PoX)** mechanism, generating BTC yield every PoX cycle (~2 weeks). That yield — **never the principal** — is distributed weekly to platform participants based on engagement tier.

### Weekly Yield Tiers (soon)

| Tier | Weekly Points Required | Share of Weekly Yield |
|------|:----------------------:|:---------------------:|
| 🥇 **Gold** | 150+ pts | **50%** |
| 🥈 **Silver** | 75–149 pts | **30%** |
| 🥉 **Bronze** | 25–74 pts | **15%** |
| 🏛️ **Platform** | N/A | **5%** (operations) |

Each tier's allocation is distributed **pro-rata** among all users in that tier for that week.

### Earning Points

| Activity | Points |
|----------|:------:|
| Daily AI chat session | +5 |
| Topic explored | +10 |
| Quiz completed | +20 |
| Weekly quiz top 10 | +50 bonus |
| Knowledge contribution approved | +30 |
| 7-day streak | +25 |

### Weekly Quiz Yield Bonus (soon)

Top performers in the weekly timed quiz earn **additional yield on top of their tier share**:

| Result | Bonus |
|--------|-------|
| Top 3 finishers | +10% of tier allocation |
| Top 10 finishers | +5% of tier allocation |
| All completers | +2% of tier allocation |

Quiz bonuses are funded from the platform's 5% share — no dilution to tier holders.


---

## 5. Technology Stack

### Frontend

| Tool | Role |
|------|------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Fast build tooling |
| **Tailwind CSS** | Consistent styling |
| **Framer Motion** | Smooth animations |
| **shadcn/ui** | Component library |
| **@stacks/connect** | Stacks wallet integration |
| **react-markdown** | Chat message rendering |

### Backend (Lovable Cloud)

| Tool | Role |
|------|------|
| **PostgreSQL** | Profiles, progress, knowledge base |
| **Edge Functions (Deno)** | AI chat, metrics, voice, infographics |
| **Row Level Security** | Per-user data isolation |
| **Auth** | Email/password + wallet connect |

### Edge Functions

| Function | Purpose |
|----------|---------|
| `defi-chat` | SAMMY streaming AI engine (SSE) |
| `stacks-metrics` | Aggregates Hiro API + CoinGecko |
| `text-to-speech` | Voice narration |
| `generate-infographic` | AI visual generation |
| `review-contribution` | Knowledge base moderation |

### External APIs

| Service | Data |
|---------|------|
| **Hiro Stacks API** | Block height, transactions, mempool, PoX cycle, STX locked, signers |
| **CoinGecko** | STX/BTC price, market cap, 24h volume |

### Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User data: display name, username, avatar, age level |
| `topic_progress` | Per-user topic exploration state |
| `knowledge_base` | Community entries (approved/pending/rejected) |
| `knowledge_votes` | Upvote/downvote per entry |
| `knowledge_comments` | Threaded discussions |
| `user_roles` | Admin/moderator/user RBAC |

---

## 6. Roadmap

### ✅ Q0 — Foundation (Completed, Live)
- [x] SAMMY AI chat with streaming SSE
- [x] 8 topic learning paths with persistent DB progress tracking
- [x] 50+ question quiz with timed mode and explanations
- [x] Live metrics dashboard (Hiro + CoinGecko, 60s refresh)
- [x] 36+ dApp showcase with category filtering
- [x] Email + Stacks wallet authentication
- [x] Age-adaptive modes (locked after onboarding)
- [x] Achievement badges and profile achievement wall
- [x] Community knowledge base with moderation pipeline
- [x] Voice narration (text-to-speech edge function)
- [x] AI-generated infographics
- [x] Admin panel with role-based content moderation

### 🔄 Q1 — Engagement & Yield Foundation (Months 1–3)
- [ ] PoX treasury launch
- [ ] In-app Gold/Silver/Bronze yield tier dashboard
- [ ] Weekly quiz events with yield bonuses
- [ ] Leaderboard system
- [ ] Structured learning paths (Beginner → Intermediate → Advanced)
- [ ] Bug fixes and performance optimization

**Q1 KPI Targets:**

| Metric | Target |
|--------|--------|
| New Installs | 40 |
| Monthly Active Users | 80 |
| Wallet Connects | 30 |
| Course Finishers | 20 |

### 🔮 Q2 — Growth & Integration (Months 4–6)
- [ ] Multi-language support (Spanish, Portuguese, Turkish)
- [ ] On-chain achievement NFTs (SIP-009)
- [ ] DeFiLlama TVL integration
- [ ] Yield smart contract V1 (Clarity)
- [ ] 5 ecosystem project partner campaigns
- [ ] PWA / mobile-optimized experience

**Q2 KPI Targets:**

| Metric | Target |
|--------|--------|
| New Installs (cumulative) | 100 |
| Monthly Active Users | 250 |
| Wallet Connects (cumulative) | 30 |
| Course Finishers (cumulative) | 60 |

### 🔮 Q3 — Scale & Sustainability (Months 7–9)
- [ ] Public API — embeddable SAMMY widget for partner sites
- [ ] Builder spotlight features
- [ ] Yield smart contract V2 (audited)
- [ ] DAO governance preparation
- [ ] Analytics dashboard for platform insights

**Q3 KPI Targets:**

| Metric | Target |
|--------|--------|
| Monthly Active Users | 500 |
| Monthly AI Conversations | 10,000 |
| Knowledge Base Entries | 200+ |
| Partner Integrations | 5+ |

### 🔮 Q4 — Long-Term Sustainability (Months 10–12)
- [ ] Stacks Academy Certification (on-chain NFT certificates, SIP-009)
- [ ] Premium subscription tier
- [ ] DAO treasury handoff[Hd]
- [ ] Year 1 Impact Report
- [ ] Follow-up grant application

**Q4 KPI Targets:**

| Metric | Target |
|--------|--------|
| Monthly Active Users | 300+ |
| Total Installs | 300+ |
| On-chain Certifications | 300+ |
| DAO Governance Live | ✅ |

---

## 7. Summary

| | |
|---|---|
| **Problem** | Stacks is hard to learn; no incentive exists to try |
| **Solution** | SAMMY THE AI teaches Stacks at any level and rewards learners with PoX yield |
| **Yield Model** | Treasury STX stacked via PoX → BTC yield split: Gold 50%, Silver 30%, Bronze 15%, Platform 5% |
| **Principal Safety** | Only yield distributed — treasury principal never touched |
| **Who Benefits** | New users, holders, developers, ecosystem projects, Stacks Foundation |
| **Tech** | React 18 + PostgreSQL + AI + Hiro/CoinGecko APIs + Clarity yield contracts |
| **Status** | Live in production at [smentorai.lovable.app](https://smentorai.lovable.app) |

---

**Website:** [smentorai.lovable.app](https://smentorai.lovable.app) | **AI:** SAMMY THE AI | **Built on:** [Stacks](https://stacks.org/)

*Last updated: March 2026*
