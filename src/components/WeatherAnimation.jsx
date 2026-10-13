// src/components/WeatherAnimation.jsx
import React, { useMemo, useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; 
import { rainOptions, snowOptions } from '../utils/animationOptions';

const WeatherAnimation = ({ weatherIcon = '' }) => {
  const icon = String(weatherIcon).toLowerCase();

  const isRaining = icon.includes('rain') || icon.includes('showers') || icon.includes('thunder');
  const isSnowing = icon.includes('snow');

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(() => {
    if (isRaining) return rainOptions;
    if (isSnowing) return snowOptions;
    return null;
  }, [isRaining, isSnowing]);

  // Catatan: Awan kini sepenuhnya ditangani oleh aset video cuaca (berawanlandscape.mp4)
  // sehingga CloudAnimation tidak lagi dipanggil agar tidak tumpang tindih dengan video.

  // Jika tidak ada opsi partikel (cuaca cerah, dll.), jangan tampilkan apa-apa
  if (!options) {
    return null;
  }

  return (
    <Particles
      id={`tsparticles-${icon}`}
      init={particlesInit}
      options={options}
      className="absolute top-0 left-0 w-full h-full z-0"
    />
  );
};

export default WeatherAnimation;