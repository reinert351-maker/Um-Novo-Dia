
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import Player from './components/Player';
import ContactSection from './components/ContactSection';
import RequestForm from './components/RequestForm';
import Background from './components/Background';
import { STREAM_URL } from './constants';
import { Play, Pause, MessageCircle, Heart, Music, Home } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'contact' | 'prayer' | 'praise'>('home');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initializing audio object with CORS support for visualizer
    const audio = new Audio();
    audio.src = STREAM_URL;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    
    // Hide splash after 4 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Error playing stream:", e);
        // Fallback for browser policy: try playing again on user interaction
      });
    }
    setIsPlaying(!isPlaying);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col text-white selection:bg-amber-500 selection:text-white">
      <Background />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header onLogoClick={() => setActiveView('home')} />

        {/* Persistent Player - Suspended at the top */}
        <div className="sticky top-[64px] md:top-[80px] z-20 bg-purple-950/40 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="container mx-auto max-w-4xl">
            <Player isPlaying={isPlaying} onTogglePlay={togglePlay} audioRef={audioRef} />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl pb-32">
          <AnimatePresence mode="wait">
            {activeView === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ContactSection 
                  onOpenPrayer={() => setActiveView('prayer')} 
                  onOpenPraise={() => setActiveView('praise')} 
                />
              </motion.div>
            )}

            {(activeView === 'prayer' || activeView === 'praise') && (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <RequestForm 
                  type={activeView as 'prayer' | 'praise'} 
                  onBack={() => setActiveView('contact')} 
                />
              </motion.div>
            )}

            {activeView === 'home' && (
              <motion.div
                key="home-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-10"
              >
                <p className="text-amber-400/30 text-[10px] font-black uppercase tracking-[0.4em]">
                  Você está ouvindo a rádio que toca no seu coração
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-purple-950/90 backdrop-blur-2xl border-t border-amber-500/20 p-4 pb-8 md:pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-around items-center max-w-lg mx-auto">
            <button 
              onClick={() => setActiveView('home')}
              className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'home' ? 'text-amber-400 scale-110' : 'text-purple-300 hover:text-amber-200'}`}
            >
              <Home size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
            </button>
            <button 
              onClick={() => setActiveView('contact')}
              className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'contact' ? 'text-amber-400 scale-110' : 'text-purple-300 hover:text-amber-200'}`}
            >
              <MessageCircle size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Contato</span>
            </button>
            
            <div className="relative -mt-12">
               <motion.button 
                onClick={togglePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-amber-300 rounded-2xl flex items-center justify-center shadow-[0_15px_35px_rgba(251,191,36,0.4)] text-purple-950 border-4 border-purple-950/50 transition-all"
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </motion.button>
              {isPlaying && (
                <motion.div 
                  layoutId="playing-pulse"
                  className="absolute -inset-2 bg-amber-500/20 rounded-3xl -z-10 blur-xl"
                  animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            <button 
              onClick={() => setActiveView('prayer')}
              className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'prayer' ? 'text-amber-400 scale-110' : 'text-purple-300 hover:text-amber-200'}`}
            >
              <Heart size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Oração</span>
            </button>
            <button 
              onClick={() => setActiveView('praise')}
              className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'praise' ? 'text-amber-400 scale-110' : 'text-purple-300 hover:text-amber-200'}`}
            >
              <Music size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Louvor</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;
