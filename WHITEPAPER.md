# Sammy — Whitepaper

### AI-Powered Onboarding for the Stacks Ecosystem

**Version 1.1 | February 2026 | 3-Month Plan**

---

## 1. Problem

New users trying to join the Stacks ecosystem face three barriers:

1. **Too complicated** — Concepts like Proof of Transfer, Clarity smart contracts, and sBTC have no simple explanations aimed at everyday people.
2. **Information is everywhere** — Useful content is scattered across GitHub, Discord, Twitter, and blogs. There's no single place to learn.
3. **People leave** — Without guided help, most newcomers get overwhelmed and never come back.

**Bottom line:** Stacks has great technology, but not enough people understand it.

---

## 2. Proposed Solution

**The Architect** is an AI chatbot that teaches people about Stacks in plain, simple language.
+ **Sammy** is an AI chatbot that teaches people about Stacks in plain, simple language.

- Ask any question → get a clear answer
- Pick a topic → follow a guided lesson
- Take a quiz → test what you learned
- See live data → real-time STX prices and network stats
- Browse dApps → discover what's built on Stacks

It works for beginners (even kids) and experienced users alike.

---

## 3. Key Beneficiaries

| Who | How They Benefit |
|---|---|
| **New users** | Learn Stacks without reading technical docs |
| **STX holders** | Understand stacking, yield, and ecosystem news |
| **Developers** | Get code examples and Clarity explanations |
| **Stacks projects** | Gain visibility through the dApp directory |
| **Stacks Foundation** | More educated users = stronger ecosystem |

---

## 4. Roadmap (3 Months)

### Month 1 — Build & Launch
- [x] AI chat with streaming responses
- [x] 8 topic learning paths
- [x] 50+ question quiz
- [x] Live metrics dashboard (STX price, block height, transactions)
- [x] dApp showcase (36+ projects)
- [x] User accounts and progress tracking
- [ ] Bug fixes and performance optimization

### Month 2 — Grow
- [ ] Launch paid subscription tier
- [ ] Add 3 languages (Spanish, Portuguese, Turkish)
- [ ] Mobile-friendly PWA version
- [ ] Partner with 5 ecosystem projects for co-marketing
- [ ] Community knowledge base with moderation

### Month 3 — Sustain
- [ ] Embeddable chat widget for other Stacks websites
- [ ] NFT learning certificates on Stacks
- [ ] Analytics dashboard for user engagement
- [ ] Apply for follow-up grants based on results
- [ ] Publish impact report (users, topics covered, retention)

---

## 5. Technology Stack

### What We Build With

| Tool | What It Does |
|---|---|
| **React** | Builds the user interface |
| **TypeScript** | Catches code errors before users see them |
| **Vite** | Makes the app load fast |
| **Tailwind CSS** | Styles everything consistently |
| **Framer Motion** | Adds smooth animations |
| **shadcn/ui** | Pre-built buttons, forms, and cards |

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
| **AI Models** | Powers the chat assistant |

### Backend Functions

| Function | Purpose |
|---|---|
| `defi-chat` | AI conversation engine |
| `stacks-metrics` | Fetches live network stats |
| `text-to-speech` | Voice narration |
| `generate-infographic` | Visual explanations |
| `review-contribution` | Content moderation |

---

## Summary

| | |
|---|---|
| **Problem** | Stacks is hard to learn for newcomers |
| **Solution** | AI chatbot that explains everything simply |
| **Who benefits** | New users, holders, developers, projects, the Foundation |
| **Tech** | React + PostgreSQL + AI + Stacks APIs |
| **Tech** | React + PostgreSQL + AI + Stacks APIs |

---

**Website:** [smentorai.lovable.app](https://smentorai.lovable.app)

*Last updated: February 2026*
