import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, TrendingUp, Image, Music, Camera, Palette, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Collection {
  name: string;
  floor: string;
  image: string;
  url: string;
  category?: string;
}

interface NFTExplorerProps {
  isVisible: boolean;
  onClose: () => void;
}

// Static data from Gamma - in production this would be fetched via an API
const featuredCollections: Collection[] = [
  {
    name: "The Guests",
    floor: "99.1K STX",
    image: "https://stxnft.mypinata.cloud/ipfs/QmXbsvpfhCKFSVdE1m31p7rhWYDTA6P81f3NT3n5aVc6A7/images/322.png",
    url: "https://stacks.gamma.io/collections/the-guests",
    category: "Collectibles"
  },
  {
    name: "SpaghettiPunk Club",
    floor: "2.5K STX",
    image: "https://stxnft.mypinata.cloud/ipfs/QmUDBKgiCDW8J8db3bFBhnnVLHwguspGQLZ3zZ6t76ne45",
    url: "https://stacks.gamma.io/collections/spaghettipunk-club",
    category: "Collectibles"
  },
  {
    name: "Leo Cats",
    floor: "850 STX",
    image: "https://images.gamma.io/cdn-cgi/image/quality=100,width=600,height=600/https://stxnft.mypinata.cloud/ipfs/QmXbsvpfhCKFSVdE1m31p7rhWYDTA6P81f3NT3n5aVc6A7/images/62.png",
    url: "https://stacks.gamma.io/collections/leo-cats",
    category: "Collectibles"
  },
  {
    name: "Megapont Ape Club",
    floor: "1.2K STX",
    image: "https://images.gamma.io/cdn-cgi/image/quality=100,width=600,height=600/https://stxnft.mypinata.cloud/ipfs/QmZJvnVzM9o3mUdCiPrN6F5YEZwLMJ5n5k8SL2H8E9Z3aM",
    url: "https://stacks.gamma.io/collections/megapont-ape-club",
    category: "Collectibles"
  },
  {
    name: "BNS: Bitcoin Name System",
    floor: "Minting",
    image: "https://images.gamma.io/cdn-cgi/image/quality=100,width=600,height=600/https://stxnft.mypinata.cloud/ipfs/QmUDBKgiCDW8J8db3bFBhnnVLHwguspGQLZ3zZ6t76ne45",
    url: "https://stacks.gamma.io/collections/bns",
    category: "Utility"
  },
  {
    name: "Stacks Parrots",
    floor: "320 STX",
    image: "https://stxnft.mypinata.cloud/ipfs/QmXbsvpfhCKFSVdE1m31p7rhWYDTA6P81f3NT3n5aVc6A7/images/100.png",
    url: "https://stacks.gamma.io/collections/stacks-parrots",
    category: "Collectibles"
  }
];

const categories = [
  { name: "All", icon: TrendingUp },
  { name: "Collectibles", icon: Image },
  { name: "Fine Art", icon: Palette },
  { name: "Photography", icon: Camera },
  { name: "Music", icon: Music },
];

const NFTExplorer = ({ isVisible, onClose }: NFTExplorerProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      // Simulate loading from API
      const timer = setTimeout(() => {
        setCollections(featuredCollections);
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const filteredCollections = selectedCategory === "All" 
    ? collections 
    : collections.filter(c => c.category === selectedCategory);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCollections(featuredCollections);
      setIsLoading(false);
    }, 800);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl p-5 mb-4 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Image className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Gamma NFT Explorer</h3>
              <p className="text-xs text-muted-foreground">Live collections from stacks.gamma.io</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.name}
                variant={selectedCategory === cat.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === cat.name 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 border-border/50 hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCollections.map((collection, idx) => (
              <motion.a
                key={collection.name}
                href={collection.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="group relative bg-muted/30 rounded-xl overflow-hidden border border-border/30 hover:border-primary/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300?text=NFT";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {collection.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                          {collection.floor}
                        </Badge>
                        {collection.category && (
                          <span className="text-[10px] text-muted-foreground">{collection.category}</span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Powered by Gamma Marketplace
          </span>
          <a
            href="https://stacks.gamma.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all on Gamma
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NFTExplorer;
