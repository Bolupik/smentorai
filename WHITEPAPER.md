# SMentor — Whitepaper

### AI-Powered Onboarding & Yield Rewards for the Stacks Ecosystem

**Version 2.0 | March 2026 | 12-Month Plan**

---

## 1. Problem

New users trying to join the Stacks ecosystem face four barriers:

1. **Too complicated** — Concepts like Proof of Transfer, Clarity smart contracts, and sBTC have no simple explanations aimed at everyday people.
2. **Information is everywhere** — Useful content is scattered across GitHub, Discord, Twitter, and blogs. There's no single place to learn.
3. **People leave** — Without guided help, most newcomers get overwhelmed and never come back.
4. **No incentive to learn** — There is no financial reward for investing time and effort in learning about the Stacks ecosystem.

**Bottom line:** Stacks has great technology, but not enough people understand it — and nothing currently pays them to try.

---

## 2. Proposed Solution

**SMentor** is an AI chatbot (powered by "Sammy") that teaches people about Stacks in plain, simple language — and rewards them with real yield for doing so.

- Ask any question → get a clear answer from Sammy
- Pick a topic → follow a guided lesson
- Take a quiz → test what you learned, earn bonus yield
- See live data → real-time STX prices and network stats
- Browse dApps → discover what's built on Stacks
- **Earn yield** → treasury STX stacked via PoX distributes BTC rewards weekly to learners

It works for beginners (even kids) and experienced users alike.

---

## 3. Key Beneficiaries

| Who | How They Benefit |
|---|---|
| **New users** | Learn Stacks without reading technical docs; earn yield while doing it |
| **STX holders** | Understand stacking, yield, and ecosystem news; access PoX yield rewards |
| **Developers** | Get code examples and Clarity explanations |
| **Stacks projects** | Gain visibility through the dApp directory |
| **Stacks Foundation** | More educated, incentivized users = stronger ecosystem |

---

## 4. Yield Generation & Reward System

### How It Works

SMentor operates a **treasury** that stacks STX through the Stacks **Proof of Transfer (PoX)** mechanism. The BTC yield generated each cycle is distributed weekly to users based on their learning engagement.

> **The principal is never touched — only yield is distributed.**

### Weekly Yield Distribution

| Tier | Weekly Points | Share of Weekly Yield |
|------|:---:|:---:|
| 🥇 **Gold** | 150+ pts | **50%** |
| 🥈 **Silver** | 75–149 pts | **30%** |
| 🥉 **Bronze** | 25–74 pts | **15%** |
| 🏛️ **Platform** | N/A | **5%** (operations) |

Each tier's yield is distributed **pro-rata** among all users in that tier for that week.

### Earning Points

| Activity | Points |
|----------|--------|
| Daily AI chat session | +5 pts |
| Topic explored | +10 pts |
| Quiz completed | +20 pts |
| Weekly quiz top 10 | +50 pts bonus |
| Knowledge contribution (approved) | +30 pts |
| 7-day streak bonus | +25 pts |

### Weekly Quiz Yield Bonus

Top performers in the weekly timed quiz event earn bonus yield on top of their tier share:

| Result | Bonus |
|--------|-------|
| Top 3 finishers | +10% of tier allocation |
| Top 10 finishers | +5% of tier allocation |
| All completers | +2% of tier allocation |

Quiz bonuses are funded from the platform's 5% share — no dilution to tier holders.

---

## 5. Roadmap (Quarterly)

### Q0 — Foundation ✅ (Completed)
- [x] AI chat with streaming responses (Sammy)
- [x] 8 topic learning paths with progress tracking
- [x] 50+ question quiz system
- [x] Live metrics dashboard (STX price, block height, PoX cycle)
- [x] dApp showcase (36+ projects)
- [x] User accounts, achievements, and admin moderation
- [x] Voice narration and AI-generated infographics
- [x] Stacks wallet connect (Xverse/Leather) with onboarding flow

### Q1 — Engagement & Yield Foundation (Months 1–3)
- [ ] PoX treasury launch — begin stacking and yield accumulation
- [ ] Yield tier dashboard — in-app Gold/Silver/Bronze tracker
- [ ] Weekly quiz events with yield bonuses
- [ ] Leaderboard system
- [ ] Structured learning paths (Beginner → Intermediate → Advanced)
- [ ] Bug fixes and performance optimization

**Q1 KPI Targets:**
| Metric | Target |
|--------|--------|
| New Installs | 400 |
| Monthly Active Users | 150 |
| Wallet Connects | 40 |
| Course Finishers | 60 |

