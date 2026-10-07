// src/components/WeatherAnimation.jsx
import React, { useMemo, useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim"; 
import { rainOptions, snowOptions } from '../utils/animationOptions';
import CloudAnimation from './CloudAnimation';

const WeatherAnimation = ({ weatherIcon }) => {
  // Logika untuk memilih animasi yang tepat
  const isRaining = weatherIcon.includes('rain') || weatherIcon.includes('showers') || weatherIcon.includes('thunder');
  const isCloudy = weatherIcon.includes('cloudy');
  const isSnowing = weatherIcon.includes('snow');
  
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo(() => {
    if (isRaining) return rainOptions;
    if (isSnowing) return snowOptions;
    return {};
  }, [isRaining, isSnowing]);

  // Tampilkan animasi awan jika berawan dan tidak hujan/salju
  if (isCloudy && !isRaining && !isSnowing) {
    return <CloudAnimation />;
  }
  
  // Jika tidak ada opsi partikel (cuaca cerah, dll.), jangan tampilkan apa-apa
  if (!Object.keys(options).length) {
    return null;
  }

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
      className="absolute top-0 left-0 w-full h-full z-0"
    />
  );
};

export default WeatherAnimation;