export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Neutral';
  category: string;
  apiVoiceName: string; // The actual Gemini voice name to use
  description: string;
}

export interface AudioState {
  blob: Blob;
  url: string;
  base64: string;
}

export interface VoiceSettings {
  speakingRate: number; // 0.5 to 2.0
  pitch: number;        // -10 to +10
  volume: number;       // 0 to 1
}

// The actual valid API values
export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}