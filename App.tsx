
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import Player from './components/Player';
import ContactSection from './components/ContactSection';
import RequestForm from './components/RequestForm';
import Background from './components/Background';
import { STREAM_URL, LOGO_URL } from './constants';
import { Play, Pause, MessageCircle, Heart, Music, Home } from 'lucide-react';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'contact' | 'prayer' | 'praise'>('home');
  const [currentSong, setCurrentSong] = useState({ title: 'Web Rádio Um Novo Dia', artist: 'Levando esperança e fé' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Update Media Session whenever song or play state changes
  useEffect(() => {
    if ('mediaSession' in navigator && isPlaying) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: 'Web Rádio Um Novo Dia',
        artwork: [{ src: LOGO_URL, sizes: '512x512', type: 'image/png' }]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('stop', () => {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      });
    }
  }, [currentSong, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="relative min-h-screen w-full flex flex-col text-white selection:bg-amber-500 selection:text-white overflow-hidden">
      <Background />
      
      {/* Hidden but physical audio element for better OS background support */}
      <audio 
        ref={audioRef} 
        src={STREAM_URL} 
        crossOrigin="anonymous" 
        preload="auto" 
        className="hidden"
      />

      <div className="relative z-10 flex flex-col h-full overflow-y-auto">
        <Header onLogoClick={() => setActiveView('home')} />

        <div className="sticky top-0 z-20 bg-purple-950/40 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="container mx-auto max-w-4xl">
            <Player 
              isPlaying={isPlaying} 
              onTogglePlay={togglePlay} 
              audioRef={audioRef} 
              onMetadataUpdate={(title, artist) => setCurrentSong({ title, artist })}
            />
          </div>
        </div>

        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl pb-32">
          <AnimatePresence mode="wait">
            {activeView === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <ContactSection onOpenPrayer={() => setActiveView('prayer')} onOpenPraise={() => setActiveView('praise')} />
              </motion.div>
            )}
            {(activeView === 'prayer' || activeView === 'praise') && (
              <motion.div key="form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                <RequestForm type={activeView as 'prayer' | 'praise'} onBack={() => setActiveView('contact')} />
              </motion.div>
            )}
            {activeView === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-10">
                <div className="space-y-4">
                  <p className="text-amber-400/30 text-[10px] font-black uppercase tracking-[0.4em]">Sintonize a Esperança</p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: isPlaying ? [10, 30, 10] : 10 }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-amber-500/20 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-purple-950/90 backdrop-blur-2xl border-t border-amber-500/20 p-4 pb-8 md:pb-4">
          <div className="flex justify-around items-center max-w-lg mx-auto">
            <button onClick={() => setActiveView('home')} className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'home' ? 'text-amber-400' : 'text-purple-300'}`}>
              <Home size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Início</span>
            </button>
            <button onClick={() => setActiveView('contact')} className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'contact' ? 'text-amber-400' : 'text-purple-300'}`}>
              <MessageCircle size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Contato</span>
            </button>
            <div className="relative -mt-12">
               <motion.button 
                onClick={togglePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-gradient-to-tr from-amber-600 to-amber-300 rounded-2xl flex items-center justify-center shadow-2xl text-purple-950 border-4 border-purple-950"
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </motion.button>
            </div>
            <button onClick={() => setActiveView('prayer')} className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'prayer' ? 'text-amber-400' : 'text-purple-300'}`}>
              <Heart size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">Oração</span>
            </button>
            <button onClick={() => setActiveView('praise')} className={`flex flex-col items-center space-y-1 transition-all ${activeView === 'praise' ? 'text-amber-400' : 'text-purple-300'}`}>
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
