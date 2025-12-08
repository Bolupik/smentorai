import { motion } from "framer-motion";
import { ExternalLink, Wallet, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface GetStartedCTAProps {
  allCompleted: boolean;
  exploredCount: number;
}

const wallets = [
  {
    name: "Leather Wallet",
    description: "The original Stacks wallet. Clean, secure, and trusted.",
    url: "https://leather.io/install-extension",
    color: "from-orange-500 to-amber-600",
  },
  {
    name: "Xverse Wallet",
    description: "Feature-rich with Bitcoin Ordinals & Stacks support.",
    url: "https://www.xverse.app/download",
    color: "from-violet-500 to-purple-600",
  },
];

const resources = [
  { label: "Buy STX on OKX", url: "https://www.okx.com/trade-spot/stx-usdt" },
  { label: "Buy STX on Binance", url: "https://www.binance.com/en/trade/STX_USDT" },
  { label: "Buy STX on Coinbase", url: "https://www.coinbase.com/price/stacks" },
  { label: "Stacks Explorer", url: "https://explorer.hiro.so" },
  { label: "ALEX DEX", url: "https://app.alexlab.co" },
  { label: "Stacks Documentation", url: "https://docs.stacks.co" },
];

const GetStartedCTA = ({ allCompleted, exploredCount }: GetStartedCTAProps) => {
  const showCTA = exploredCount >= 2 || allCompleted;

  if (!showCTA) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="mt-10 px-2"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 p-6 md:p-8">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-8"
          >
            {allCompleted ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">Stacks Master Achieved!</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-foreground mb-2">
                  You&apos;re Ready to Start Your Journey
                </h3>
              </>
            ) : (
              <h3 className="text-2xl md:text-3xl font-black text-foreground mb-2">
                Ready to Get Started?
              </h3>
            )}
            <p className="text-muted-foreground max-w-lg mx-auto">
              Download a wallet, get some STX, and start exploring the Stacks ecosystem
            </p>
          </motion.div>

          {/* Wallet Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {wallets.map((wallet, idx) => (
              <motion.a
                key={wallet.name}
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 hover:border-primary/50 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${wallet.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center flex-shrink-0`}>
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {wallet.name}
                      </h4>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{wallet.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Download Now</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.a>
            ))}
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <h4 className="text-sm font-bold text-foreground mb-3 text-center">Quick Links</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {resources.map((resource) => (
                <Button
                  key={resource.label}
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-full text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                >
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.label}
                    <ExternalLink className="w-3 h-3 ml-1.5" />
                  </a>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Bottom message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            Always verify URLs and never share your seed phrase with anyone
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default GetStartedCTA;
