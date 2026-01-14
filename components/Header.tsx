
import React, { useState } from 'react';
import { LOGO_URL } from '../constants';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-purple-950/60 backdrop-blur-md border-b border-amber-500/20 py-4">
      <div className="container mx-auto flex justify-center items-center">
        <button 
          onClick={onLogoClick}
          className="transition-transform hover:scale-105 active:scale-95 px-4"
        >
          {!imageError ? (
            <div className="h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden border-2 border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.2)] logo-glow bg-transparent">
              <img 
                src={LOGO_URL} 
                alt="Web Rádio Logo" 
                onError={() => setImageError(true)}
                className="w-full h-full object-cover rounded-full scale-110"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-amber-400 font-black text-xl italic tracking-tighter">Web Rádio</span>
              <span className="text-white font-light text-xs tracking-[0.3em] uppercase -mt-1">Um Novo Dia</span>
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
