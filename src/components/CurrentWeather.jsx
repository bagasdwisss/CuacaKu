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
    <div className={`relative p-6 rounded-2xl shadow-xl overflow-hidden transition-all duration-1000 text-white ${backgroundClass}`}>
      {/* Video Background (Responsif, Object-Cover, Muted, Infinite Loop, Ringan) */}
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
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none brightness-90 transform-gpu"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Lapisan Gradient Overlay untuk Kontras & Keterbacaan Teks pada Tampilan Mobile & Desktop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/30 z-[1] pointer-events-none backdrop-blur-[0.5px]" />

      {/* Lapisan Animasi Partikel Tambahan jika ada (z-[2]) */}
      <div className="absolute inset-0 w-full h-full z-[2] pointer-events-none">
        <WeatherAnimation weatherIcon={current.icon} />
      </div>

      {/* Lapisan Konten Utama (z-10) */}
      <div className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
              {location.name}
              {location.country && location.name.toLowerCase() !== location.country.toLowerCase() ? `, ${location.country}` : ''}
            </h2>
            <p className="text-white/85 text-sm sm:text-base mt-0.5">{new Date().toLocaleString('id-ID', timeFormatOptions)}</p>
            <div className="flex items-center mt-4">
              <div className="filter drop-shadow-md">{getWeatherIcon(current.icon)}</div>
              <div className="ml-4">
                <p className="text-5xl sm:text-6xl font-bold tracking-tight">{formatTemp(current.temp)}</p>
                <p className="text-sm text-white/85 -mt-1 font-medium">Terasa seperti {formatTemp(current.feelslike)}</p>
                <p className="text-lg font-semibold capitalize mt-2 text-white/95">{translateWeatherCondition(current.conditions)}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-0 text-left sm:text-right bg-black/25 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none backdrop-blur-sm sm:backdrop-blur-none border border-white/10 sm:border-none w-full sm:w-auto">
            <div className="flex items-center justify-start sm:justify-end space-x-3 mb-2">
              <WiSunrise size={38} className="text-amber-300 drop-shadow" />
              <span className="text-sm sm:text-base font-medium">{new Date(current.sunriseEpoch * 1000).toLocaleTimeString('id-ID', clock)}</span>
            </div>
            <div className="flex items-center justify-start sm:justify-end space-x-3">
              <WiSunset size={38} className="text-orange-400 drop-shadow" />
              <span className="text-sm sm:text-base font-medium">{new Date(current.sunsetEpoch * 1000).toLocaleTimeString('id-ID', clock)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/25 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="bg-black/30 sm:bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-xs sm:text-sm text-white/80 font-medium">UV Index</p>
            <p className={`font-bold text-sm sm:text-base mt-1 px-2.5 py-0.5 rounded-full text-white inline-block shadow-sm ${uvCategory.color}`}>
              {uvCategory.label} ({current.uvindex})
            </p>
          </div>
          <div className="bg-black/30 sm:bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-xs sm:text-sm text-white/80 font-medium">Kelembapan</p>
            <p className="font-bold text-lg sm:text-xl mt-0.5">{Math.round(current.humidity)}%</p>
          </div>
          <div className="bg-black/30 sm:bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-xs sm:text-sm text-white/80 font-medium">Kecepatan Angin</p>
            <p className="font-bold text-lg sm:text-xl mt-0.5">{formatWind(current.windspeed)}</p>
          </div>
          <div className="bg-black/30 sm:bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <p className="text-xs sm:text-sm text-white/80 font-medium">Indeks Udara (AQI)</p>
            <p className={`font-bold text-sm sm:text-base mt-1 px-2.5 py-0.5 rounded-full text-white inline-block shadow-sm ${aqiData.color}`}>
              {aqiData.label} ({current.aqi ?? 'N/A'})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;