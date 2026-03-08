import { motion } from "framer-motion";
import sammyMascot from "@/assets/sammy-mascot.jpg";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="relative z-10 border-t border-border/20 bg-background/80 backdrop-blur-md mt-auto"
    >
      <div className="container mx-auto px-6 py-6">
        {/* Single landscape row */}
        <div className="flex flex-row items-start justify-between gap-8 flex-wrap">

          {/* Brand */}
          <div className="flex flex-col gap-3 min-w-[160px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/40 flex-shrink-0">
                <img src={sammyMascot} alt="Sammy" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold tracking-tight text-primary">SAMMY THE AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
              Your guide to the Stacks ecosystem — learn, explore &amp; master Bitcoin-native DeFi.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2 mt-1">
              <a href="https://x.com/Smentorai" target="_blank" rel="noopener noreferrer" aria-label="X"
                className="w-7 h-7 rounded-full border border-border/40 bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="w-7 h-7 rounded-full border border-border/40 bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                className="w-7 h-7 rounded-full border border-border/40 bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-foreground tracking-widest uppercase mb-1">Platform</h3>
            {["Ask Sammy", "Explore Topics", "Daily Quiz", "Knowledge Base", "Community Pulse"].map((label) => (
              <span key={label} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {label}
              </span>
            ))}
          </div>

          {/* SMentor Resources */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-foreground tracking-widest uppercase mb-1">SMentor</h3>
            {[
              { label: "About SMentor", url: "https://x.com/Smentorai" },
              { label: "Whitepaper", url: "https://x.com/Smentorai" },
              { label: "Privacy Policy", url: "https://x.com/Smentorai" },
              { label: "Terms of Service", url: "https://x.com/Smentorai" },
            ].map((item) => (
              <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          {/* Copyright flush right */}
          <div className="flex flex-col items-end justify-end gap-1 ml-auto self-end">
            <p className="text-xs text-muted-foreground text-right">
              © {new Date().getFullYear()} SMentor AI
            </p>
            <p className="text-xs text-muted-foreground text-right">
              Built on{" "}
              <a href="https://stacks.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Stacks
              </a>{" "}
              &amp; Bitcoin
            </p>
          </div>

        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
