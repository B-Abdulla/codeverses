/**
 * Voice Synthesis Utility
 * Converts fraud analysis results to natural speech using Web Speech API
 */

export interface VoiceSynthesisConfig {
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
}

interface AnalysisVoiceData {
  riskScore: number;
  riskLevel: string;
  messageType: string;
  fraudTypes: string[];
  isfraud: boolean;
  explanation?: string;
}

const DEFAULT_CONFIG: VoiceSynthesisConfig = {
  rate: 1,
  pitch: 1,
  volume: 1,
};

/**
 * Check if browser supports Web Speech API
 */
export const isSpeechSynthesisSupported = (): boolean => {
  const synth = window.speechSynthesis;
  return typeof synth !== "undefined" && synth !== null;
};

/**
 * Generate voice script from analysis result
 */
export const generateAnalysisScript = (data: AnalysisVoiceData): string => {
  const parts: string[] = [];

  // Opening
  parts.push(
    data.isfraud
      ? `⚠️ Warning! This content is ${data.riskLevel.toLowerCase()} risk fraud.`
      : `✓ This content appears to be safe.`,
  );

  // Risk score
  parts.push(`Risk score is ${data.riskScore} out of 100.`);

  // Risk level
  parts.push(`Risk level: ${data.riskLevel}.`);

  // Message type
  parts.push(`Classification: ${data.messageType}.`);

  // Fraud types detected
  if (data.fraudTypes && data.fraudTypes.length > 0) {
    parts.push(`Fraud types detected: ${data.fraudTypes.join(", ")}.`);
  }

  // Explanation
  if (data.explanation) {
    parts.push(`Explanation: ${data.explanation}`);
  }

  // Closing advice
  if (data.isfraud) {
    parts.push(
      "Do not click suspicious links or share personal information. Report this message.",
    );
  } else {
    parts.push("Appears safe to interact with.");
  }

  return parts.join(" ");
};

/**
 * Speak text using Web Speech API
 */
export const speakText = (
  text: string,
  config: VoiceSynthesisConfig = DEFAULT_CONFIG,
): void => {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Web Speech API not supported on this browser");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = config.rate || DEFAULT_CONFIG.rate!;
  utterance.pitch = config.pitch || DEFAULT_CONFIG.pitch!;
  utterance.volume = config.volume || DEFAULT_CONFIG.volume!;

  // Try to use English voice if available
  const voices = window.speechSynthesis.getVoices();
  const englishVoice =
    voices.find((v) => v.lang.startsWith("en") && v.default === true) ||
    voices.find((v) => v.lang.startsWith("en"));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Stop speech synthesis
 */
export const stopSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if currently speaking
 */
export const isSpeaking = (): boolean => {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
};

/**
 * Speak fraud analysis result
 */
export const speakAnalysis = (
  data: AnalysisVoiceData,
  config?: VoiceSynthesisConfig,
): void => {
  const script = generateAnalysisScript(data);
  speakText(script, config);
};

/**
 * Get listener for speech synthesis events
 */
export const onSpeechStart = (callback: () => void): void => {
  const utterance = new SpeechSynthesisUtterance();
  utterance.onstart = callback;
};

/**
 * Get listener for speech synthesis end
 */
export const onSpeechEnd = (callback: () => void): void => {
  const utterance = new SpeechSynthesisUtterance();
  utterance.onend = callback;
};
