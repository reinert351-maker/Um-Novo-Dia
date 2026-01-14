
import React from 'react';
import { LOGO_URL } from '../constants';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-purple-950/60 backdrop-blur-md border-b border-amber-500/20 py-4">
      <div className="container mx-auto flex justify-center items-center">
        <button 
          onClick={onLogoClick}
          className="transition-transform hover:scale-105 active:scale-95 px-4"
        >
          <img 
            src={LOGO_URL} 
            alt="Web Rádio Logo" 
            className="h-12 md:h-16 object-contain logo-glow"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
