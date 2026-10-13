// src/components/CurrentWeather.jsx
import React, { useRef, useEffect } from 'react';
import WeatherAnimation from './WeatherAnimation';
import { getWeatherIcon } from '../utils/iconService';
import { translateWeatherCondition } from '../utils/translations';
import { isDaytime } from '../utils/timeUtils';
import { useSettings } from '../context/settingsContext';
import { WiSunrise, WiSunset, WiStrongWind, WiHumidity } from 'react-icons/wi';
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

// Helper fungsi untuk memilih background lokal gradien fallback
const getLocalBackgroundClass = (icon, isDay) => {
  const gradients = {
    clearDay: 'from-sky-500/80 to-blue-600/80',
    clearNight: 'from-slate-900/90 to-indigo-950/90',
    cloudy: 'from-slate-600/80 to-gray-800/80',
    rain: 'from-slate-700/80 to-gray-900/80',
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
  1: { label: 'Baik', dot: 'bg-emerald-400' },
  2: { label: 'Sedang', dot: 'bg-amber-400' },
  3: { label: 'Kurang Sehat', dot: 'bg-orange-400' },
  4: { label: 'Tidak Sehat', dot: 'bg-rose-500' },
  5: { label: 'Sangat Tidak Sehat', dot: 'bg-purple-500' },
};

const getAQICategory = (aqi) => {
  if (aqi === null || aqi === undefined) return { label: 'N/A', dot: 'bg-gray-400' };
  if (aqi <= 50) return AQI_LEVELS[1];
  if (aqi <= 100) return AQI_LEVELS[2];
  if (aqi <= 150) return AQI_LEVELS[3];
  if (aqi <= 200) return AQI_LEVELS[4];
  return AQI_LEVELS[5];
};

// Helper untuk Indeks UV
const UV_LEVELS = {
  low: { label: 'Rendah', dot: 'bg-emerald-400' },
  moderate: { label: 'Sedang', dot: 'bg-amber-400' },
  high: { label: 'Tinggi', dot: 'bg-orange-400' },
  veryHigh: { label: 'Sangat Tinggi', dot: 'bg-rose-500' },
  extreme: { label: 'Ekstrem', dot: 'bg-purple-500' },
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
    <div className={`relative p-5 sm:p-7 rounded-2xl shadow-xl overflow-hidden text-white ${backgroundClass} border border-white/15 transition-all duration-700 min-h-[340px] flex flex-col justify-between`}>
      {/* 1. Video Background Landscape (Jelas, Tanpa Halangan, Sangat Terbuka) */}
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
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none brightness-100 contrast-[1.05] transform-gpu opacity-100"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* 2. Vignette Tipis Minimalis di Tepian (Hanya untuk kontras teks putih, video tetap nampak 90% jernih) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35 z-[1] pointer-events-none" />

      {/* 3. Lapisan Animasi Partikel Tambahan jika ada */}
      <div className="absolute inset-0 w-full h-full z-[2] pointer-events-none">
        <WeatherAnimation weatherIcon={current.icon} />
      </div>

      {/* 4. Konten Minimalis & Elegan Mengambang Bebas di Atas Video (z-10) */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        
        {/* Baris Atas: Lokasi & Waktu (Kiri), Info Terbit / Terbenam Tipis (Kanan) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-400 text-sm drop-shadow" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {location.name}
                {location.country && location.name.toLowerCase() !== location.country.toLowerCase() ? `, ${location.country}` : ''}
              </h2>
            </div>
            <p className="text-white/80 text-xs mt-0.5 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {new Date().toLocaleString('id-ID', timeFormatOptions)}
            </p>
          </div>

          {/* Jam Terbit & Terbenam Minimalis (Inline Pill Ringan) */}
          <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/90">
            <div className="flex items-center gap-1">
              <WiSunrise size={20} className="text-amber-300 drop-shadow" />
              <span>{new Date(current.sunriseEpoch * 1000).toLocaleTimeString('id-ID', clock)}</span>
            </div>
            <span className="text-white/30">•</span>
            <div className="flex items-center gap-1">
              <WiSunset size={20} className="text-orange-400 drop-shadow" />
              <span>{new Date(current.sunsetEpoch * 1000).toLocaleTimeString('id-ID', clock)}</span>
            </div>
          </div>
        </div>

        {/* Baris Tengah: Suhu Utama, Ikon, & Kondisi Cuaca (Bersih, Ramping, Anggun) */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-4">
            <div className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
              {getWeatherIcon(current.icon)}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-bold tracking-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)]">
                  {formatTemp(current.temp)}
                </span>
                <span className="text-xs sm:text-sm text-white/80 drop-shadow">
                  Terasa {formatTemp(current.feelslike)}
                </span>
              </div>
              <p className="text-sm sm:text-base font-semibold capitalize text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {translateWeatherCondition(current.conditions)}
              </p>
            </div>
          </div>
        </div>

        {/* Baris Bawah: 4 Metrik Ringkas dengan Efek Frosted Glass Ramping (Tidak Menghalangi Video) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* UV Index */}
          <div className="bg-black/25 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiSun className="text-amber-300 text-sm drop-shadow" />
              <div className="text-left">
                <p className="text-[10px] text-white/70 uppercase font-medium tracking-wider">UV Index</p>
                <p className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  {uvCategory.label} ({current.uvindex})
                </p>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${uvCategory.dot} shadow-sm`} />
          </div>

          {/* Kelembapan */}
          <div className="bg-black/25 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WiHumidity size={20} className="text-sky-300 -my-1 drop-shadow" />
              <div className="text-left">
                <p className="text-[10px] text-white/70 uppercase font-medium tracking-wider">Kelembapan</p>
                <p className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  {Math.round(current.humidity)}%
                </p>
              </div>
            </div>
          </div>

          {/* Kecepatan Angin */}
          <div className="bg-black/25 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WiStrongWind size={20} className="text-teal-300 -my-1 drop-shadow" />
              <div className="text-left">
                <p className="text-[10px] text-white/70 uppercase font-medium tracking-wider">Angin</p>
                <p className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  {formatWind(current.windspeed)}
                </p>
              </div>
            </div>
          </div>

          {/* Indeks Udara (AQI) */}
          <div className="bg-black/25 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiWind className="text-emerald-300 text-sm drop-shadow" />
              <div className="text-left">
                <p className="text-[10px] text-white/70 uppercase font-medium tracking-wider">AQI</p>
                <p className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  {aqiData.label} ({current.aqi ?? 'N/A'})
                </p>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${aqiData.dot} shadow-sm`} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CurrentWeather;