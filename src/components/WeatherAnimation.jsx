// src/components/WeatherAnimation.jsx
import React, { useMemo, useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; 
import { rainOptions, snowOptions } from '../utils/animationOptions';
import CloudAnimation from './CloudAnimation';

// Animasi Sinar Matahari Berputar & Berpendar (Clear Day)
const SunAnimation = () => (
  <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none overflow-hidden z-0">
    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-yellow-300/25 blur-2xl animate-pulse-slow" />
    <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 opacity-90 shadow-xl shadow-yellow-400/40 animate-pulse-slow" />
    <div className="absolute top-4 right-4 w-24 h-24 animate-spin-slow origin-center opacity-40">
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-yellow-100 to-transparent transform -translate-y-1/2 scale-x-150" />
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-yellow-100 to-transparent transform -translate-x-1/2 scale-y-150" />
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-yellow-100 to-transparent transform -translate-y-1/2 rotate-45 scale-x-150" />
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-yellow-100 to-transparent transform -translate-y-1/2 -rotate-45 scale-x-150" />
    </div>
  </div>
);

// Animasi Bintang Kelap-Kelip & Bintang Jatuh (Clear Night)
const NightStarsAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute top-6 left-1/4 w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-blue-100 animate-twinkle-fast" />
    <div className="absolute top-12 left-2/3 w-2 h-2 rounded-full bg-indigo-100 shadow-sm shadow-white animate-twinkle-slow" style={{ animationDelay: '1s' }} />
    <div className="absolute top-20 left-1/6 w-1 h-1 rounded-full bg-yellow-100 animate-twinkle-fast" style={{ animationDelay: '2s' }} />
    <div className="absolute top-8 right-1/4 w-1.5 h-1.5 rounded-full bg-white animate-twinkle-slow" style={{ animationDelay: '0.5s' }} />
    <div className="absolute top-24 right-1/3 w-1 h-1 rounded-full bg-blue-100 animate-twinkle-fast" style={{ animationDelay: '1.5s' }} />
    <div className="absolute top-16 left-1/2 w-1.5 h-1.5 rounded-full bg-white animate-twinkle-slow" style={{ animationDelay: '2.5s' }} />
    <div className="absolute top-28 left-3/4 w-1 h-1 rounded-full bg-cyan-100 animate-twinkle-fast" style={{ animationDelay: '3s' }} />
    {/* Efek Bintang Jatuh Periodik */}
    <div className="absolute top-6 right-16 w-20 h-0.5 bg-gradient-to-l from-white via-cyan-200 to-transparent -rotate-45 animate-shooting-star opacity-0" />
  </div>
);

// Animasi Kilatan Petir Realistis (Thunderstorm)
const LightningAnimation = () => (
  <div className="absolute inset-0 pointer-events-none bg-blue-100/40 animate-lightning-flash mix-blend-overlay z-0" />
);

// Animasi Kabut Mengalir Halus (Fog / Mist / Wind)
const MistAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
    <div className="absolute -inset-x-1/4 top-1/4 h-24 bg-gradient-to-r from-transparent via-slate-200/60 to-transparent blur-xl animate-mist-drift-1" />
    <div className="absolute -inset-x-1/4 top-1/2 h-28 bg-gradient-to-r from-transparent via-slate-300/50 to-transparent blur-2xl animate-mist-drift-2" />
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
      {/* 1. Hujan / Salju Partikel */}
      {options && (
        <Particles
          id={`tsparticles-${icon}`}
          init={particlesInit}
          options={options}
          className="absolute top-0 left-0 w-full h-full z-0"
        />
      )}

      {/* 2. Kilatan Petir jika Badai */}
      {isThunder && <LightningAnimation />}

      {/* 3. Awan Bergerak jika Berawan atau Hujan */}
      {(isCloudy || isRaining) && <CloudAnimation />}

      {/* 4. Sinar Matahari Berputar jika Siang Cerah atau Cerah Berawan Siang */}
      {(isClearDay || (isCloudy && icon.includes('day'))) && !isRaining && !isSnowing && (
        <SunAnimation />
      )}

      {/* 5. Bintang & Malam jika Malam Hari Cerah atau Berawan Malam */}
      {(isClearNight || (isCloudy && icon.includes('night'))) && !isRaining && (
        <NightStarsAnimation />
      )}

      {/* 6. Gelombang Kabut jika Berkabut / Berangin */}
      {isFogOrWind && <MistAnimation />}
    </div>
  );
};

export default WeatherAnimation;