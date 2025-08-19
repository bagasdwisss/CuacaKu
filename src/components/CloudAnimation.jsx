// src/components/CloudAnimation.jsx
import React from 'react';

const CloudAnimation = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        {/* Awan 1 (Belakang, paling lambat) */}
        <img
            src="/cloud1.png"
            alt=""
            className="absolute w-3/5 opacity-30 animate-slide-across-slow"
            style={{ top: '15%' }}
        />

        {/* Awan 2 (Tengah, kecepatan sedang) */}
        <img
            src="/cloud2.png"
            alt=""
            className="absolute w-2/5 opacity-50 animate-slide-across-medium"
            style={{ top: '25%', animationDelay: '-15s' }}
        />

        {/* Awan 3 (Depan, paling cepat) */}
        <img
            src="/cloud1.png"
            alt=""
            className="absolute w-1/2 opacity-40 animate-slide-across-fast"
            style={{ top: '60%', animationDelay: '-25s' }}
        />
    </div>
  );
};

export default CloudAnimation;