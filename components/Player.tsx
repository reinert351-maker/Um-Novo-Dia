
import React, { useState, useEffect, useRef } from 'react';
import { Radio, Activity, ListMusic, History, Music, Volume2, RefreshCw, Share2, CheckCircle2, Users, Clock } from 'lucide-react';
import { DAY_NAMES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface Song {
  id: string;
  title: string;
  artist: string;
  playedAt: string;
}

interface PlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onMetadataUpdate?: (title: string, artist: string) => void;
}

const SpectrumAnalyzer: React.FC<{ isPlaying: boolean; audioRef: React.MutableRefObject<HTMLAudioElement | null> }> = ({ isPlaying, audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const BANDS = 65;

  useEffect(() => {
    if (!audioRef.current) return;

    const setupAudio = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        
        if (!sourceRef.current && audioRef.current) {
          sourceRef.current = ctx.createMediaElementSource(audioRef.current);
          sourceRef.current.connect(analyser);
          analyser.connect(ctx.destination);
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
      } catch (err) {
        // Advanced simulation fallback
      }
    };

    if (isPlaying && !analyserRef.current) {
      setupAudio();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFrame = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / BANDS);
      let x = 0;

      if (isPlaying && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      }

      for (let i = 0; i < BANDS; i++) {
        let barHeight = 0;

        if (isPlaying) {
          if (analyserRef.current && dataArrayRef.current) {
            const binIndex = Math.floor((i / BANDS) * dataArrayRef.current.length * 0.6);
            barHeight = (dataArrayRef.current[binIndex] / 255) * height;
          } else {
            const time = Date.now() / 150;
            const noise = Math.sin(time + i * 0.2) * 15;
            barHeight = Math.max(5, (10 + noise + Math.abs(Math.sin(i * 0.05) * 40)) % height);
          }
        } else {
          barHeight = 2;
        }

        const segments = 12;
        const segHeight = height / segments;
        const activeSegments = Math.ceil((barHeight / height) * segments);

        for (let s = 0; s < segments; s++) {
          const isSelected = s < activeSegments;
          let color = 'rgba(255, 255, 255, 0.05)';
          if (isSelected) {
            if (s < 6) color = '#10b981';
            else if (s < 9) color = '#f59e0b';
            else color = '#ef4444';
          }

          const yPos = height - (s + 1) * segHeight;
          ctx.fillStyle = color;
          ctx.fillRect(x + 1, yPos + 1, barWidth - 2, segHeight - 2);
        }
        x += barWidth;
      }
      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  return (
    <div className="w-full bg-black/60 p-3 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
      <canvas ref={canvasRef} width={600} height={100} className="w-full h-16 md:h-24 block" />
    </div>
  );
};

const Player: React.FC<PlayerProps> = ({ isPlaying, onTogglePlay, audioRef, onMetadataUpdate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSong, setCurrentSong] = useState({ 
    title: "Sintonizando...", 
    artist: "Web Rádio Um Novo Dia",
    listeners: undefined as number | undefined
  });
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);
  
  const lastSongRef = useRef<{title: string, artist: string}>({ title: "", artist: "" });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMetadata = async () => {
    const radioId = "3b9u03vcqs8uv";
    setIsLoadingMetadata(true);
    
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.zeno.fm/public/v2/display/${radioId}`)}&t=${Date.now()}`);
      if (!response.ok) throw new Error();
      const json = await response.json();
      const data = JSON.parse(json.contents);
      
      const np = data.now_playing || data;
      const title = np.title || "Web Rádio Um Novo Dia";
      const artist = np.artist || "Levando esperança e fé";
      const listeners = data.listeners || np.listeners;

      if (title !== lastSongRef.current.title) {
        if (lastSongRef.current.title && lastSongRef.current.title !== "Sintonizando...") {
          const historyItem: Song = {
            id: Date.now().toString(),
            title: lastSongRef.current.title,
            artist: lastSongRef.current.artist,
            playedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
          setRecentSongs(prev => [historyItem, ...prev].slice(0, 5));
        }
        lastSongRef.current = { title, artist };
        setCurrentSong({ title, artist, listeners });
        if (onMetadataUpdate) onMetadataUpdate(title, artist);
      } else {
        setCurrentSong(prev => ({ ...prev, listeners }));
      }
    } catch (e) {
      console.warn("Metadata fetch error");
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
    const interval = setInterval(fetchMetadata, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = async () => {
    const text = `Ouvindo "${currentSong.title}" na Web Rádio Um Novo Dia! 🎧🙏`;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: 'Rádio Um Novo Dia', text, url }); } catch (e) {}
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const dayName = DAY_NAMES[currentTime.getDay()];
  const timeStr = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-col items-center py-2 md:py-4 px-4 space-y-4">
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 z-[100] bg-amber-500 text-purple-950 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 border-2 border-white/20"
          >
            <CheckCircle2 size={18} /> Link copiado!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex items-center justify-center gap-4 py-1 border-b border-white/5 mb-2">
        <div className="flex items-center gap-2 text-amber-500/60 font-black text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-inter">
          <Clock size={10} />
          <span>{dayName}</span>
          <span className="opacity-30">|</span>
          <span className="text-white/80 tabular-nums">{timeStr}</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_auto] items-center gap-4 md:gap-6">
        <div className="w-full">
          <SpectrumAnalyzer isPlaying={isPlaying} audioRef={audioRef} />
        </div>

        <div className="flex-grow text-center md:text-left space-y-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-white/10'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {isPlaying ? "AO VIVO • DIGITAL HD" : "PAUSADO"}
              </span>
            </div>
            {currentSong.listeners !== undefined && (
              <span className="text-[9px] text-amber-400 font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 inline-flex items-center gap-1 self-center">
                <Users size={10} /> {currentSong.listeners} OUVINTES
              </span>
            )}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="min-w-0 flex-grow">
              <h3 className="text-white text-lg md:text-2xl font-black italic tracking-tighter truncate leading-tight uppercase">
                {currentSong.title}
              </h3>
              <p className="text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] truncate opacity-80">
                {currentSong.artist}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="p-2 md:p-3 bg-white/5 hover:bg-amber-500 hover:text-purple-950 rounded-xl transition-all border border-white/10 active:scale-90 flex-shrink-0"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end gap-2 border-l border-white/5 pl-8">
           <div className="flex items-center gap-2 text-white/20 uppercase font-black text-[8px] tracking-[0.3em]">
              <History size={10} /> RECENTES
           </div>
           <div className="space-y-1 max-w-[120px]">
             {recentSongs.slice(0, 2).map(song => (
               <div key={song.id} className="text-right">
                 <p className="text-white/40 text-[9px] font-bold truncate">{song.title}</p>
                 <p className="text-amber-500/20 text-[7px] font-black uppercase truncate">{song.artist}</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
