import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface VoiceControlsProps {
  text: string;
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceControls = ({ text, onSpeakingChange }: VoiceControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    // Pick a natural-sounding English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && v.localService
    ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.rate = 1.0;
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
      // "interrupted" fires when user manually stops — not a real error
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
  );
};

export default VoiceControls;
