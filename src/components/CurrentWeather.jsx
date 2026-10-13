// src/components/CurrentWeather.jsx
import React, { useRef, useEffect } from 'react';
import WeatherAnimation from './WeatherAnimation';
import { getWeatherIcon } from '../utils/iconService';
import { translateWeatherCondition } from '../utils/translations';
import { isDaytime } from '../utils/timeUtils';
import { useSettings } from '../context/settingsContext';
import { WiSunrise, WiSunset } from 'react-icons/wi';

// Helper fungsi untuk memilih background video sesuai cuaca
const getWeatherVideo = (iconName = '') => {
  const icon = String(iconName).toLowerCase();
  if (icon.includes('thunder')) {
    return '/hujanpetirlandscape.mp4';
  }
  if (icon.includes('rain') || icon.includes('showers') || icon.includes('drizzle')) {
    return '/hujanlandscape.mp4';
  }
  if (icon.includes('cloudy') || icon.includes('overcast')) {
    return '/berawanlandscape.mp4';
  }
  if (icon.includes('clear')) {
    return '/cerahlandscape.mp4';
  }
  // Default fallback untuk jenis cuaca lainnya (fog, wind, dll)
  return '/berawanlandscape.mp4';
};

// Helper fungsi untuk memilih background lokal gradien (fallback & warna dasar)
const getLocalBackgroundClass = (icon, isDay) => {
  const gradients = {
    clearDay: 'from-sky-500 to-blue-600',
    clearNight: 'from-slate-900 to-indigo-950',
    cloudy: 'from-slate-600 to-gray-800',
    rain: 'from-slate-700 to-gray-900',
  };

  let bgClass = '';
  if (icon.includes('rain') || icon.includes('showers') || icon.includes('thunder')) {
    bgClass = gradients.rain;
  } else if (icon.includes('cloudy') || icon.includes('overcast')) {
    bgClass = gradients.cloudy;
  } else if (icon.includes('clear')) {
    bgClass = isDay ? gradients.clearDay : gradients.clearNight;
  } else {
    bgClass = isDay ? gradients.cloudy : gradients.clearNight;
  }
  return `bg-gradient-to-br ${bgClass}`;
};

// Helper untuk Kualitas Udara (AQI mentah 0-500)
const AQI_LEVELS = {
  1: { label: 'Baik', color: 'bg-green-500' },
  2: { label: 'Sedang', color: 'bg-yellow-500' },
  3: { label: 'Kurang Sehat', color: 'bg-orange-500' },
  4: { label: 'Tidak Sehat', color: 'bg-red-500' },
  5: { label: 'Sangat Tidak Sehat', color: 'bg-purple-700' },
};

const getAQICategory = (aqi) => {
  if (aqi === null || aqi === undefined) return { label: 'N/A', color: 'bg-gray-400' };
  if (aqi <= 50) return AQI_LEVELS[1];
  if (aqi <= 100) return AQI_LEVELS[2];
  if (aqi <= 150) return AQI_LEVELS[3];
  if (aqi <= 200) return AQI_LEVELS[4];
  return AQI_LEVELS[5];
};

// Helper untuk Indeks UV
const UV_LEVELS = {
  low: { label: 'Rendah', color: 'bg-green-500' },
  moderate: { label: 'Sedang', color: 'bg-yellow-500' },
  high: { label: 'Tinggi', color: 'bg-orange-500' },
  veryHigh: { label: 'Sangat Tinggi', color: 'bg-red-500' },
  extreme: { label: 'Ekstrem', color: 'bg-purple-700' },
};

const getUVCategory = (uv) => {
  if (uv <= 2) return UV_LEVELS.low;
  if (uv <= 5) return UV_LEVELS.moderate;
  if (uv <= 7) return UV_LEVELS.high;
  if (uv <= 10) return UV_LEVELS.veryHigh;
  return UV_LEVELS.extreme;
};

