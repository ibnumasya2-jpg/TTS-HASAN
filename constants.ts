import { VoiceOption, VoiceName } from './types';

// Helper to create voice entries efficiently
const createVoice = (
  name: string, 
  category: string, 
  apiVoice: string, 
  gender: 'Male' | 'Female' | 'Neutral',
  desc: string
): VoiceOption => ({
  id: name, // Use the name (e.g., NovaSoft-F1) as the ID
  name: name,
  category,
  apiVoiceName: apiVoice,
  gender,
  description: desc
});

const generateVoices = (
  prefix: string, 
  count: number, 
  category: string, 
  apiVoice: string, 
  gender: 'Male' | 'Female' | 'Neutral',
  baseDesc: string
) => {
  return Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    const name = `${prefix}-${gender.charAt(0)}${num}`;
    return createVoice(name, category, apiVoice, gender, baseDesc);
  });
};

export const AVAILABLE_VOICES: VoiceOption[] = [
  // 1. Female Soft Voices (20) -> NovaSoft (Zephyr)
  ...generateVoices(
    'NovaSoft', 20, 'Wanita Lembut', VoiceName.Zephyr, 'Female',
    'Nada lembut, hangat, menenangkan. Ideal untuk narasi dan cerita pengantar tidur.'
  ),

  // 2. Female Energetic Voices (20) -> EnergiX (Kore)
  ...generateVoices(
    'EnergiX', 20, 'Wanita Energik', VoiceName.Kore, 'Female',
    'Cerah, kuat, dan antusias. Sempurna untuk video promo dan iklan.'
  ),

  // 3. Male Deep Voices (20) -> TitanDeep (Charon)
  ...generateVoices(
    'TitanDeep', 20, 'Pria Berat (Deep)', VoiceName.Charon, 'Male',
    'Berat, bergema, dan sinematik. Terbaik untuk trailer film dan narasi epik.'
  ),

  // 4. Male Warm Voices (10) -> SolarWarm (Puck)
  ...generateVoices(
    'SolarWarm', 10, 'Pria Hangat', VoiceName.Puck, 'Male',
    'Ramah, terpercaya, dan hangat. Bagus untuk buku audio dan asisten umum.'
  ),

  // 5. Neutral / Androgynous Voices (10) -> Aether (Fenrir/Zephyr mix)
  ...Array.from({ length: 10 }, (_, i) => {
      const num = i + 1;
      const isEven = num % 2 === 0;
      return createVoice(
          `AetherN${num}`, 
          'Netral / Androgini', 
          isEven ? VoiceName.Fenrir : VoiceName.Zephyr, 
          'Neutral', 
          'Ringan, misterius, dan seimbang. Cocok untuk suasana gelap atau teknologi modern.'
      );
  }),

  // 6. Kids Voices (10) -> PixelKid (Kore with pitch adjust context)
  ...generateVoices(
    'PixelKid', 10, 'Suara Anak-anak', VoiceName.Kore, 'Neutral', // Using Neutral gender for display
    'Lucu, polos, dan awet muda. Dirancang untuk konten anak-anak dan kartun.'
  ),

  // 7. Robotic / AI / Sci-Fi Voices (10) -> CybriX (Fenrir)
  ...generateVoices(
    'CybriX-AI', 10, 'Robotik / AI / Sci-Fi', VoiceName.Fenrir, 'Neutral',
    'Metalik, presisi, dan robotik. Sangat baik untuk sci-fi, demo teknologi, dan agen AI.'
  ),

  // 8. Cinematic Voices (10) -> Cinemax (Charon)
  ...generateVoices(
    'Cinemax', 10, 'Sinematik', VoiceName.Charon, 'Male',
    'Epik, berani, dan berwibawa. Standar emas untuk trailer film dan pembacaan dramatis.'
  )
];