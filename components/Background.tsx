
import React from 'react';
import { LOGO_URL } from '../constants';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#1e1b4b]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
        <div className="w-[120vw] h-[120vw] rounded-full overflow-hidden blur-3xl">
          <img 
            src={LOGO_URL} 
            alt="" 
            className="w-full h-full object-cover scale-[1.6]"
          />
        </div>
      </div>
    </div>
  );
};

export default Background;
