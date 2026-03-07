import React, { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  isSpeechSynthesisSupported,
  speakAnalysis,
  stopSpeech,
  isSpeaking,
} from "@/lib/voiceSynthesis";

interface VoiceButtonProps {
  riskScore: number;
  riskLevel: string;
  messageType: string;
  fraudTypes: string[];
  isFraud: boolean;
  explanation?: string;
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Reusable Voice Analysis Button
 * Speaks out the fraud analysis results
 */
export const VoiceButton: React.FC<VoiceButtonProps> = ({
  riskScore,
  riskLevel,
  messageType,
  fraudTypes,
  isFraud,
  explanation,
  className = "",
  variant = "default",
}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);

  useEffect(() => {
    setIsSupported(isSpeechSynthesisSupported());
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const handleSpeechStart = () => setIsSpeakingState(true);
    const handleSpeechEnd = () => setIsSpeakingState(false);

    const utterance = new SpeechSynthesisUtterance();
    utterance.onstart = handleSpeechStart;
    utterance.onend = handleSpeechEnd;

    return () => {
      stopSpeech();
    };
  }, [isSupported]);

  const handleVoiceClick = () => {
    if (isSpeakingState) {
      stopSpeech();
      setIsSpeakingState(false);
    } else {
      speakAnalysis({
        riskScore,
        riskLevel,
        messageType,
        fraudTypes,
        isfraud: isFraud,
        explanation,
      });
    }
  };

  if (!isSupported) {
    return null; // Hide if not supported
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleVoiceClick}
        className={`p-2 rounded-lg transition-all ${
          isSpeakingState
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            : "border border-border bg-card hover:bg-muted/60 text-foreground"
        } ${className}`}
        title={isSpeakingState ? "Stop voice" : "Listen to analysis"}
        aria-label="Voice analysis"
      >
        {isSpeakingState ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleVoiceClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        isSpeakingState
          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          : "border border-border bg-card hover:bg-muted/60 text-foreground"
      } ${className}`}
      title={isSpeakingState ? "Stop voice" : "Listen to analysis"}
    >
      {isSpeakingState ? (
        <>
          <VolumeX className="w-4 h-4 animate-pulse" />
          Stop Listening
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          Listen to Analysis
        </>
      )}
    </button>
  );
};
