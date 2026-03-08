import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Volume2, VolumeX, Loader2, Settings2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface VoiceControlsProps {
  text: string;
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceControls = ({ text, onSpeakingChange }: VoiceControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      toast({
        title: "Not Supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      });
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      onSpeakingChange?.(false);
      return;
    }

    setIsLoading(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang.startsWith("en") && v.localService) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
      onSpeakingChange?.(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsLoading(false);
      onSpeakingChange?.(false);
    };

    utterance.onerror = (e) => {
      if (e.error === "interrupted") {
        setIsPlaying(false);
        setIsLoading(false);
        onSpeakingChange?.(false);
        return;
      }
      setIsPlaying(false);
      setIsLoading(false);
      onSpeakingChange?.(false);
      toast({
        title: "Voice Error",
        description: "Failed to play speech. Please try again.",
        variant: "destructive",
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSpeak}
        disabled={isLoading}
        className="h-8 w-8 p-0 hover:bg-primary/10"
        title={isPlaying ? "Stop" : "Listen"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="w-4 h-4 text-primary" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-primary/10"
            title="Adjust speed"
          >
            <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" side="top" align="center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">Speed</span>
              <span className="text-xs font-mono text-primary">{rate.toFixed(1)}×</span>
            </div>
            <Slider
              min={0.5}
              max={2.0}
              step={0.1}
              value={[rate]}
              onValueChange={([val]) => setRate(val)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.5×</span>
              <span>1×</span>
              <span>2×</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VoiceControls;
