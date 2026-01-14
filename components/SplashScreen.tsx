
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LOGO_URL } from '../constants';

const SplashScreen: React.FC = () => {
  const [particles, setParticles] = useState<{ id: number; top: string; left: string; size: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900 to-indigo-950">
      {/* Golden Particles Background */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="particle absolute"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size, backgroundColor: '#fbbf24', borderRadius: '50%' }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}

      {/* Main Logo and Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative mb-8 px-10"
      >
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-amber-500 shadow-[0_0_60px_rgba(251,191,36,0.4)] bg-transparent">
          <img 
            src={LOGO_URL} 
            alt="Web Rádio Um Novo Dia" 
            className="w-full h-full object-cover rounded-full scale-110"
          />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-amber-400 text-center px-6 text-lg md:text-xl font-light italic max-w-md leading-relaxed"
      >
        “Levando esperança, fé e uma palavra de vida todos os dias”
      </motion.p>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "120px" }}
        transition={{ delay: 2, duration: 1.5 }}
        className="h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-8"
      />
    </div>
  );
};

export default SplashScreen;
