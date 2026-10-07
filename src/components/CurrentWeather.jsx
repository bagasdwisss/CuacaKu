// src/components/CurrentWeather.jsx
import React from 'react';
import WeatherAnimation from './WeatherAnimation';
import { getWeatherIcon } from '../utils/iconService';
import { translateWeatherCondition } from '../utils/translations';
import { WiSunrise, WiSunset } from 'react-icons/wi';

// Helper fungsi untuk memilih background lokal di dalam komponen
const getLocalBackgroundClass = (icon, isDay) => {
  const gradients = {
    clearDay: 'from-sky-400 to-blue-500',
    clearNight: 'from-slate-900 to-indigo-900',
    cloudy: 'from-slate-400 to-gray-600',
    rain: 'from-gray-600 to-slate-800',
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


// Helper untuk Kualitas Udara (AQI)
const AQI_LEVELS = {
  1: { label: 'Baik', color: 'bg-green-500' },
  2: { label: 'Sedang', color: 'bg-yellow-500' },
  3: { label: 'Kurang Sehat', color: 'bg-orange-500' },
  4: { label: 'Tidak Sehat', color: 'bg-red-500' },
  5: { label: 'Sangat Tidak Sehat', color: 'bg-purple-700' },
};

const getAQICategory = (aqi) => {
  if (!aqi) return { label: 'N/A', color: 'bg-gray-400' };
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

  const now = new Date();
  const localTimeHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const sunriseHour = parseInt(new Date(current.sunriseEpoch * 1000).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const sunsetHour = parseInt(new Date(current.sunsetEpoch * 1000).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const isDay = localTimeHour >= sunriseHour && localTimeHour < sunsetHour;

  const backgroundClass = getLocalBackgroundClass(current.icon, isDay);
  const aqiData = getAQICategory(current.aqi);
  const uvCategory = getUVCategory(current.uvindex);
  
  const timeFormatOptions = {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: timezone,
  };

  return (
    <div className={`relative p-6 rounded-lg shadow-lg overflow-hidden transition-all duration-1000 text-white ${backgroundClass}`}>
      {/* Lapisan Animasi (paling belakang, z-0) */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <WeatherAnimation weatherIcon={current.icon} />
      </div>
      
      {/* Lapisan Konten (di atas animasi, z-10) */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{location.name}{location.country && location.name.toLowerCase() !== location.country.toLowerCase() ? `, ${location.country}` : ''}</h2>
            <p className="opacity-80">{new Date().toLocaleString('id-ID', timeFormatOptions)}</p>
            <div className="flex items-center mt-4">
              <div className="">{getWeatherIcon(current.icon)}</div>
              <div className="ml-4">
                <p className="text-5xl font-semibold">{Math.round(current.temp)}°C</p>
                <p className="text-sm opacity-80 -mt-1">Terasa seperti {Math.round(current.feelslike)}°C</p>
                <p className="text-lg capitalize mt-2">{translateWeatherCondition(current.conditions)}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 text-left sm:text-right">
              <div className="flex items-center justify-start sm:justify-end space-x-4 mb-2"><WiSunrise size={40} className="text-yellow-300" /><p>{new Date(current.sunriseEpoch * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: timezone })}</p></div>
              <div className="flex items-center justify-start sm:justify-end space-x-4"><WiSunset size={40} className="text-orange-300" /><p>{new Date(current.sunsetEpoch * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: timezone })}</p></div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="opacity-80">UV Index</p>
            <p className={`font-bold text-lg px-2 py-1 rounded-full text-white ${uvCategory.color}`}>{uvCategory.label} ({current.uvindex})</p>
          </div>
          <div>
            <p className="opacity-80">Kelembapan</p>
            <p className="font-bold text-lg">{current.humidity}%</p>
          </div>
          <div>
            <p className="opacity-80">Kecepatan Angin</p>
            <p className="font-bold text-lg">{current.windspeed} km/j</p>
          </div>
          <div>
            <p className="opacity-80">Indeks Udara (AQI)</p>
            <p className={`font-bold text-lg px-2 py-1 rounded-full text-white ${aqiData.color}`}>{aqiData.label} ({current.aqi || 'N/A'})</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;