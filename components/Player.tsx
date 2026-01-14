
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
        console.warn("Real-time analysis blocked (CORS). Using advanced simulation.");
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
            const noise = Math.sin(time + i * 0.2) * 15 + Math.sin(time * 0.5 + i * 0.1) * 10;
            const base = 10 + Math.random() * 5;
            barHeight = Math.max(5, (base + noise + Math.abs(Math.sin(i * 0.05) * 40)) % height);
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
          if (isSelected) {
            ctx.shadowBlur = 4;
            ctx.shadowColor = color;
          } else {
            ctx.shadowBlur = 0;
          }
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
    <div className="w-full bg-black/60 p-3 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
      <canvas ref={canvasRef} width={600} height={100} className="w-full h-16 md:h-24 block" />
    </div>
  );
};

const Player: React.FC<PlayerProps> = ({ isPlaying, onTogglePlay, audioRef }) => {
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

  const parseMetadataString = (str: string) => {
    if (!str || str.length < 3) return null;
    const clean = str.trim();
    if (clean.includes(" - ")) {
      const parts = clean.split(" - ");
      return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
    }
    const lower = clean.toLowerCase();
    if (lower.includes("zeno.fm") || lower.includes("http") || lower.includes("stream")) return null;
    return { artist: "Web Rádio Um Novo Dia", title: clean };
  };

  const extractSongData = (data: any) => {
    if (!data) return null;
    const np = data.now_playing || data;
    const listeners = data.listeners || data.play_count || np.listeners;
    if (np.title && np.artist && !np.title.includes("Zeno.FM")) {
      return { title: np.title, artist: np.artist, listeners };
    }
    const rawText = np.text || np.stream_title || data.stream_title || data.title;
    if (rawText) {
      const parsed = parseMetadataString(rawText);
      if (parsed) return { ...parsed, listeners };
    }
    return null;
  };

  const fetchMetadata = async () => {
    const radioId = "3b9u03vcqs8uv";
    const endpoints = [`https://api.zeno.fm/public/v2/display/${radioId}`];
    setIsLoadingMetadata(true);
    
    for (const baseUrl of endpoints) {
      try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(baseUrl)}&t=${Date.now()}`);
        if (!response.ok) continue;
        const json = await response.json();
        const data = JSON.parse(json.contents);
        const songInfo = extractSongData(data);

        if (songInfo && songInfo.title !== "Sintonizando...") {
          if (songInfo.title !== lastSongRef.current.title) {
            if (lastSongRef.current.title && lastSongRef.current.title !== "Sintonizando...") {
              const historyItem: Song = {
                id: Date.now().toString(),
                title: lastSongRef.current.title,
                artist: lastSongRef.current.artist,
                playedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              };
              setRecentSongs(prev => [historyItem, ...prev].slice(0, 5));
            }
            lastSongRef.current = { title: songInfo.title, artist: songInfo.artist };
            setCurrentSong({ title: songInfo.title, artist: songInfo.artist, listeners: songInfo.listeners });
          } else {
            setCurrentSong(prev => ({ ...prev, listeners: songInfo.listeners }));
          }
          setIsLoadingMetadata(false);
          return;
        }
      } catch (e) {}
    }
    setIsLoadingMetadata(false);
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

      {/* Date and Time Bar */}
      <div className="w-full flex items-center justify-center gap-4 py-1 border-b border-white/5 mb-2">
        <div className="flex items-center gap-2 text-amber-500/60 font-black text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-inter">
          <Clock size={10} />
          <span>{dayName}</span>
          <span className="opacity-30">|</span>
          <span className="text-white/80 tabular-nums">{timeStr}</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-[1.2fr_1.5fr_auto] items-center gap-4 md:gap-6">
        
        {/* Modern 65-Band Visualizer Section */}
        <div className="w-full">
          <SpectrumAnalyzer isPlaying={isPlaying} audioRef={audioRef} />
        </div>

        {/* Info Section */}
        <div className="flex-grow text-center md:text-left space-y-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-white/10'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {isPlaying ? "ON AIR • DIGITAL HD" : "STANDBY"}
              </span>
            </div>
            {currentSong.listeners !== undefined && (
              <span className="text-[9px] text-amber-400 font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 inline-flex items-center gap-1 self-center">
                <Users size={10} /> {currentSong.listeners} OUVINTES
              </span>
            )}
            {isLoadingMetadata && <RefreshCw size={10} className="animate-spin text-amber-500/50 self-center" />}
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="min-w-0 flex-grow">
              <AnimatePresence mode="wait">
                <motion.h3 
                  key={currentSong.title}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white text-lg md:text-2xl font-black italic tracking-tighter truncate drop-shadow-lg leading-tight uppercase"
                >
                  {currentSong.title}
                </motion.h3>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentSong.artist}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] truncate opacity-80"
                >
                  {currentSong.artist}
                </motion.p>
              </AnimatePresence>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="p-2 md:p-3 bg-white/5 hover:bg-amber-500 hover:text-purple-950 rounded-xl transition-all border border-white/10 active:scale-90 flex-shrink-0"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Desktop History Mini-Panel */}
        <div className="hidden md:flex flex-col items-end gap-2 border-l border-white/5 pl-8">
           <div className="flex items-center gap-2 text-white/20 uppercase font-black text-[8px] tracking-[0.3em]">
              <History size={10} /> RECENTS
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