### Q2 — Growth & Integration (Months 4–6)
- [ ] Multi-language support (Spanish, Portuguese, Turkish)
- [ ] On-chain achievement NFTs (SIP-009)
- [ ] DeFiLlama TVL integration
- [ ] Yield smart contract V1 (Clarity)
- [ ] 5 ecosystem project partner campaigns
- [ ] PWA / mobile-optimized experience

**Q2 KPI Targets:**
| Metric | Target |
|--------|--------|
| New Installs (cumulative) | 1,200 |
| Monthly Active Users | 350 |
| Wallet Connects (cumulative) | 120 |
| Course Finishers (cumulative) | 200 |

### Q3 — Scale & Sustainability (Months 7–9)
- [ ] Public API for partner embedding (embeddable Sammy widget)
- [ ] Builder spotlight features
- [ ] Yield smart contract V2 (audited)
- [ ] DAO governance preparation
- [ ] Analytics dashboard

**Q3 KPI Targets:**
| Metric | Target |
|--------|--------|
| Monthly Active Users | 500 |
| Monthly AI Conversations | 10,000 |
| Knowledge Base Entries | 200+ |
| Partner Integrations | 5+ |

### Q4 — Long-Term Sustainability (Months 10–12)
- [ ] Stacks Academy Certification (on-chain NFT certificates)
- [ ] Premium subscription tier
- [ ] DAO treasury handoff
- [ ] Native mobile app (iOS/Android)
- [ ] Year 1 Impact Report
- [ ] Follow-up grant application

**Q4 KPI Targets:**
| Metric | Target |
|--------|--------|
| Monthly Active Users | 1,000+ |
| Total Installs | 3,000+ |
| On-chain Certifications | 500+ |
| DAO Governance Live | ✅ |

---

## 6. Technology Stack

### What We Build With

| Tool | What It Does |
|---|---|
| **React** | Builds the user interface |
| **TypeScript** | Catches code errors before users see them |
| **Vite** | Makes the app load fast |
| **Tailwind CSS** | Styles everything consistently |
| **Framer Motion** | Adds smooth animations |
| **shadcn/ui** | Pre-built buttons, forms, and cards |
| **@stacks/connect** | Stacks wallet integration |

### Where Data Lives

| Tool | What It Does |
|---|---|
| **PostgreSQL** | Stores user profiles, progress, and content |
| **Edge Functions** | Runs AI chat, fetches live data, generates audio |
| **Row Level Security** | Keeps each user's data private |

### External Services

| Service | What It Does |
|---|---|
| **Hiro Stacks API** | Live blockchain data (blocks, transactions, stacking) |
| **CoinGecko** | STX price and market data |
| **AI Models** | Powers Sammy the chat assistant |
| **PoX Protocol** | Treasury stacking for yield generation |

### Backend Functions

| Function | Purpose |
|---|---|
| `defi-chat` | AI conversation engine (Sammy) |
| `stacks-metrics` | Fetches live network stats |
| `text-to-speech` | Voice narration |
| `generate-infographic` | Visual explanations |
| `review-contribution` | Content moderation |

---

## 7. KPIs & Success Metrics

Based on market analysis (adjusted for realistic organic growth, 15% monthly churn, and actual wallet adoption rates):

| Metric | Month 1 | Month 6 | Note |
|---|:---:|:---:|---|
| **New Installs** | 400 | 1,200 | No hype spikes; organic only |
| **MAU** | 150 | 500 | ~15% monthly churn assumed |
| **Wallet Connects** | 40 | 120 | Hardcore users only |
| **Course Finishers** | 60 | 200 | Focus on 1–2 key modules |

---

## 8. Summary

| | |
|---|---|
| **Problem** | Stacks is hard to learn; no incentive exists to try |
| **Solution** | AI mentor Sammy that teaches Stacks and rewards learners with PoX yield |
| **Yield Model** | Treasury STX stacked via PoX → yield split: Gold 50%, Silver 30%, Bronze 15%, Platform 5% |
| **Principal Safety** | Only yield distributed — treasury principal never touched |
| **Who benefits** | New users, holders, developers, projects, the Foundation |
| **Tech** | React + PostgreSQL + AI + Stacks APIs + Clarity yield contracts |

---

**Website:** [smentorai.lovable.app](https://smentorai.lovable.app) | **AI:** Sammy

*Last updated: March 2026*