const CurrentWeather = ({ data }) => {
  const { location, current, timezone } = data;
  const { formatTemp, formatWind } = useSettings();
  const videoRef = useRef(null);

  const isDay = isDaytime(current);
  const backgroundClass = getLocalBackgroundClass(current.icon, isDay);
  const videoSrc = getWeatherVideo(current.icon);
  const aqiData = getAQICategory(current.aqi);
  const uvCategory = getUVCategory(current.uvindex);

  // Pastikan video memutar otomatis di berbagai browser / mobile policy
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser autoplay policy dicegah secara halus tanpa error
        });
      }
    }
  }, [videoSrc]);

  const timeFormatOptions = {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: timezone,
  };
  const clock = { hour: '2-digit', minute: '2-digit', timeZone: timezone };

  return (
    <div className={`relative p-5 sm:p-7 rounded-3xl shadow-2xl overflow-hidden transition-all duration-1000 text-white ${backgroundClass}`}>
      {/* Video Background (Jelas & Terang dengan opacity tinggi, Responsif, Object-Cover, Muted, Infinite Loop) */}
      <video
        ref={videoRef}
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none brightness-100 contrast-[1.05] transform-gpu opacity-95"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Lapisan Gradient Halus Tipis agar video tetap terlihat jelas & hidup sambil menjaga keterbacaan teks */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/20 z-[1] pointer-events-none" />

      {/* Lapisan Animasi Partikel Tambahan jika ada (z-[2]) */}
      <div className="absolute inset-0 w-full h-full z-[2] pointer-events-none">
        <WeatherAnimation weatherIcon={current.icon} />
      </div>

      {/* Lapisan Konten Utama (z-10) */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {location.name}
              {location.country && location.name.toLowerCase() !== location.country.toLowerCase() ? `, ${location.country}` : ''}
            </h2>
            <p className="text-white/90 text-sm sm:text-base mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{new Date().toLocaleString('id-ID', timeFormatOptions)}</p>
            <div className="flex items-center mt-4">
              <div className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">{getWeatherIcon(current.icon)}</div>
              <div className="ml-4">
                <p className="text-5xl sm:text-6xl font-black tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.8)]">{formatTemp(current.temp)}</p>
                <p className="text-sm text-white/90 -mt-1 font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Terasa seperti {formatTemp(current.feelslike)}</p>
                <p className="text-lg font-bold capitalize mt-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">{translateWeatherCondition(current.conditions)}</p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-white/10 dark:bg-black/20 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 shadow-lg w-full sm:w-auto">
            <div className="flex items-center justify-start sm:justify-end space-x-3 mb-2">
              <WiSunrise size={36} className="text-amber-300 drop-shadow" />
              <span className="text-sm sm:text-base font-semibold drop-shadow">{new Date(current.sunriseEpoch * 1000).toLocaleTimeString('id-ID', clock)}</span>
            </div>
            <div className="flex items-center justify-start sm:justify-end space-x-3">
              <WiSunset size={36} className="text-orange-400 drop-shadow" />
              <span className="text-sm sm:text-base font-semibold drop-shadow">{new Date(current.sunsetEpoch * 1000).toLocaleTimeString('id-ID', clock)}</span>
            </div>
          </div>
        </div>

        {/* 4 Kartu Metrik Cuaca dengan Modern Glassmorphism Style */}
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          {/* UV Index */}
          <div className="bg-white/15 dark:bg-black/25 backdrop-blur-lg rounded-2xl p-3.5 sm:p-4 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] flex flex-col justify-between items-center transition-transform duration-300 hover:scale-[1.02]">
            <p className="text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow">UV Index</p>
            <div className="mt-2 w-full flex justify-center">
              <span className={`font-bold text-xs sm:text-sm px-3 py-1 rounded-full text-white shadow-md border border-white/20 ${uvCategory.color}`}>
                {uvCategory.label} ({current.uvindex})
              </span>
            </div>
          </div>

          {/* Kelembapan */}
          <div className="bg-white/15 dark:bg-black/25 backdrop-blur-lg rounded-2xl p-3.5 sm:p-4 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] flex flex-col justify-between items-center transition-transform duration-300 hover:scale-[1.02]">
            <p className="text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow">Kelembapan</p>
            <p className="font-extrabold text-xl sm:text-2xl mt-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {Math.round(current.humidity)}%
            </p>
          </div>

          {/* Kecepatan Angin */}
          <div className="bg-white/15 dark:bg-black/25 backdrop-blur-lg rounded-2xl p-3.5 sm:p-4 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] flex flex-col justify-between items-center transition-transform duration-300 hover:scale-[1.02]">
            <p className="text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow">Kecepatan Angin</p>
            <p className="font-extrabold text-xl sm:text-2xl mt-1.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              {formatWind(current.windspeed)}
            </p>
          </div>

          {/* Indeks Udara (AQI) */}
          <div className="bg-white/15 dark:bg-black/25 backdrop-blur-lg rounded-2xl p-3.5 sm:p-4 border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] flex flex-col justify-between items-center transition-transform duration-300 hover:scale-[1.02]">
            <p className="text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow">Indeks Udara (AQI)</p>
            <div className="mt-2 w-full flex justify-center">
              <span className={`font-bold text-xs sm:text-sm px-3 py-1 rounded-full text-white shadow-md border border-white/20 ${aqiData.color}`}>
                {aqiData.label} ({current.aqi ?? 'N/A'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;