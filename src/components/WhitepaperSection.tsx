import { motion } from "framer-motion";
import { FileText, DollarSign, Users, Code, Map, PiggyBank, ChevronDown } from "lucide-react";
import { useState } from "react";

const sections = [
  {
    id: "problem",
    icon: <FileText className="w-5 h-5" />,
    title: "Problem",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>New users trying to join the Stacks ecosystem face three barriers:</p>
        <ul className="space-y-2 ml-4">
          <li><strong className="text-foreground">Too complicated</strong> — Concepts like Proof of Transfer, Clarity smart contracts, and sBTC have no simple explanations for everyday people.</li>
          <li><strong className="text-foreground">Information is everywhere</strong> — Useful content is scattered across GitHub, Discord, Twitter, and blogs with no single place to learn.</li>
          <li><strong className="text-foreground">People leave</strong> — Without guided help, most newcomers get overwhelmed and never come back.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "solution",
    icon: <Users className="w-5 h-5" />,
    title: "Proposed Solution",
    content: (
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">The Architect</strong> is an AI chatbot that teaches people about Stacks in plain, simple language.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {[
            "Ask any question → get a clear answer",
            "Pick a topic → follow a guided lesson",
            "Take a quiz → test what you learned",
            "See live data → real-time STX prices & stats",
            "Browse dApps → discover what's built on Stacks",
            "Earn badges → track your learning progress",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 bg-muted/30 rounded-lg px-3 py-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "beneficiaries",
    icon: <Users className="w-5 h-5" />,
    title: "Key Beneficiaries",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 pr-4 text-foreground font-semibold">Who</th>
              <th className="text-left py-2 text-foreground font-semibold">How They Benefit</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              ["New users", "Learn Stacks without reading technical docs"],
              ["STX holders", "Understand stacking, yield, and ecosystem news"],
              ["Developers", "Get code examples and Clarity explanations"],
              ["Stacks projects", "Gain visibility through the dApp directory"],
              ["Stacks Foundation", "More educated users = stronger ecosystem"],
            ].map(([who, how], i) => (
              <tr key={i} className="border-b border-border/20">
                <td className="py-2 pr-4 font-medium text-foreground">{who}</td>
                <td className="py-2">{how}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "revenue",
    icon: <DollarSign className="w-5 h-5" />,
    title: "Revenue Model",
    content: (
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 pr-4 text-foreground font-semibold">Stream</th>
                <th className="text-left py-2 text-foreground font-semibold">How It Works</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {[
                ["Free tier", "10 AI chats/day, quiz, dashboard — attracts users"],
                ["Paid tier ($5/mo)", "Unlimited chat, voice, infographics"],
                ["Featured listings", "dApps pay for premium placement"],
                ["Sponsored content", "Projects fund educational topics"],
                ["Grants", "Stacks Foundation and Bitcoin education grants"],
              ].map(([stream, desc], i) => (
                <tr key={i} className="border-b border-border/20">
                  <td className="py-2 pr-4 font-medium text-foreground">{stream}</td>
                  <td className="py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-xs">
          <p className="font-semibold text-foreground mb-1">3-Month Revenue Projection</p>
          <p>Grants: $3,000 · Subscriptions: $300 · Partnerships: $200 · <strong className="text-primary">Total: $3,500</strong></p>
          <p className="mt-1 text-muted-foreground/70">Goal: Recover $4,000 investment within 4–5 months.</p>
        </div>
      </div>
    ),
  },
  {
    id: "roadmap",
    icon: <Map className="w-5 h-5" />,
    title: "Roadmap (3 Months)",
    content: (
      <div className="space-y-4 text-sm">
        {[
          {
            month: "Month 1 — Build & Launch",
            items: ["AI chat with streaming responses", "8 topic learning paths", "50+ question quiz", "Live metrics dashboard", "dApp showcase (36+ projects)"],
            done: true,
          },
          {
            month: "Month 2 — Grow",
            items: ["Launch paid subscription tier", "Add 3 languages", "Mobile-friendly PWA", "Partner with 5 ecosystem projects"],
            done: false,
          },
          {
            month: "Month 3 — Sustain",
            items: ["Embeddable chat widget", "NFT learning certificates", "Analytics dashboard", "Publish impact report"],
            done: false,
          },
        ].map((phase, i) => (
          <div key={i} className="bg-muted/20 rounded-lg p-3">
            <p className="font-semibold text-foreground mb-2">{phase.month}</p>
            <ul className="space-y-1 text-muted-foreground">
              {phase.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className={phase.done ? "text-green-500" : "text-muted-foreground/50"}>{phase.done ? "✓" : "○"}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "budget",
    icon: <PiggyBank className="w-5 h-5" />,
    title: "Budget Allocation — $4,000",
    content: (
      <div className="space-y-4 text-sm">
        {[
          { label: "Development", amount: "$1,800", pct: 45, color: "bg-primary" },
          { label: "Marketing", amount: "$800", pct: 20, color: "bg-blue-500" },
          { label: "Management", amount: "$700", pct: 17.5, color: "bg-purple-500" },
          { label: "Dispute Resolution", amount: "$400", pct: 10, color: "bg-orange-500" },
          { label: "Reserve", amount: "$300", pct: 7.5, color: "bg-muted-foreground" },
        ].map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span className="font-medium text-foreground">{item.label}</span>
              <span>{item.amount} ({item.pct}%)</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`h-2 rounded-full ${item.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "tech",
    icon: <Code className="w-5 h-5" />,
    title: "Technology Stack",
    content: (
      <div className="space-y-4 text-sm">
        <div>
          <p className="font-semibold text-foreground mb-2">Frontend</p>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion", "shadcn/ui"].map((t) => (
              <span key={t} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-2">Backend</p>
          <div className="flex flex-wrap gap-2">
            {["PostgreSQL", "Edge Functions (Deno)", "Row Level Security"].map((t) => (
              <span key={t} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-2">External APIs</p>
          <div className="flex flex-wrap gap-2">
            {["Hiro Stacks API", "CoinGecko", "AI Models (GPT/Gemini)"].map((t) => (
              <span key={t} className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded text-xs font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

const WhitepaperSection = () => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["problem"]));

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="relative z-40 bg-background border-t border-border/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs tracking-[0.3em] text-primary uppercase">Documentation</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Whitepaper</h2>
          <p className="text-sm text-muted-foreground mt-2">A simple overview of what we're building and why.</p>
        </motion.div>

        <div className="space-y-2">
          {sections.map((section, i) => {
            const isOpen = openSections.has(section.id);
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border border-border/40 rounded-lg overflow-hidden bg-card/30"
              >
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="text-primary">{section.icon}</span>
                  <span className="flex-1 font-semibold text-foreground text-sm sm:text-base">{section.title}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-4 pb-4"
                  >
                    {section.content}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhitepaperSection;
