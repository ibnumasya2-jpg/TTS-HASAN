import React, { useState } from 'react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { VoiceControls } from './components/VoiceControls';
import { TextInput } from './components/TextInput';
import { AudioPlayer } from './components/AudioPlayer';
import { generateSpeech } from './services/geminiService';
import { createMp3Blob } from './utils/audioUtils';
import { AVAILABLE_VOICES } from './constants';
import { VoiceOption, AudioState, VoiceSettings } from './types';
import { SpeakerWaveIcon, ArrowDownTrayIcon, SparklesIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(AVAILABLE_VOICES[0]);
  const [settings, setSettings] = useState<VoiceSettings>({
    speakingRate: 1.0,
    pitch: 0,
    volume: 1.0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState | null>(null);
  // Capture settings used at the moment of generation for the summary
  const [generatedSettings, setGeneratedSettings] = useState<VoiceSettings | null>(null);
  const [generatedVoice, setGeneratedVoice] = useState<VoiceOption | null>(null);
  const [fileExtension, setFileExtension] = useState<string>('mp3');

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Mohon masukkan teks untuk menghasilkan suara.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioState(null);

    try {
      const base64Audio = await generateSpeech(text, selectedVoice.apiVoiceName, settings.pitch);
      
      // Create Blob (MP3 with WAV fallback handled internally)
      const blob = createMp3Blob(base64Audio);
      const url = URL.createObjectURL(blob);
      
      // Detect type for correct extension label
      const ext = blob.type.includes('wav') ? 'wav' : 'mp3';
      setFileExtension(ext);

      setAudioState({
        blob: blob,
        url: url,
        base64: base64Audio
      });
      
      // Save snapshot of settings for the result card
      setGeneratedSettings({...settings});
      setGeneratedVoice(selectedVoice);
      
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "Gagal menghasilkan suara. Periksa API key Anda dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioState) {
      const a = document.createElement('a');
      a.href = audioState.url;
      a.download = `${generatedVoice?.name || 'audio'}_${Date.now()}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 selection:bg-sky-200 selection:text-sky-900 bg-sky-50 font-sans">
      <Header />

      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-10 flex flex-col lg:flex-row gap-5 lg:gap-8">
        
        {/* Left Panel: Controls (Voice & Settings) */}
        <div className="w-full lg:w-[380px] flex-shrink-0 space-y-5">
          {/* Voice Selection */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-200 shadow-xl shadow-sky-100/50 flex flex-col">
            <h2 className="text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sky-700">
              <SparklesIcon className="w-5 h-5 text-sky-500" />
              Pilih Suara
            </h2>
            <VoiceSelector 
              selected={selectedVoice} 
              onSelect={setSelectedVoice} 
            />
          </div>

          {/* Audio Settings */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-200 shadow-xl shadow-sky-100/50">
             <h2 className="text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sky-700">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-sky-500" />
              Parameter
            </h2>
            <VoiceControls 
              settings={settings}
              onChange={setSettings}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Right Panel: Editor & Result */}
        <div className="w-full flex-grow space-y-5">
          
          {/* Input Section */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-sky-200 shadow-xl shadow-sky-100/50 flex flex-col min-h-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-sky-700 flex items-center gap-2">
                <div className="w-1 h-6 bg-sky-500 rounded-full"></div>
                Input Teks
              </h2>
              <div className={`text-xs font-mono px-2 py-1 rounded-md ${text.length > 9000 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                {text.length} / 10000
              </div>
            </div>
            
            <TextInput 
              value={text} 
              onChange={setText} 
              disabled={isLoading}
              placeholder="Masukkan teks Anda di sini untuk dikonversi menjadi suara yang hidup..."
            />
            
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className={`
                  flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg w-full sm:w-auto
                  ${isLoading || !text.trim() 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25 hover:shadow-sky-500/40'}
                `}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <SpeakerWaveIcon className="w-6 h-6" />
                    <span>Hasilkan Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold block text-sm uppercase tracking-wide">Terjadi Kesalahan</span>
                <span className="text-sm block mt-1 leading-relaxed">{error}</span>
              </div>
            </div>
          )}

          {/* Result Card - Sky Blue Gradient Theme */}
          {audioState && generatedSettings && generatedVoice && (
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-2xl shadow-sky-200/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white rounded-2xl overflow-hidden">
                
                {/* Header of Result Card */}
                <div className="bg-slate-50 p-3 sm:p-4 border-b border-sky-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-sky-100 p-1.5 rounded-full">
                            <CheckBadgeIcon className="w-5 h-5 text-sky-600" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm sm:text-base">Audio Berhasil Dibuat</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider border border-slate-200 px-2 py-1 rounded">
                        {fileExtension.toUpperCase()} • 128kbps
                    </span>
                </div>

                <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                    {/* Audio Player */}
                    <AudioPlayer 
                        audioUrl={audioState.url} 
                        volume={settings.volume}
                        playbackRate={settings.speakingRate}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                         {/* Settings Summary */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ringkasan Output</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                                    <div className="text-[10px] text-slate-400 mb-0.5">Suara</div>
                                    <div className="text-sm font-semibold text-sky-700 truncate" title={generatedVoice.name}>{generatedVoice.name}</div>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                                    <div className="text-[10px] text-slate-400 mb-0.5">Kategori</div>
                                    <div className="text-sm font-medium text-slate-700 truncate" title={generatedVoice.category}>{generatedVoice.category}</div>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                                    <div className="text-[10px] text-slate-400 mb-0.5">Kecepatan / Nada</div>
                                    <div className="text-sm font-medium text-blue-600">
                                        {generatedSettings.speakingRate}x <span className="text-slate-300">|</span> {generatedSettings.pitch > 0 ? '+' : ''}{generatedSettings.pitch}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                                    <div className="text-[10px] text-slate-400 mb-0.5">Volume</div>
                                    <div className="text-sm font-medium text-slate-700">
                                        {Math.round(generatedSettings.volume * 100)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex flex-col justify-end space-y-3">
                             <button 
                                onClick={handleDownload}
                                className="w-full group relative flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white px-6 py-3.5 rounded-xl transition-all overflow-hidden shadow-lg shadow-slate-300"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-sky-600/30 to-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <ArrowDownTrayIcon className="w-5 h-5 text-sky-300 group-hover:text-white transition-colors relative z-10" />
                                <span className="relative z-10 font-semibold group-hover:text-white">Unduh Audio (.{fileExtension})</span>
                            </button>
                            <p className="text-[10px] text-center text-slate-400 px-2">
                                Audio dihasilkan menggunakan teknologi Gemini 2.5 Flash TTS.
                            </p>
                        </div>
                    </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;