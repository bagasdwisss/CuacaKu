// src/components/WeatherAnimation.jsx
import React, { useMemo, useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; 
import { rainOptions, snowOptions } from '../utils/animationOptions';
import CloudAnimation from './CloudAnimation';

// 1. Asset Foto Matahari Realistis (sun.jpg) dengan rotasi & pendaran sinar kosmik
const SunAnimation = () => (
  <div className="absolute -top-12 -right-12 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none overflow-hidden z-0">
    <img
      src="/sun.jpg"
      alt="Matahari Realistis"
      className="w-full h-full object-contain animate-spin-slow opacity-85 select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  </div>
);

// 2. Asset Foto Bulan Sabit & Bintang Kosmik Realistis (moon.jpg)
const NightMoonAnimation = () => (
  <div className="absolute -top-6 -right-6 w-56 h-56 sm:w-72 sm:h-72 pointer-events-none overflow-hidden z-0">
    <img
      src="/moon.jpg"
      alt="Bulan & Bintang Realistis"
      className="w-full h-full object-contain animate-pulse-slow opacity-90 select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  </div>
);

// 3. Asset Foto Kilatan Petir Nyata (lightning.jpg) dengan animasi sambaran dramatis
const LightningAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <img
      src="/lightning.jpg"
      alt="Kilatan Petir Realistis"
      className="w-full h-full object-cover animate-lightning-flash select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  </div>
);

// 4. Asset Foto Aliran Kabut & Hawa Dingin Realistis (mist.jpg)
const MistAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <img
      src="/mist.jpg"
      alt="Kabut Realistis 1"
      className="absolute -inset-x-1/4 top-1/4 w-[150%] h-36 object-cover opacity-60 animate-mist-drift-1 select-none"
      style={{ mixBlendMode: 'screen' }}
    />
    <img
      src="/mist.jpg"
      alt="Kabut Realistis 2"
      className="absolute -inset-x-1/4 top-1/2 w-[150%] h-40 object-cover opacity-50 animate-mist-drift-2 select-none"
      style={{ mixBlendMode: 'screen' }}
    />
  </div>
);

const WeatherAnimation = ({ weatherIcon = '' }) => {
  const icon = String(weatherIcon).toLowerCase();

  const isThunder = icon.includes('thunder');
  const isRaining = isThunder || icon.includes('rain') || icon.includes('showers');
  const isSnowing = icon.includes('snow');
  const isCloudy = icon.includes('cloudy') || icon.includes('overcast');
  const isClearDay = icon.includes('clear-day') || (icon.includes('clear') && !icon.includes('night'));
  const isClearNight = icon.includes('clear-night') || icon.includes('night');
  const isFogOrWind = icon.includes('fog') || icon.includes('wind') || icon.includes('haze');

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(() => {
    if (isRaining) return rainOptions;
    if (isSnowing) return snowOptions;
    return null;
  }, [isRaining, isSnowing]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. Hujan / Salju Partikel Dinamis */}
      {options && (
        <Particles
          id={`tsparticles-${icon}`}
          init={particlesInit}
          options={options}
          className="absolute top-0 left-0 w-full h-full z-0"
        />
      )}

      {/* 2. Kilatan Petir Realistis (Foto Asli lightning.jpg) */}
      {isThunder && <LightningAnimation />}

      {/* 3. Awan Bergerak Realistis (Foto Asli cloud1.png, cloud2.png, cloud3.png) */}
      {(isCloudy || isRaining) && <CloudAnimation />}

      {/* 4. Matahari Nyata Bersinar (Foto Asli sun.jpg) jika Siang Cerah / Berawan Siang */}
      {(isClearDay || (isCloudy && icon.includes('day'))) && !isRaining && !isSnowing && (
        <SunAnimation />
      )}

      {/* 5. Bulan Sabit & Bintang Nyata (Foto Asli moon.jpg) jika Malam Cerah / Berawan Malam */}
      {(isClearNight || (isCloudy && icon.includes('night'))) && !isRaining && (
        <NightMoonAnimation />
      )}

      {/* 6. Aliran Kabut Asli (Foto Asli mist.jpg) jika Berkabut / Berangin */}
      {isFogOrWind && <MistAnimation />}
    </div>
  );
};

export default WeatherAnimation;