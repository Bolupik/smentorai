import { useEffect, useState } from "react";
import { ArrowBigUp, ArrowBigDown, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HotTakeCardProps {
  text: string;
  likes: number;
  onDiscuss: () => void;
}

const STORE_KEY = "smentor.hotTakeVotes";

const readVotes = (): Record<string, 1 | -1> => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; }
};

const HotTakeCard = ({ text, likes, onDiscuss }: HotTakeCardProps) => {
  const [vote, setVote] = useState<1 | -1 | null>(null);

  useEffect(() => { setVote(readVotes()[text] ?? null); }, [text]);

  const cast = (v: 1 | -1) => {
    const next = vote === v ? null : v;
    setVote(next);
    const all = readVotes();
    if (next) all[text] = next; else delete all[text];
    try { localStorage.setItem(STORE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  };

  const score = likes + (vote ?? 0);

  return (
    <Card className="h-full hover:bg-accent/40 transition-colors">
      <CardContent className="py-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-0.5">
            <button onClick={() => cast(1)} aria-label="Like"
              className={`transition-colors ${vote === 1 ? "text-green-500" : "text-muted-foreground hover:text-green-500"}`}>
              <ArrowBigUp className={`h-5 w-5 ${vote === 1 ? "fill-current" : ""}`} />
            </button>
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">{score}</span>
            <button onClick={() => cast(-1)} aria-label="Dislike"
              className={`transition-colors ${vote === -1 ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}>
              <ArrowBigDown className={`h-5 w-5 ${vote === -1 ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug font-medium">{text}</p>
            <button onClick={onDiscuss}
              className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="h-3 w-3" /> Comment in forum
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotTakeCard;
