
import React from 'react';
import { motion } from 'framer-motion';
import { LOGO_URL } from '../constants';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1e1b4b]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative mb-8"
      >
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-amber-500 shadow-[0_0_60px_rgba(251,191,36,0.3)] bg-purple-950 flex items-center justify-center">
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            className="w-full h-full object-cover rounded-full scale-[1.5]"
          />
        </div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-amber-400 font-bold italic">
        Sintonizando esperança...
      </motion.p>
    </div>
  );
};

export default SplashScreen;
