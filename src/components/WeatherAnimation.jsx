// src/components/WeatherAnimation.jsx
import React, { useMemo, useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; 
import { rainOptions, snowOptions } from '../utils/animationOptions';
import CloudAnimation from './CloudAnimation';

// 1. Aset Gambar Matahari (Siang Cerah)
const SunAnimation = () => (
  <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none overflow-hidden z-0">
    {/* Halo cahaya hangat */}
    <div className="absolute top-0 right-0 w-52 h-52 rounded-full bg-yellow-300/20 blur-2xl animate-pulse-slow" />
    {/* Aset Gambar Matahari PNG Transparan */}
    <img
      src="/sun.png"
      alt=""
      className="absolute -top-6 -right-6 w-48 h-48 opacity-90 animate-spin-slow drop-shadow-[0_0_20px_rgba(253,184,19,0.45)]"
    />
  </div>
);

// 2. Aset Gambar Bulan & Bintang (Malam Cerah)
const NightStarsAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Aset Gambar Bulan Sabit PNG Transparan */}
    <img
      src="/moon.png"
      alt=""
      className="absolute top-3 right-6 w-28 h-28 opacity-85 animate-float-slow drop-shadow-[0_0_15px_rgba(224,231,255,0.4)]"
    />
    {/* Aset Gambar Gugusan Bintang PNG Transparan */}
    <img
      src="/stars.png"
      alt=""
      className="absolute top-4 left-8 w-44 h-44 opacity-80 animate-twinkle-fast"
    />
    <img
      src="/stars.png"
      alt=""
      className="absolute bottom-4 right-20 w-36 h-36 opacity-60 animate-twinkle-slow"
      style={{ animationDelay: '1.8s' }}
    />
    {/* Efek Bintang Jatuh */}
    <div className="absolute top-6 right-36 w-20 h-0.5 bg-gradient-to-l from-white via-cyan-200 to-transparent -rotate-45 animate-shooting-star opacity-0" />
  </div>
);

// 3. Aset Gambar Kilatan Petir (Badai Petir)
const LightningAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {/* Kilatan cahaya sekilas */}
    <div className="absolute inset-0 bg-blue-100/30 animate-lightning-flash mix-blend-overlay" />
    {/* Aset Gambar Petir PNG Transparan */}
    <img
      src="/lightning.png"
      alt=""
      className="absolute top-2 right-1/4 w-36 h-52 opacity-0 animate-lightning-flash drop-shadow-[0_0_25px_rgba(250,204,21,0.85)]"
    />
    <img
      src="/lightning.png"
      alt=""
      className="absolute top-8 left-1/4 w-28 h-40 opacity-0 animate-lightning-flash drop-shadow-[0_0_20px_rgba(96,165,250,0.8)]"
      style={{ animationDelay: '3.5s' }}
    />
  </div>
);

// 4. Aset Gambar Tetesan Hujan (Hujan / Gerimis)
const RainDropsAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <img
      src="/raindrops.png"
      alt=""
      className="absolute top-0 left-12 w-40 opacity-75 animate-rain-fall"
    />
    <img
      src="/raindrops.png"
      alt=""
      className="absolute top-4 right-16 w-36 opacity-65 animate-rain-fall"
      style={{ animationDelay: '0.9s' }}
    />
  </div>
);

// 5. Aset Gambar Kabut Melayang (Kabut / Berangin)
const MistAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <img
      src="/fog.png"
      alt=""
      className="absolute -left-12 top-1/4 w-full opacity-45 animate-mist-drift-1"
    />
    <img
      src="/fog.png"
      alt=""
      className="absolute -right-12 top-1/2 w-full opacity-35 animate-mist-drift-2"
    />
  </div>
);

// 6. Aset Gambar Kristal Salju (Salju)
const SnowflakeAnimation = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <img
      src="/snowflake.png"
      alt=""
      className="absolute top-2 left-1/4 w-12 opacity-85 animate-snow-fall"
    />
    <img
      src="/snowflake.png"
      alt=""
      className="absolute top-6 right-1/3 w-14 opacity-75 animate-snow-fall"
      style={{ animationDelay: '2.5s' }}
    />
    <img
      src="/snowflake.png"
      alt=""
      className="absolute top-10 right-12 w-10 opacity-70 animate-snow-fall"
      style={{ animationDelay: '4.8s' }}
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
      {/* Partikel Dinamis (Hujan / Salju tsparticles) */}
      {options && (
        <Particles
          id={`tsparticles-${icon}`}
          init={particlesInit}
          options={options}
          className="absolute top-0 left-0 w-full h-full z-0"
        />
      )}

      {/* 1. Hujan: Aset Tetesan Air PNG */}
      {isRaining && <RainDropsAnimation />}

      {/* 2. Badai: Aset Kilatan Petir PNG */}
      {isThunder && <LightningAnimation />}

      {/* 3. Awan: Aset Awan Bergerak PNG (/cloud1.png, /cloud2.png, /cloud3.png) */}
      {(isCloudy || isRaining) && <CloudAnimation />}

      {/* 4. Siang Cerah: Aset Gambar Matahari PNG (/sun.png) */}
      {(isClearDay || (isCloudy && icon.includes('day'))) && !isRaining && !isSnowing && (
        <SunAnimation />
      )}

      {/* 5. Malam Cerah: Aset Gambar Bulan & Bintang PNG (/moon.png & /stars.png) */}
      {(isClearNight || (isCloudy && icon.includes('night'))) && !isRaining && (
        <NightStarsAnimation />
      )}

      {/* 6. Kabut / Berangin: Aset Gambar Kabut PNG (/fog.png) */}
      {isFogOrWind && <MistAnimation />}

      {/* 7. Salju: Aset Gambar Kristal Salju PNG (/snowflake.png) */}
      {isSnowing && <SnowflakeAnimation />}
    </div>
  );
};

export default WeatherAnimation;