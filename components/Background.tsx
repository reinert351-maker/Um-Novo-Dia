
import React from 'react';
import { LOGO_URL } from '../constants';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-purple-950 via-[#1e1b4b] to-indigo-950">
      {/* Blurred background logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
        <div className="w-[120vw] h-[120vw] rounded-full overflow-hidden grayscale blur-3xl flex items-center justify-center">
          <img 
            src={LOGO_URL} 
            alt="" 
            className="w-full h-full object-cover rounded-full scale-125"
          />
        </div>
      </div>

      {/* Subtle light flares */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-800/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[100px]" />
    </div>
  );
};

export default Background;
