# 🏛️ SMentor — Grant Proposal

## Stacks Ecosystem Educational AI Platform

**Project Name:** SMentor  
**Applicant:** [Your Name / Organization]  
**Date:** March 2026  
**Requested Amount:** [Amount in STX / USD]  
**Grant Category:** Education, Developer Onboarding, Community Growth & DeFi Innovation  
**Live Demo:** [https://smentorai.lovable.app](https://smentorai.lovable.app)  
**Repository:** [GitHub Repository URL]

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Technical Architecture](#4-technical-architecture)
5. [Features & Functionality](#5-features--functionality)
6. [Yield Generation & Reward System](#6-yield-generation--reward-system)
7. [Ecosystem Impact](#7-ecosystem-impact)
8. [User Journey](#8-user-journey)
9. [Technology Stack](#9-technology-stack)
10. [Roadmap & Milestones](#10-roadmap--milestones)
11. [Team](#11-team)
12. [Budget Breakdown](#12-budget-breakdown)
13. [Sustainability Plan](#13-sustainability-plan)
14. [Metrics & KPIs](#14-metrics--kpis)
15. [Appendix](#15-appendix)

---

## 1. Executive Summary

**SMentor** is an AI-powered, interactive educational platform purpose-built for the Stacks blockchain ecosystem. It serves as a comprehensive onboarding and learning companion that transforms how newcomers and intermediate users understand Stacks architecture, Clarity smart contracts, DeFi protocols, sBTC, NFTs, and the broader Bitcoin Layer ecosystem.

Unlike static documentation or generic chatbots, SMentor provides:

- **Personalized AI conversations** powered by frontier LLMs with deep, up-to-date Stacks ecosystem knowledge
- **Age-adaptive content delivery** (child, teen, adult modes) to expand the learning audience
- **Gamified progression** with topic tracking, achievements, and shareable badges
- **Live ecosystem metrics** fetched from the Hiro Stacks API and CoinGecko in real-time
- **Community-contributed knowledge base** with moderation, voting, and commenting
- **36+ dApp showcase** directory connecting learners directly to the ecosystem
- **Voice narration** via text-to-speech for accessibility
- **AI-generated infographics** for complex concept visualization
- **Interactive quiz system** with 50+ questions across 6 categories
- **PoX-powered yield rewards** — users earn yield generated from treasury STX stacked through Proof of Transfer, distributed weekly based on engagement tiers

The platform has been built end-to-end and is live in production at [smentorai.lovable.app](https://smentorai.lovable.app).

---

## 2. Problem Statement

### The Onboarding Gap

The Stacks ecosystem has experienced explosive growth — the Nakamoto upgrade, sBTC launch (1,000 BTC cap filled in 4 days), Dual Stacking, WalletConnect integration, BitGo partnership, and Circle's USDCx stablecoin have all accelerated adoption. However, the ecosystem faces critical onboarding challenges:

1. **Fragmented Information**: Knowledge about Stacks is scattered across docs.stacks.co, Hiro documentation, blog posts, Discord channels, Twitter/X threads, and community forums. New users struggle to find authoritative, current information in one place.

2. **Technical Complexity Barrier**: Concepts like Proof of Transfer, Clarity's decidability, sBTC threshold signatures, and Nakamoto finality are inherently complex. Traditional documentation fails to explain these at varying levels of understanding.

3. **Rapid Ecosystem Evolution**: The Stacks ecosystem evolves rapidly (Satoshi upgrades roadmap, Clarity 4 WASM, fee abstraction, self-minting sBTC). Static resources quickly become outdated.

4. **Limited Interactive Learning**: Most crypto education is passive (read articles, watch videos). There's no interactive, adaptive learning tool specifically for Stacks.

5. **Community Knowledge Silos**: Valuable insights from community members, builders, and power users remain locked in chat messages and threads rather than being aggregated and shared.

6. **No Incentive Alignment**: Existing educational platforms offer no financial incentive for learners to engage deeply. There is no mechanism that rewards consistent learning with real yield.

### Market Gap

| Platform | Interactive AI | Stacks-Specific | Gamification | Live Data | Community KB | Yield Rewards |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| docs.stacks.co | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hiro Docs | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| ChatGPT | ✅ | ❌ (generic) | ❌ | ❌ | ❌ | ❌ |
| **SMentor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Solution Overview

SMentor addresses these challenges through a multi-layered educational platform with built-in economic incentives:

### Core Philosophy
> *"Learn Stacks. Earn from Stacks."*

The platform is powered by "Sammy" — an AI mentor with deep, comprehensive knowledge of the Stacks ecosystem. Rather than a sterile documentation chatbot, users engage in meaningful, contextual conversations that adapt to their level and interests. Crucially, active learners are rewarded with real yield generated by the SMentor treasury's participation in PoX stacking.

### Key Differentiators

- **Ecosystem-Native AI**: The AI system prompt contains 1,600+ lines of carefully curated, up-to-date Stacks knowledge spanning architecture, DeFi protocols, NFTs, memecoins, security, wallets, sBTC, Dual Stacking, and community sentiment.

- **PoX Yield Integration**: SMentor operates a treasury that stacks STX via Proof of Transfer. The BTC yield generated is distributed weekly to engaged learners through a tiered system (Gold, Silver, Bronze) — **principal is never touched, only yield is distributed**.

- **Living Knowledge**: Community members can contribute knowledge entries that, after admin moderation, feed back into the AI's responses — creating a self-improving knowledge loop.

- **Real-Time Data Integration**: Live metrics from the Hiro Stacks API (block height, transactions, mempool, PoX cycle, STX locked) and CoinGecko (prices) ground conversations in current reality.

- **Quiz-Boosted Yield**: Weekly quiz participants earn additional yield bonuses on top of their tier allocation, creating a direct financial incentive for ongoing education.

---

## 4. Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   Chat   │ │Community │ │  Quiz &  │ │  dApp  │ │
│  │Interface │ │Sentiment │ │Achieve.  │ │Showcase│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┘ │
│       │             │            │                   │
│  ┌────┴─────────────┴────────────┴───────────────┐  │
│  │          Supabase Client SDK                  │  │
│  └────┬─────────────┬────────────┬───────────────┘  │
└───────┼─────────────┼────────────┼───────────────────┘
        │             │            │
┌───────┴─────────────┴────────────┴───────────────────┐
│                 BACKEND (Lovable Cloud)               │
│                                                       │
│  ┌─────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │  defi-chat  │  │stacks-metrics │  │  generate-  │  │
│  │ Edge Func.  │  │  Edge Func.   │  │ infographic │  │
│  │(AI + Stream)│  │(Hiro+CoinGek.)│  │ Edge Func.  │  │
│  └──────┬──────┘  └───────┬───────┘  └──────┬──────┘  │
│         │                 │                  │         │
│  ┌──────┴─────────────────┴──────────────────┴─────┐  │
│  │              Lovable AI Gateway                  │  │
│  │         (LLM Access - No API Key Needed)        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                 │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────┐ │  │
│  │  │knowledge_   │  │topic_progress│  │profiles│ │  │
│  │  │base + votes │  │              │  │        │ │  │
│  │  └─────────────┘  └──────────────┘  └────────┘ │  │
│  │          + Row Level Security (RLS)             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────┐  ┌─────────────────────────────┐  │
│  │text-to-speech  │  │review-contribution           │  │
│  │Edge Function   │  │Edge Function (Admin)         │  │
│  └────────────────┘  └─────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
        │                    │
        ▼                    ▼
┌──────────────┐    ┌──────────────────┐
│  Hiro Stacks │    │    CoinGecko     │
│     API      │    │       API        │
│ (Block data, │    │  (STX/BTC Price) │
│  PoX, TXs)   │    │                  │
└──────────────┘    └──────────────────┘
```

### Data Flow

1. **User Authentication**: Email/password + Stacks wallet connect with session management
2. **AI Chat**: Streaming SSE responses from the `defi-chat` edge function, integrating community knowledge dynamically from the database
3. **Live Metrics**: The `stacks-metrics` edge function aggregates data from Hiro API endpoints (`/v2/info`, `/extended/v1/tx`, `/v2/pox`) and CoinGecko
4. **Knowledge Contributions**: User submissions → admin review via `review-contribution` edge function → approved entries feed back into AI context
5. **Progress Tracking**: Topic exploration persisted in `topic_progress` table with RLS policies ensuring per-user data isolation
6. **Yield Distribution**: Treasury STX stacked via PoX → BTC yield distributed weekly proportionally to engagement tier

### Security Model

- **Row Level Security (RLS)** on all database tables
- **Authentication required** for all interactive features
- **Admin role system** (`user_roles` table with `app_role` enum) for moderation
- **Rate limiting** on AI chat and infographic generation
- **Post-condition validation** on all database mutations
- **No exposed API keys** — all external calls routed through edge functions
- **Treasury Principal Isolation** — only yield distributed, never stacked principal

---

## 5. Features & Functionality

### 5.1 AI-Powered Chat Interface (Sammy)

The core of SMentor is an intelligent conversational interface that provides expert-level Stacks ecosystem knowledge.

**Capabilities:**
- Streaming responses (Server-Sent Events) for real-time chat experience
- 1,600+ lines of curated system prompt covering all major Stacks topics
- Dynamic integration of community-contributed knowledge entries
- Age-adaptive responses (child-friendly, teen, adult modes)
- Automatic infographic generation for complex topics
- Voice narration (text-to-speech) for accessibility
- Context-aware follow-up conversations

**Topics Covered:**
| Domain | Key Areas |
|--------|-----------|
| Architecture | Proof of Transfer, Nakamoto upgrade, Bitcoin finality, Signers, microblocks |
| Clarity | Decidability, post-conditions, traits, SIP standards, data types, functions |
| DeFi | Zest, Granite, Bitflow, ALEX, Arkadiko, Velar, Hermetica, USDCx |
| sBTC | Peg mechanism, deposit caps, withdrawal process, security partnerships |
| NFTs | Gamma marketplace, The Guests, BNS, Ordinals bridge, collection categories |
| Memecoins | WELSH, LEO, NOT, DOG, Teiko — trading on Bitflow, Velar, ALEX |
| Dual Stacking | STX + sBTC yield strategies, StackingDAO, conservative/moderate/aggressive |
| Security | Xverse, Leather, Asigna, Fordefi wallets, best practices |
| Community | DeFAI trend, institutional adoption, Stacks Ascent, Nakamojo culture |

### 5.2 Interactive Quiz System

A comprehensive 50+ question assessment spanning 6 categories:

- **Architecture & Consensus** (10 questions): PoX, Nakamoto, Signers, mining, 51% attack resistance
- **Clarity Language** (15 questions): decidability, types, principals, traits, built-ins, maps, post-conditions
- **DeFi & sBTC** (10 questions): sBTC mechanics, deposit caps, withdrawal timeline, Zest, Granite
- **NFTs** (5 questions): SIP-009, Gamma, BNS, Ordinals
- **Security** (5 questions): wallet security, post-conditions, key management
- **Advanced** (5 questions): economic model, fee structures, governance

**Features:**
- Timed mode (optional) with per-question countdown
- Detailed explanations for every answer
- Score tracking with streak bonuses
- Category-based filtering
- **Weekly quiz yield bonus** — top quiz participants earn additional yield distribution on top of their tier allocation

### 5.3 Community Knowledge Base

A collaborative, moderated knowledge repository:

- **Submission**: Users contribute knowledge entries with topic, content, category, optional links, and image attachments
- **Moderation**: Admin review pipeline with approve/reject workflow
- **Voting**: Community upvote/downvote system to surface quality content
- **Comments**: Threaded discussions on knowledge entries
- **AI Integration**: Approved entries are dynamically fetched and injected into the AI system prompt
- **Categories**: General, NFTs, DeFi, Stacking, Clarity, sBTC, Security, Architecture

### 5.4 Live Community Sentiment Dashboard

Real-time ecosystem pulse dashboard featuring:

- **Live Metrics**: STX price, BTC price, block height, transactions, mempool size, PoX cycle, STX locked, signers count — all fetched from Hiro API and CoinGecko
- **Trending Topics**: Curated trending discussions (Dual Stacking, sBTC milestones, BitGo, Clarity 4 WASM, DeFAI)
- **Community Hot Takes**: Highlighted community quotes and sentiment
- **Auto-refresh**: Metrics update every 60 seconds
- **Sentiment Meter**: Aggregated bullish/bearish sentiment indicator

### 5.5 dApp Showcase Directory

A curated directory of 36+ Stacks ecosystem applications:

| Category | dApps |
|----------|-------|
| **DeFi** | Zest, Bitflow, ALEX, Arkadiko, Velar, Hermetica, Granite, FastPool, Brotocol, Charisma, STX City, Moonlabs |
| **NFT** | Gamma, BNS Market, Boom, Tradeport |
| **Wallets** | Leather, Xverse, Ryder, Asigna |
| **Tools** | Hiro, STX Tools, BoostX, BlockSurvey, LunarCrush, STX20, STX Watch, Indexer, BNS One |
| **Other** | Sigle, FAK, Zero Authority DAO, Chess on Chain, Stone Zone, Deorganized, Skullcoin |

Each entry includes: name, tagline, URL, logo, category, description, highlights, and rating.

### 5.6 Gamification & Achievements

**Topic Progress Tracking:**
- 8 core topics with visual progress bar
- Persistent progress stored in database (per-user)
- Explored/unexplored state with animated indicators

**Achievement Badges:**
- 7 unlockable achievements (Explorer, Scholar, DeFi Degen, etc.)
- Animated badge reveals with spring physics
- Shareable achievements (Twitter/X integration)
- "All Topics Mastered" completion bonus

### 5.7 AI-Generated Infographics

For complex topics, the system automatically detects when a visual explanation would help and generates educational infographics:

- Triggered by complex keyword detection (Proof of Transfer, consensus, architecture, etc.)
- Dark theme design with Stacks/Bitcoin brand colors
- Generated via frontier AI image models
- Appended to assistant messages inline

### 5.8 Voice Narration

Text-to-speech capability for all AI responses:
- Powered by the `text-to-speech` edge function
- Accessible learning for visually impaired users
- Optional per-message playback controls

### 5.9 User Profiles & Authentication

- Email/password authentication + Stacks wallet connect (Xverse/Leather)
- Customizable display name, username, and avatar
- Contributor badges based on knowledge base participation
- Admin panel for moderators
- Learning level selector (age-adaptive: child / teen / adult)

---

## 6. Yield Generation & Reward System

### Overview

SMentor operates a **treasury** that stacks STX through the Stacks **Proof of Transfer (PoX)** mechanism. This generates BTC yield every PoX cycle (~2 weeks). The yield — **never the principal** — is distributed weekly to platform participants based on their engagement tier.

This creates a sustainable, self-funding reward loop: the more users learn and engage with SMentor, the more yield they share in.

```
SMentor Treasury
      │
      ▼ (STX stacked via PoX)
Stacks PoX Mechanism
      │
      ▼ (BTC yield earned each cycle)
Yield Pool
      │
      ├──▶ 🥇 Gold   → 50% of weekly yield
      ├──▶ 🥈 Silver → 30% of weekly yield
      ├──▶ 🥉 Bronze → 15% of weekly yield
      └──▶ 🏛️ Platform →  5% of weekly yield (operations & development)
```

### Tier Qualification

Users qualify for tiers based on **weekly engagement score** — a composite metric of:

| Activity | Points |
|----------|--------|
| Daily chat sessions (AI) | +5 pts/day |
| Topic explored | +10 pts/topic |
| Quiz completed | +20 pts/quiz |
| Weekly quiz top 10 finisher | +50 pts bonus |
| Knowledge contribution (approved) | +30 pts |
| Consecutive day streak (7-day) | +25 pts bonus |

**Tier Thresholds:**

| Tier | Weekly Points Required | Yield Share |
|------|------------------------|-------------|
| 🥇 **Gold** | 150+ points | 50% of weekly yield pool |
| 🥈 **Silver** | 75–149 points | 30% of weekly yield pool |
| 🥉 **Bronze** | 25–74 points | 15% of weekly yield pool |
| 🏛️ **Platform** | N/A | 5% of weekly yield pool (ops) |

> Each tier's yield share is distributed **pro-rata** among all users in that tier for the week.

### Weekly Quiz Yield Bonus

Every week, SMentor hosts a **timed quiz event**. Participants who complete the quiz earn bonus yield on top of their tier allocation:

| Quiz Rank | Bonus |
|-----------|-------|
| 🥇 Top 3 finishers | +10% of their tier yield allocation |
| Top 10 finishers | +5% of their tier yield allocation |
| All completers | +2% of their tier yield allocation |

Quiz bonuses are funded from the platform's 5% share — ensuring no dilution to tier holders.

### Treasury Principles

1. **Principal is sacred**: Only yield generated by PoX stacking is ever distributed. The stacked STX principal in the treasury is never touched or spent.
2. **Transparency**: All treasury stacking activity, yield generated, and distribution records are publicly verifiable on-chain.
3. **Sustainability**: The 5% platform share covers infrastructure costs, reducing dependency on grant-only funding over time.
4. **Non-custodial intent**: Long-term roadmap includes migrating to a smart contract-controlled treasury for fully trustless yield distribution.

---

## 7. Ecosystem Impact

### Direct Benefits to Stacks

1. **Reduced Onboarding Friction**: New users can go from zero to understanding PoX, sBTC, and Clarity in a single interactive session rather than spending hours across multiple documentation sites.

2. **Developer Pipeline**: The comprehensive Clarity quiz and AI explanations help aspiring developers learn the language faster, increasing the pool of Stacks builders.

3. **dApp Discovery**: The 36+ dApp showcase directly drives traffic to ecosystem projects — DeFi protocols, wallets, NFT marketplaces, and tools.

4. **Community Engagement**: The knowledge base creates a virtuous cycle where experienced users contribute knowledge that helps newcomers, strengthening community bonds.

5. **Real-Time Ecosystem Visibility**: Live metrics from the Hiro API give users an always-current view of network health, sBTC adoption, and stacking participation.

6. **PoX Adoption Signal**: SMentor's treasury stacking increases total STX locked in PoX, positively impacting network security and stacking yields for all participants.

7. **Incentivized Education**: Yield rewards for learning create a novel, replicable model for blockchain education — learning earns you real yield.

### Projected KPI Targets (Screenshot-Verified)

| Metric | Month 1 Target | Month 6 Target | Notes |
|--------|:-:|:-:|-------|
| **New Installs** | 400 | 1,200 | Slow organic growth; no "hype" spikes |
| **Monthly Active Users (MAU)** | 150 | 500 | Assumes ~15% monthly churn |
| **Wallet Connects** | 40 | 120 | Only "hardcore" users will link wallets |
| **Course Finishers** | 60 | 200 | Focus on 1–2 key modules only |

---

## 8. User Journey

```
┌─────────────────┐
│  User arrives   │
│  at SMentor     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Sign up / Login │────▶│  Landing Page    │
│  Email or Wallet │     │  (Hero + Sammy)  │
└─────────────────┘     └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │  Start   │ │  Take    │ │  Explore │
            │  Chat    │ │  Quiz    │ │  dApps   │
            └────┬─────┘ └────┬─────┘ └──────────┘
                 │            │
                 ▼            ▼
          ┌──────────┐ ┌──────────────┐
          │ Explore  │ │ Score & Earn │
          │ 8 Topics │ │ Quiz Yield   │
          └────┬─────┘ └──────────────┘
               │
               ▼
        ┌──────────────┐
        │   Unlock     │
        │ Achievements │
        └──────┬───────┘
               │
     ┌─────────┼─────────────┐
     ▼         ▼             ▼
┌────────┐┌────────┐┌──────────────────┐
│Share on││Contrib.││ Earn PoX Yield   │
│Twitter ││Knowl.  ││ (Gold/Silver/    │
└────────┘└────────┘│  Bronze Tiers)  │
                    └──────────────────┘
```

---

## 9. Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks and functional components |
| **TypeScript** | Type safety across the entire codebase |
| **Vite** | Build tool with HMR and optimized production builds |
| **Tailwind CSS** | Utility-first styling with dark theme design system |
| **Framer Motion** | Physics-based animations and page transitions |
| **shadcn/ui** | Accessible, customizable component library (30+ components used) |
| **React Router** | Client-side routing with protected routes |
| **TanStack Query** | Server state management and caching |
| **react-markdown** | Markdown rendering for AI responses |
| **@stacks/connect** | Stacks wallet connection (Xverse, Leather) |

### Backend (Lovable Cloud)
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Relational database with 6 tables |
| **Row Level Security** | Per-user data isolation and access control |
| **Edge Functions (Deno)** | 5 serverless functions for AI, metrics, TTS, infographics, moderation |
| **Supabase Auth** | Email/password + wallet authentication |
| **Supabase Storage** | Image uploads for knowledge base contributions |

### External APIs
| API | Purpose |
|-----|---------|
| **Hiro Stacks API** | Block data, transactions, PoX cycles, mempool, STX supply |
| **CoinGecko API** | STX and BTC price data |
| **Lovable AI Gateway** | LLM access (Gemini, GPT) for chat and infographic generation |

### Database Schema

```sql
-- 6 Tables with RLS

knowledge_base        -- Community knowledge entries (topic, content, category, votes, links, images)
knowledge_comments    -- Threaded comments on knowledge entries
knowledge_votes       -- Per-user vote tracking (up/down)
profiles              -- User display names, avatars, usernames, age_level
topic_progress        -- Per-user topic exploration tracking
user_roles            -- Admin/moderator/user role assignments
```

---

## 10. Roadmap & Milestones

All milestones are **quarterly**. Each quarter ends with a public impact report delivered to the Stacks Foundation.

---

### ✅ Quarter 0 — Platform Foundation (Pre-Grant / Completed)

- [x] AI chat interface (Sammy) with streaming responses
- [x] 8-topic learning curriculum with progress tracking
- [x] 50+ question quiz system with 6 categories
- [x] Community knowledge base with voting and comments
- [x] 36+ dApp showcase directory
- [x] Achievement system with shareable badges
- [x] User authentication (email + Stacks wallet)
- [x] Admin moderation panel
- [x] Voice narration (text-to-speech)
- [x] Age-adaptive content delivery (child/teen/adult)
- [x] AI-generated infographics
- [x] Live sentiment dashboard with real-time Hiro API metrics
- [x] Mobile-responsive design

**Deliverable:** Live production platform at [smentorai.lovable.app](https://smentorai.lovable.app)

---

### 🔵 Quarter 1 — Engagement & Yield Foundation (Months 1–3)

**Goals:** Activate users, launch yield system, hit Month 1 KPIs

- [ ] **PoX Treasury Launch**: Stack initial treasury STX via PoX; begin yield accumulation
- [ ] **Yield Tier Dashboard**: In-app dashboard showing user's current tier, weekly points, and estimated yield
- [ ] **Weekly Quiz Events**: Scheduled weekly quiz competitions with yield bonus distribution
- [ ] **Leaderboard System**: Weekly/monthly leaderboards for quiz scores and knowledge contributions
- [ ] **Learning Paths**: Structured multi-step learning journeys (Beginner → Intermediate → Advanced)
- [ ] **Wallet Connect Onboarding**: Full Xverse/Leather wallet connect with onboarding flow
- [ ] **Bug fixes & performance optimization**: Address all known issues from Q0 testing

**Q1 KPI Targets:**
| Metric | Target |
|--------|--------|
| New Installs | 400 |
| Monthly Active Users | 150 |
| Wallet Connects | 40 |
| Course Finishers | 60 |
| First Yield Distribution | ✅ Done |

**Q1 Deliverable:** Public report — installs, MAU, wallet connects, first yield cycle completed

---

### 🟡 Quarter 2 — Growth & Ecosystem Integration (Months 4–6)

**Goals:** Scale user base, deepen yield mechanics, integrate ecosystem partners

- [ ] **Multi-language Support**: Spanish, Portuguese, Turkish localization
- [ ] **DeFiLlama TVL Integration**: Real-time Total Value Locked data for Stacks DeFi
- [ ] **On-chain Achievement NFTs**: Mint achievement badges as SIP-009 NFTs on Stacks
- [ ] **Community Challenges**: Weekly themed ecosystem challenges with yield bonuses
- [ ] **Partner Integrations**: 5 ecosystem project co-marketing campaigns
- [ ] **Yield Smart Contract V1**: Move treasury to audited Clarity smart contract for trustless yield distribution
- [ ] **PWA / Mobile**: Progressive Web App with push notifications

**Q2 KPI Targets:**
| Metric | Target |
|--------|--------|
| New Installs | 800 (cumulative: 1,200) |
| Monthly Active Users | 350 |
| Wallet Connects | 80 (cumulative: 120) |
| Course Finishers | 140 (cumulative: 200) |
| Total Yield Distributed | [Target TBD by treasury size] |

**Q2 Deliverable:** Public report — growth metrics, yield totals distributed, NFT certificates minted

---

### 🟢 Quarter 3 — Scale, Sustainability & DAO Readiness (Months 7–9)

**Goals:** Reach full scale, expand revenue channels, prepare governance

- [ ] **Stacks Grants Progress Tracker**: Public dashboard tracking grant milestone completion
- [ ] **API for Partners**: Public API for ecosystem projects to embed SMentor chat widget
- [ ] **Builder Spotlight**: Featured interviews and profiles of Stacks developers
- [ ] **Advanced Analytics**: User engagement analytics available to platform admins
- [ ] **Yield Smart Contract V2**: Full audit, open-source, community-verified contract
- [ ] **DAO Governance Prep**: Community voting on content priorities and feature roadmap

**Q3 KPI Targets:**
| Metric | Target |
|--------|--------|
| Monthly Active Users | 500 |
| Monthly AI Conversations | 10,000 |
| Total Yield Distributed | [Cumulative from Q1-Q3] |
| Ecosystem Partner Integrations | 5+ |
| Knowledge Base Entries (approved) | 200+ |

**Q3 Deliverable:** Public impact report — full 9-month metrics, yield program analysis, DAO governance proposal

---

### 🔴 Quarter 4 — Long-Term Sustainability (Months 10–12)

**Goals:** Self-sustaining revenue, DAO handoff, certifications, expanded yield

- [ ] **Stacks Academy Certification**: Verifiable on-chain certificates (SIP-009 NFTs) for course completions
- [ ] **Premium Features**: Advanced analytics, unlimited AI, exclusive content — funded by premium subscriptions
- [ ] **DAO Treasury**: Community-managed governance of SMentor treasury and yield parameters
- [ ] **Mobile App**: Native iOS/Android app for on-the-go learning
- [ ] **Follow-up Grant Application**: Apply based on Q1–Q4 demonstrated impact metrics
- [ ] **Year 1 Impact Report**: Publish comprehensive impact report (users, retention, yield distributed, ecosystem referrals)

**Q4 KPI Targets:**
| Metric | Target |
|--------|--------|
| Monthly Active Users | 1,000+ |
| Total Installs | 3,000+ |
| Total Yield Distributed | [Full year cumulative] |
| On-chain Certifications Minted | 500+ |
| DAO Governance Live | ✅ |

**Q4 Deliverable:** Year 1 Impact Report + DAO governance handoff + follow-up grant application

---

## 11. Team

| Role | Responsibilities |
|------|-----------------|
| **Project Lead** | Strategy, ecosystem partnerships, grant management, treasury oversight |
| **Full-Stack Developer** | React/TypeScript frontend, Lovable Cloud backend, edge functions |
| **AI/Content Engineer** | System prompt curation, knowledge base quality, AI tuning, quiz content |
| **Community Manager** | Knowledge base moderation, user engagement, social media, weekly quiz events |
| **Smart Contract Engineer** | Clarity yield contract development, treasury management, security audits |
| **Designer** | UI/UX refinement, infographic templates, brand identity |

*[Insert team member details, backgrounds, and relevant experience]*

---

## 12. Budget Breakdown

| Category | Amount | % of Total | Description |
|----------|--------|:---:|-------------|
| **Development** | $XX,XXX | 35% | Frontend features, backend infrastructure, yield dashboard, API integrations |
| **Smart Contract / Yield** | $XX,XXX | 20% | Clarity yield contract development, security audit, treasury tooling |
| **AI & Infrastructure** | $XX,XXX | 20% | LLM API costs, hosting, edge function compute, database |
| **Content & Curation** | $XX,XXX | 10% | System prompt maintenance, quiz content, weekly quiz management |
| **Community & Marketing** | $XX,XXX | 10% | User acquisition, social campaigns, ecosystem partnerships |
| **Design & UX** | $XX,XXX | 3% | Visual polish, accessibility improvements, mobile optimization |
| **Contingency** | $XX,XXX | 2% | Unexpected costs, scaling needs |
| **Total** | **$XX,XXX** | **100%** | |

---

## 13. Sustainability Plan

### Short-term (Q1–Q2)
- Grant funding covers development and infrastructure costs
- PoX treasury begins generating yield — platform's 5% share covers partial operational costs
- Community growth through organic sharing and ecosystem partnerships

### Medium-term (Q2–Q3)
- **Freemium Model**: Core features remain free; premium features (unlimited AI, advanced analytics, certifications) behind subscription
- **Ecosystem Sponsorships**: Featured placements in dApp showcase for ecosystem projects
- **Partnership Revenue**: White-label educational modules for Stacks ecosystem projects
- **Yield Treasury Growth**: As more users engage, treasury STX grows, increasing yield for all tiers

### Long-term (Q4+)
- **On-chain Revenue**: NFT achievement minting fees, certification fees
- **DAO Treasury**: Community-managed treasury from premium subscriptions
- **Self-Sustaining PoX Yield**: Mature yield program requires no external funding to operate
- **Grant Renewals**: Continued ecosystem grants based on demonstrated Q1–Q4 impact metrics

---

## 14. Metrics & KPIs

### Primary KPIs (from market analysis)

| Metric | Month 1 | Month 6 | Sentiment Note |
|--------|:-------:|:-------:|----------------|
| **New Installs** | 400 | 1,200 | Slow organic growth; no "hype" spikes |
| **Monthly Active Users** | 150 | 500 | Assumes ~15% monthly churn |
| **Wallet Connects** | 40 | 120 | Only "hardcore" users will link wallets |
| **Course Finishers** | 60 | 200 | Focus on 1–2 key modules only |

### Secondary Engagement KPIs

| Metric | Target (6mo) | Measurement |
|--------|:---:|-------------|
| **AI Conversations** | 20,000 | Total chat messages sent |
| **Quiz Completions** | 5,000 | Full quiz sessions completed |
| **Knowledge Contributions** | 200 | Approved community entries |
| **Topic Completion Rate** | 25% | Users exploring all 8 topics |
| **dApp Referrals** | 10,000 | Click-throughs to ecosystem dApps |

### Yield & Financial KPIs

| Metric | Measurement |
|--------|-------------|
| Total STX Stacked (Treasury) | STX locked in PoX via SMentor treasury |
| Weekly Yield Generated | BTC yield per cycle from PoX |
| Total Yield Distributed | Cumulative yield paid to Gold/Silver/Bronze tiers |
| Gold Tier Users | Weekly users qualifying at 150+ pts |
| Silver Tier Users | Weekly users qualifying at 75–149 pts |
| Bronze Tier Users | Weekly users qualifying at 25–74 pts |
| Weekly Quiz Participation Rate | % of MAU participating in weekly quiz |

### Quality KPIs

| Metric | Measurement |
|--------|-------------|
| Average Session Duration | Time spent per visit |
| Achievement Unlock Rate | % of users earning badges |
| Knowledge Base Vote Ratio | Upvote-to-downvote ratio |
| Return User Rate | Users returning within 7 days |
| Social Shares | Achievement shares on Twitter/X |
| Net Promoter Score | User satisfaction survey |

### Reporting Schedule

- **Weekly**: Internal yield distribution records + quiz participation
- **Monthly**: Public metrics dashboard — usage, growth, and ecosystem impact
- **Quarterly**: Formal grant milestone report with full budget tracking and KPI analysis
- **Annually**: Comprehensive Year 1 Impact Report — users, retention, yield distributed, ecosystem referrals

---

## 15. Appendix

### A. Edge Functions Summary

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `defi-chat` | `/functions/v1/defi-chat` | AI chat with streaming SSE, community knowledge integration, age-adaptive responses |
| `stacks-metrics` | `/functions/v1/stacks-metrics` | Live data aggregation from Hiro API + CoinGecko |
| `generate-infographic` | `/functions/v1/generate-infographic` | AI-generated educational infographics |
| `text-to-speech` | `/functions/v1/text-to-speech` | Voice narration for AI responses |
| `review-contribution` | `/functions/v1/review-contribution` | Admin knowledge moderation workflow |

### B. Database Tables & RLS

All tables enforce Row Level Security. Users can only read/write their own data. Admin roles provide elevated access for moderation.

| Table | Rows (est.) | RLS Policy Summary |
|-------|:-:|-------------|
| `knowledge_base` | 100+ | Approved entries readable by all; users can insert own entries |
| `knowledge_comments` | 200+ | Readable by all; users can insert own comments |
| `knowledge_votes` | 500+ | Users can manage their own votes |
| `profiles` | 100+ | Public read; users can update their own profile |
| `topic_progress` | 500+ | Users can only access their own progress |
| `user_roles` | 10+ | Read-only; managed by admin |

### C. AI System Prompt Coverage

The `defi-chat` edge function contains a 1,600+ line system prompt covering:

- Complete Stacks architecture (PoX, Nakamoto, Signers, microblocks)
- Clarity language reference (types, functions, patterns, SIP standards)
- All major DeFi protocols with current metrics
- sBTC mechanics, rollout timeline, and cap history
- NFT ecosystem (Gamma, collections, BNS, Ordinals)
- Memecoin landscape (WELSH, LEO, NOT, DOG, etc.)
- Dual Stacking mechanics and strategies
- Wallet comparison and security best practices
- Community sentiment and trending narratives (DeFAI, institutional adoption)
- Satoshi upgrades roadmap (Clarity 4 WASM, fee abstraction, self-minting sBTC)

### D. Component Architecture

The frontend consists of 25+ custom React components organized into:

- **Pages**: `Index.tsx` (main app with view routing), `Auth.tsx`, `Onboarding.tsx`, `NotFound.tsx`
- **Core**: `ChatInterface`, `ChatMessage`, `TopicCards`, `CommunitySentiment`
- **Interactive**: `StacksQuiz`, `NFTExplorer`, `DappShowcase`, `SearchBar`
- **Community**: `KnowledgeBase`, `KnowledgeComments`, `ContributorBadge`
- **Gamification**: `AchievementBadges`, `ShareAchievement`, `GetStartedCTA`
- **User**: `UserMenu`, `ProfileEditor`, `AdminPanel`, `ProtectedRoute`
- **Utility**: `VoiceControls`, `AgeSelector`, `PreviewModal`
- **UI Library**: 30+ shadcn/ui components (buttons, cards, dialogs, tabs, etc.)

### E. Yield Tier Distribution Example

Illustrative example assuming 1 BTC yield per week:

| Tier | Yield Pool | Example Users | Per-User Estimate |
|------|:---:|:---:|:---:|
| 🥇 Gold | 0.50 BTC | 20 users | ~0.025 BTC each |
| 🥈 Silver | 0.30 BTC | 60 users | ~0.005 BTC each |
| 🥉 Bronze | 0.15 BTC | 200 users | ~0.00075 BTC each |
| 🏛️ Platform | 0.05 BTC | Ops fund | Infrastructure |

> Actual yield depends on treasury size, PoX cycle returns, and active user counts.

---

## Contact

**Project:** SMentor — Stacks Ecosystem AI Mentor  
**Website:** [https://smentorai.lovable.app](https://smentorai.lovable.app)  
**Email:** [your-email@example.com]  
**Twitter/X:** [@your-handle]  
**Discord:** [your-discord]

---

*This proposal was prepared for the Stacks Grants Program. SMentor is an open educational platform dedicated to accelerating Stacks ecosystem adoption through AI-powered, interactive learning and PoX-powered yield rewards.*
