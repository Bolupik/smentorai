# 🏛️ The Architect — Grant Proposal

## Stacks Ecosystem Educational AI Platform

**Project Name:** The Architect  
**Applicant:** [Your Name / Organization]  
**Date:** February 2026  
**Requested Amount:** [Amount in STX / USD]  
**Grant Category:** Education, Developer Onboarding & Community Growth  
**Live Demo:** [https://smentorai.lovable.app](https://smentorai.lovable.app)  
**Repository:** [GitHub Repository URL]

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Technical Architecture](#4-technical-architecture)
5. [Features & Functionality](#5-features--functionality)
6. [Ecosystem Impact](#6-ecosystem-impact)
7. [User Journey](#7-user-journey)
8. [Technology Stack](#8-technology-stack)
9. [Roadmap & Milestones](#9-roadmap--milestones)
10. [Team](#10-team)
11. [Budget Breakdown](#11-budget-breakdown)
12. [Sustainability Plan](#12-sustainability-plan)
13. [Metrics & KPIs](#13-metrics--kpis)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

**The Architect** is an AI-powered, interactive educational platform purpose-built for the Stacks blockchain ecosystem. It serves as a comprehensive onboarding and learning companion that transforms how newcomers and intermediate users understand Stacks architecture, Clarity smart contracts, DeFi protocols, sBTC, NFTs, and the broader Bitcoin Layer ecosystem.

Unlike static documentation or generic chatbots, The Architect provides:

- **Personalized AI conversations** powered by frontier LLMs with deep, up-to-date Stacks ecosystem knowledge
- **Age-adaptive content delivery** (child, teen, adult modes) to expand the learning audience
- **Gamified progression** with topic tracking, achievements, and shareable badges
- **Live ecosystem metrics** fetched from the Hiro Stacks API and CoinGecko in real-time
- **Community-contributed knowledge base** with moderation, voting, and commenting
- **36+ dApp showcase** directory connecting learners directly to the ecosystem
- **Voice narration** via text-to-speech for accessibility
- **AI-generated infographics** for complex concept visualization
- **Interactive quiz system** with 50+ questions across 6 categories

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

### Market Gap

| Platform | Interactive AI | Stacks-Specific | Gamification | Live Data | Community KB |
|----------|:---:|:---:|:---:|:---:|:---:|
| docs.stacks.co | ❌ | ✅ | ❌ | ❌ | ❌ |
| Hiro Docs | ❌ | ✅ | ❌ | ❌ | ❌ |
| ChatGPT | ✅ | ❌ (generic) | ❌ | ❌ | ❌ |
| **The Architect** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Solution Overview

The Architect addresses these challenges through a multi-layered educational platform:

### Core Philosophy
> *"What knowledge do you seek?"*

The platform embodies the persona of "The Architect" — an AI mentor with deep, comprehensive knowledge of the Stacks ecosystem. Rather than a sterile documentation chatbot, users engage in meaningful, contextual conversations that adapt to their level and interests.

### Key Differentiators

- **Ecosystem-Native AI**: The AI system prompt contains 1,600+ lines of carefully curated, up-to-date Stacks knowledge spanning architecture, DeFi protocols, NFTs, memecoins, security, wallets, sBTC, Dual Stacking, and community sentiment.

- **Living Knowledge**: Community members can contribute knowledge entries that, after admin moderation, feed back into the AI's responses — creating a self-improving knowledge loop.

- **Real-Time Data Integration**: Live metrics from the Hiro Stacks API (block height, transactions, mempool, PoX cycle, STX locked) and CoinGecko (prices) ground conversations in current reality.

- **Gamified Exploration**: Topic progress tracking, achievement badges, and shareable milestones encourage comprehensive ecosystem exploration.

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
│                 BACKEND (Supabase / Lovable Cloud)    │
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

1. **User Authentication**: Email/password auth with session management via Supabase Auth
2. **AI Chat**: Streaming SSE responses from the `defi-chat` edge function, which integrates community knowledge dynamically from the database
3. **Live Metrics**: The `stacks-metrics` edge function aggregates data from Hiro API endpoints (`/v2/info`, `/extended/v1/tx`, `/v2/pox`) and CoinGecko
4. **Knowledge Contributions**: User submissions → admin review via `review-contribution` edge function → approved entries feed back into AI context
5. **Progress Tracking**: Topic exploration persisted in `topic_progress` table with RLS policies ensuring per-user data isolation

### Security Model

- **Row Level Security (RLS)** on all database tables
- **Authentication required** for all interactive features
- **Admin role system** (`user_roles` table with `app_role` enum) for moderation
- **Rate limiting** on AI chat and infographic generation
- **Post-condition validation** on all database mutations
- **No exposed API keys** — all external calls routed through edge functions

---

## 5. Features & Functionality

### 5.1 AI-Powered Chat Interface

The core of The Architect is an intelligent conversational interface that provides expert-level Stacks ecosystem knowledge.

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

- Email/password authentication
- Customizable display name, username, and avatar
- Contributor badges based on knowledge base participation
- Admin panel for moderators

---

## 6. Ecosystem Impact

### Direct Benefits to Stacks

1. **Reduced Onboarding Friction**: New users can go from zero to understanding PoX, sBTC, and Clarity in a single interactive session rather than spending hours across multiple documentation sites.

2. **Developer Pipeline**: The comprehensive Clarity quiz and AI explanations help aspiring developers learn the language faster, increasing the pool of Stacks builders.

3. **dApp Discovery**: The 36+ dApp showcase directly drives traffic to ecosystem projects — DeFi protocols, wallets, NFT marketplaces, and tools.

4. **Community Engagement**: The knowledge base creates a virtuous cycle where experienced users contribute knowledge that helps newcomers, strengthening community bonds.

5. **Real-Time Ecosystem Visibility**: Live metrics from the Hiro API give users an always-current view of network health, sBTC adoption, and stacking participation.

6. **Narrative Amplification**: The platform encodes and spreads key narratives (Bitcoin DeFi, Clarity security advantages, sBTC trustlessness) that are critical for ecosystem growth.

### Projected Impact Metrics

| Metric | 6-Month Target | 12-Month Target |
|--------|:-:|:-:|
| Monthly Active Users | 2,000 | 10,000 |
| Quiz Completions | 5,000 | 25,000 |
| Knowledge Contributions | 200 | 1,000 |
| dApp Referral Clicks | 10,000 | 50,000 |
| AI Conversations | 20,000 | 100,000 |
| New Stacks Users Onboarded | 500 | 5,000 |

---

## 7. User Journey

```
┌─────────────────┐
│   User arrives   │
│ at The Architect │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Sign up / Login │────▶│  Landing Page    │
│  (Email + Pass)  │     │  (Hero + Avatar) │
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
          ┌──────────┐ ┌──────────┐
          │ Explore  │ │ Score &  │
          │ 8 Topics │ │ Learn    │
          └────┬─────┘ └──────────┘
               │
               ▼
        ┌──────────────┐
        │   Unlock     │
        │ Achievements │
        └──────┬───────┘
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
┌────────┐┌────────┐┌────────────┐
│Share on││Contrib.││ View Live  │
│Twitter ││Knowl.  ││ Sentiment  │
└────────┘└────────┘└────────────┘
```

---

## 8. Technology Stack

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

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Relational database with 6 tables |
| **Row Level Security** | Per-user data isolation and access control |
| **Edge Functions (Deno)** | 5 serverless functions for AI, metrics, TTS, infographics, moderation |
| **Supabase Auth** | Email/password authentication with session management |
| **Supabase Storage** | Image uploads for knowledge base contributions |
| **Supabase Realtime** | (Available for future real-time features) |

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
profiles              -- User display names, avatars, usernames
topic_progress        -- Per-user topic exploration tracking
user_roles            -- Admin/moderator/user role assignments
```

---

## 9. Roadmap & Milestones

### Phase 1: Core Platform ✅ (Completed)

- [x] AI chat interface with streaming responses
- [x] 8-topic learning curriculum with progress tracking
- [x] 50+ question quiz system with 6 categories
- [x] Community knowledge base with voting and comments
- [x] 36+ dApp showcase directory
- [x] Achievement system with shareable badges
- [x] User authentication and profiles
- [x] Admin moderation panel
- [x] Voice narration (text-to-speech)
- [x] Age-adaptive content delivery
- [x] AI-generated infographics
- [x] Live sentiment dashboard with real-time metrics from Hiro API
- [x] Mobile-responsive design

### Phase 2: Enhanced Engagement (Months 1–3)

- [ ] **Leaderboard System**: Weekly/monthly leaderboards for quiz scores and knowledge contributions
- [ ] **Learning Paths**: Structured multi-step learning journeys (Beginner → Intermediate → Advanced)
- [ ] **Clarity Sandbox**: Integrated code playground for writing and testing Clarity snippets
- [ ] **Wallet Integration**: Connect Xverse/Leather for identity and potential NFT badge minting
- [ ] **Push Notifications**: Alerts for new community content and ecosystem updates
- [ ] **Localization**: Multi-language support (Spanish, Portuguese, Japanese, Korean)

### Phase 3: Ecosystem Integration (Months 4–6)

- [ ] **DeFiLlama TVL Integration**: Real-time Total Value Locked data for Stacks DeFi
- [ ] **On-chain Achievement NFTs**: Mint achievement badges as SIP-009 NFTs on Stacks
- [ ] **Stacks Grant Progress Tracker**: Track and display ecosystem grant milestones
- [ ] **API for Partners**: Public API for ecosystem projects to embed The Architect
- [ ] **Community Challenges**: Weekly themed challenges with STX rewards
- [ ] **Builder Spotlight**: Featured interviews and profiles of Stacks developers

### Phase 4: Scale & Sustainability (Months 7–12)

- [ ] **Premium Features**: Advanced analytics, unlimited AI conversations, exclusive content
- [ ] **DAO Governance**: Community voting on content priorities and feature development
- [ ] **Mobile App**: Native iOS/Android app for on-the-go learning
- [ ] **Stacks Academy Certification**: Verifiable on-chain certificates for course completions
- [ ] **Partnership Integrations**: Embed educational modules in ecosystem dApps

---

## 10. Team

| Role | Responsibilities |
|------|-----------------|
| **Project Lead** | Strategy, ecosystem partnerships, grant management |
| **Full-Stack Developer** | React/TypeScript frontend, Supabase backend, edge functions |
| **AI/Content Engineer** | System prompt curation, knowledge base quality, AI tuning |
| **Community Manager** | Knowledge base moderation, user engagement, social media |
| **Designer** | UI/UX refinement, infographic templates, brand identity |

*[Insert team member details, backgrounds, and relevant experience]*

---

## 11. Budget Breakdown

| Category | Amount | % of Total | Description |
|----------|--------|:---:|-------------|
| **Development** | $XX,XXX | 40% | Frontend features, backend infrastructure, API integrations |
| **AI & Infrastructure** | $XX,XXX | 25% | LLM API costs, hosting, edge function compute, database |
| **Content & Curation** | $XX,XXX | 15% | System prompt maintenance, quiz content, knowledge review |
| **Community & Marketing** | $XX,XXX | 10% | User acquisition, social campaigns, ecosystem partnerships |
| **Design & UX** | $XX,XXX | 5% | Visual polish, accessibility improvements, mobile optimization |
| **Contingency** | $XX,XXX | 5% | Unexpected costs, scaling needs |
| **Total** | **$XX,XXX** | **100%** | |

---

## 12. Sustainability Plan

### Short-term (0–6 months)
- Grant funding covers development and infrastructure costs
- Community growth through organic sharing and ecosystem partnerships

### Medium-term (6–12 months)
- **Freemium Model**: Core features remain free; premium features (unlimited AI, advanced analytics, certifications) behind subscription
- **Ecosystem Sponsorships**: Featured placements in dApp showcase for ecosystem projects
- **Partnership Revenue**: White-label educational modules for Stacks ecosystem projects

### Long-term (12+ months)
- **On-chain Revenue**: NFT achievement minting fees, certification fees
- **DAO Treasury**: Community-managed treasury from premium subscriptions
- **Grant Renewals**: Continued ecosystem grants based on demonstrated impact metrics

---

## 13. Metrics & KPIs

### Primary Success Metrics

| Metric | Measurement | Target (6mo) |
|--------|-------------|:---:|
| **Monthly Active Users** | Unique authenticated users per month | 2,000 |
| **AI Conversations** | Total chat messages sent | 20,000 |
| **Quiz Completions** | Full quiz sessions completed | 5,000 |
| **Knowledge Contributions** | Approved community entries | 200 |
| **Topic Completion Rate** | Users exploring all 8 topics | 25% |
| **dApp Referrals** | Click-throughs to ecosystem dApps | 10,000 |

### Secondary Metrics

| Metric | Measurement |
|--------|-------------|
| Average Session Duration | Time spent per visit |
| Achievement Unlock Rate | % of users earning badges |
| Knowledge Base Vote Ratio | Upvote-to-downvote ratio |
| Return User Rate | Users returning within 7 days |
| Social Shares | Achievement shares on Twitter/X |
| Net Promoter Score | User satisfaction survey |

### Reporting

- **Monthly**: Public metrics dashboard showing usage, growth, and ecosystem impact
- **Quarterly**: Detailed grant milestone reports with budget tracking
- **Continuous**: Real-time analytics available to Stacks Foundation

---

## 14. Appendix

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

- **Pages**: `Index.tsx` (main app with view routing), `Auth.tsx`, `NotFound.tsx`
- **Core**: `ChatInterface`, `ChatMessage`, `TopicCards`, `CommunitySentiment`
- **Interactive**: `StacksQuiz`, `NFTExplorer`, `DappShowcase`, `SearchBar`
- **Community**: `KnowledgeBase`, `KnowledgeComments`, `ContributorBadge`
- **Gamification**: `AchievementBadges`, `ShareAchievement`, `GetStartedCTA`
- **User**: `UserMenu`, `ProfileEditor`, `AdminPanel`, `ProtectedRoute`
- **Utility**: `VoiceControls`, `AgeSelector`, `PreviewModal`
- **UI Library**: 30+ shadcn/ui components (buttons, cards, dialogs, tabs, etc.)

### E. Screenshots

#### Landing Page — Hero & Navigation
The cinematic landing page features The Architect's AI character, Netflix-inspired UI with hero section, action buttons (Begin, Assessment, Contribute, Pulse), and the scrollable dApp ecosystem bar.

![Landing Page](docs/screenshots/01-landing-page.png)

#### Chat Interface — Topic Selection & Progress
After clicking "Begin", users see 8 interactive topic cards with progress tracking, achievement badges, age selector, and the chat input. Explored topics are highlighted with animated indicators.

![Chat Topics](docs/screenshots/02-chat-topics.png)

#### Active AI Conversation
Streaming AI responses with rich formatting, covering Stacks architecture, PoX consensus, Nakamoto upgrade, and sBTC mechanics. Voice controls and infographic generation available per message.

![Active Chat](docs/screenshots/03-active-chat.png)

#### Knowledge Assessment — Quiz Start
The quiz landing shows 25-question assessment covering architecture, Clarity, DeFi, NFTs, security, and advanced topics with optional timed exam mode.

![Quiz Start](docs/screenshots/04-quiz-start.png)

#### Knowledge Assessment — Quiz Question
Each question features 4 multiple-choice options, category tags (DeFi, Architecture, Clarity, etc.), progress bar, and score tracking.

![Quiz Question](docs/screenshots/05-quiz-question.png)

#### Community Pulse — Trending Topics
Live sentiment dashboard showing overall bullish/bearish meter, ranked trending topics (Dual Stacking, sBTC milestones, BitGo, Clarity 4 WASM, DeFAI) with hotness scores and category badges.

![Sentiment Trending](docs/screenshots/06-sentiment-trending.png)

#### Community Pulse — Live Metrics
Real-time ecosystem data from Hiro Stacks API and CoinGecko: STX/BTC prices, block height (6.6M+), total transactions (22.5M+), mempool size, PoX cycle, STX locked, and growth highlights.

![Live Metrics](docs/screenshots/07-live-metrics.png)

#### dApp Showcase Directory
Filterable directory of 36+ Stacks ecosystem applications across DeFi, NFT, Tools, Wallets, and Other categories with logos, descriptions, ratings, and direct links.

![dApp Showcase](docs/screenshots/08-dapp-showcase.png)

---

## Contact

**Project:** The Architect — Stacks Ecosystem AI Mentor  
**Website:** [https://smentorai.lovable.app](https://smentorai.lovable.app)  
**Email:** [your-email@example.com]  
**Twitter/X:** [@your-handle]  
**Discord:** [your-discord]

---

*This proposal was prepared for the Stacks Grants Program. The Architect is an open educational platform dedicated to accelerating Stacks ecosystem adoption through AI-powered, interactive learning.*
