// src/components/CurrentWeather.jsx
import React, { useRef, useEffect } from 'react';
import WeatherAnimation from './WeatherAnimation';
import { getWeatherIcon } from '../utils/iconService';
import { translateWeatherCondition } from '../utils/translations';
import { isDaytime } from '../utils/timeUtils';
import { useSettings } from '../context/settingsContext';
import { WiSunrise, WiSunset, WiStrongWind, WiRaindrops } from 'react-icons/wi';
import { FiSun, FiWind } from 'react-icons/fi';
import { FaMapMarkerAlt } from 'react-icons/fa';

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
  return '/berawanlandscape.mp4';
};

// Helper fungsi untuk memilih background lokal gradien (fallback)
const getLocalBackgroundClass = (icon, isDay) => {
  const gradients = {
    clearDay: 'from-sky-500 via-blue-600 to-indigo-700',
    clearNight: 'from-slate-900 via-indigo-950 to-slate-950',
    cloudy: 'from-slate-600 via-gray-700 to-slate-800',
    rain: 'from-slate-700 via-gray-800 to-slate-900',
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
  1: { label: 'Baik', bg: 'bg-emerald-500/90 text-white shadow-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
  2: { label: 'Sedang', bg: 'bg-amber-500/90 text-white shadow-amber-500/40', badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
  3: { label: 'Kurang Sehat', bg: 'bg-orange-500/90 text-white shadow-orange-500/40', badge: 'bg-orange-500/20 text-orange-300 border-orange-400/30' },
  4: { label: 'Tidak Sehat', bg: 'bg-rose-500/90 text-white shadow-rose-500/40', badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30' },
  5: { label: 'Sangat Tidak Sehat', bg: 'bg-purple-600/90 text-white shadow-purple-600/40', badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30' },
};

const getAQICategory = (aqi) => {
  if (aqi === null || aqi === undefined) return { label: 'N/A', bg: 'bg-gray-500/80', badge: 'bg-gray-500/20 text-gray-300 border-gray-400/30' };
  if (aqi <= 50) return AQI_LEVELS[1];
  if (aqi <= 100) return AQI_LEVELS[2];
  if (aqi <= 150) return AQI_LEVELS[3];
  if (aqi <= 200) return AQI_LEVELS[4];
  return AQI_LEVELS[5];
};

// Helper untuk Indeks UV
const UV_LEVELS = {
  low: { label: 'Rendah', bg: 'bg-emerald-500/90', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
  moderate: { label: 'Sedang', bg: 'bg-amber-500/90', badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
  high: { label: 'Tinggi', bg: 'bg-orange-500/90', badge: 'bg-orange-500/20 text-orange-300 border-orange-400/30' },
  veryHigh: { label: 'Sangat Tinggi', bg: 'bg-rose-500/90', badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30' },
  extreme: { label: 'Ekstrem', bg: 'bg-purple-600/90', badge: 'bg-purple-500/20 text-purple-300 border-purple-400/30' },
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

  // Autoplay video secara halus
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
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
    <div className={`relative p-5 sm:p-8 rounded-3xl shadow-2xl overflow-hidden text-white ${backgroundClass} border border-white/20 transition-all duration-1000`}>
      {/* 1. Video Background Landscape (Resolusi Asli, Jernih & Terang) */}
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
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none brightness-100 contrast-[1.08] transform-gpu opacity-95 transition-opacity duration-700"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* 2. Soft Ambient Lighting / Vignette (Memberikan kedalaman visual tanpa menggelapkan video) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/30 z-[1] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 z-[1] pointer-events-none" />

      {/* 3. Lapisan Animasi Cuaca Tambahan jika ada (z-[2]) */}
      <div className="absolute inset-0 w-full h-full z-[2] pointer-events-none">
        <WeatherAnimation weatherIcon={current.icon} />
      </div>

      {/* 4. Lapisan Konten Utama Berbasis Glassmorphism (z-10) */}
      <div className="relative z-10 space-y-6">
        {/* Header Bar: Lokasi, Tanggal, & Panel Matahari Terbit/Terbenam */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="glass-panel px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-white/25 shadow-lg w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-400 drop-shadow text-base sm:text-lg flex-shrink-0 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {location.name}
                {location.country && location.name.toLowerCase() !== location.country.toLowerCase() ? `, ${location.country}` : ''}
              </h2>
            </div>
            <p className="text-white/90 text-xs sm:text-sm mt-1 font-medium tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] pl-6">
              {new Date().toLocaleString('id-ID', timeFormatOptions)}
            </p>
          </div>

          {/* Sunrise / Sunset Pill Badge */}
          <div className="glass-panel px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border border-white/25 shadow-lg flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <WiSunrise size={32} className="text-amber-300 drop-shadow-[0_2px_6px_rgba(251,191,36,0.6)]" />
              <div className="text-left">
                <span className="text-[10px] sm:text-xs text-white/75 uppercase tracking-wider block font-semibold">Terbit</span>
                <span className="text-xs sm:text-sm font-bold drop-shadow tracking-wide">
                  {new Date(current.sunriseEpoch * 1000).toLocaleTimeString('id-ID', clock)}
                </span>
              </div>
            </div>
            <div className="w-[1px] h-7 bg-white/20" />
            <div className="flex items-center gap-2">
              <WiSunset size={32} className="text-orange-400 drop-shadow-[0_2px_6px_rgba(251,146,60,0.6)]" />
              <div className="text-left">
                <span className="text-[10px] sm:text-xs text-white/75 uppercase tracking-wider block font-semibold">Terbenam</span>
                <span className="text-xs sm:text-sm font-bold drop-shadow tracking-wide">
                  {new Date(current.sunsetEpoch * 1000).toLocaleTimeString('id-ID', clock)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Suhu & Status Cuaca */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 sm:gap-7 w-full sm:w-auto">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 shadow-inner flex-shrink-0 text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {getWeatherIcon(current.icon)}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-7xl font-black tracking-tighter drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
                  {formatTemp(current.temp)}
                </span>
              </div>
              <p className="text-sm sm:text-base text-white/90 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                Terasa seperti <span className="font-bold text-white">{formatTemp(current.feelslike)}</span>
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-white/15">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold capitalize bg-white/20 border border-white/30 backdrop-blur-md shadow-md text-white drop-shadow">
              {translateWeatherCondition(current.conditions)}
            </span>
          </div>
        </div>

        {/* 4 Kartu Metrik Cuaca Glassmorphism Premium */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. UV Index */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
            <div className="flex items-center gap-1.5 text-white/85 text-xs sm:text-sm font-medium tracking-wide">
              <FiSun className="text-amber-300 text-sm" />
              <span>UV Index</span>
            </div>
            <div className="my-2.5">
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-md border ${uvCategory.badge}`}>
                {uvCategory.label} ({current.uvindex})
              </span>
            </div>
            <span className="text-[11px] text-white/70 font-light">Kekuatan Paparan</span>
          </div>

          {/* 2. Kelembapan */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
            <div className="flex items-center gap-1.5 text-white/85 text-xs sm:text-sm font-medium tracking-wide">
              <WiRaindrops size={22} className="text-sky-300 -my-1" />
              <span>Kelembapan</span>
            </div>
            <div className="my-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {Math.round(current.humidity)}%
              </span>
            </div>
            <span className="text-[11px] text-white/70 font-light">Kandungan Uap</span>
          </div>

          {/* 3. Kecepatan Angin */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
            <div className="flex items-center gap-1.5 text-white/85 text-xs sm:text-sm font-medium tracking-wide">
              <WiStrongWind size={20} className="text-teal-300 -my-0.5" />
              <span>Kecepatan Angin</span>
            </div>
            <div className="my-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {formatWind(current.windspeed)}
              </span>
            </div>
            <span className="text-[11px] text-white/70 font-light">Laju Udara</span>
          </div>

          {/* 4. Indeks Udara (AQI) */}
          <div className="glass-card rounded-2xl p-4 flex flex-col justify-between items-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
            <div className="flex items-center gap-1.5 text-white/85 text-xs sm:text-sm font-medium tracking-wide">
              <FiWind className="text-emerald-300 text-sm" />
              <span>Indeks Udara (AQI)</span>
            </div>
            <div className="my-2.5">
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-md border ${aqiData.badge}`}>
                {aqiData.label} ({current.aqi ?? 'N/A'})
              </span>
            </div>
            <span className="text-[11px] text-white/70 font-light">Kualitas Udara</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;