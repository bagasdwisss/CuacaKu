// src/components/CelestialTracker.jsx
import React, { useMemo } from 'react';
import { WiSunrise, WiSunset, WiMoonrise, WiMoonset } from 'react-icons/wi';
import { FiSun, FiMoon, FiInfo } from 'react-icons/fi';
import { getMoonInfo } from '../utils/weatherHelpers';

const formatEpochTime = (epoch, timezone) => {
  if (!epoch) return null;
  return new Date(epoch * 1000).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });
};

const CelestialTracker = ({ current, today, timezone }) => {
  if (!current || !today) return null;

  const sunrise = today.sunriseEpoch || current.sunriseEpoch;
  const sunset = today.sunsetEpoch || current.sunsetEpoch;
  const moonrise = today.moonriseEpoch;
  const moonset = today.moonsetEpoch;
  const moonphase = current.moonphase ?? today.moonphase;
  const moonInfo = getMoonInfo(moonphase);

  // Perhitungan posisi matahari di langit (0% - 100% busur hari)
  const currentEpoch = Math.floor(Date.now() / 1000);
  
  const sunProgress = useMemo(() => {
    if (!sunrise || !sunset) return 50;
    if (currentEpoch <= sunrise) return 0;
    if (currentEpoch >= sunset) return 100;
    return Math.min(100, Math.max(0, ((currentEpoch - sunrise) / (sunset - sunrise)) * 100));
  }, [sunrise, sunset, currentEpoch]);

  const isDay = currentEpoch >= sunrise && currentEpoch <= sunset;

  // Koordinat matahari pada busur SVG parabolik (lebar 320, tinggi 120)
  // Bentuk busur: dari (30, 110) melengkung ke atas puncak (160, 25) hingga (290, 110)
  const sunX = 30 + (sunProgress / 100) * 260;
  // Parabola normal: y = 110 - 85 * sin(progress * PI)
  const sunY = 110 - 85 * Math.sin((sunProgress / 100) * Math.PI);

  // Golden Hour (sekitar 1 jam sebelum matahari terbenam)
  const goldenHourStart = sunset ? sunset - 3600 : null;
  const isGoldenHour = currentEpoch >= goldenHourStart && currentEpoch <= sunset;

  return (
    <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400">
            <FiSun size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Jalur Matahari & Fase Bulan</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pelacak astronomi & dinamika langit hari ini</p>
          </div>
        </div>

        {isGoldenHour && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm animate-pulse">
            ✨ Golden Hour
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Busur Matahari (Arc) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-sky-50 to-amber-50/30 dark:from-gray-900/70 dark:to-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1 px-2 font-medium">
            <span>Status: {isDay ? 'Matahari di Atas Horison' : 'Malam Hari (Matahari Terbenam)'}</span>
            <span>{Math.round(sunProgress)}% Siang Terlewati</span>
          </div>

          <div className="relative w-full h-[130px] flex items-center justify-center">
            <svg viewBox="0 0 320 125" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0.4" />
                </linearGradient>
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </radialGradient>
              </defs>

              {/* Garis Horison */}
              <line x1="20" y1="110" x2="300" y2="110" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.6" />

              {/* Lintasan Busur Matahari */}
              <path
                d="M 30 110 Q 160 20 290 110"
                fill="none"
                stroke="url(#arcGlow)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Titik Matahari Terbit & Terbenam di Ujung Busur */}
              <circle cx="30" cy="110" r="4.5" fill="#f59e0b" />
              <circle cx="290" cy="110" r="4.5" fill="#ea580c" />

              {/* Titik Matahari Bergerak */}
              {isDay && (
                <g transform={`translate(${sunX}, ${sunY})`}>
                  {/* Efek Denyut Pendaran */}
                  <circle cx="0" cy="0" r="14" fill="#fbbf24" opacity="0.25" className="animate-ping" />
                  <circle cx="0" cy="0" r="9" fill="url(#sunGlow)" className="drop-shadow-md" />
                  <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.9" />
                </g>
              )}
            </svg>
          </div>

          {/* Label Waktu Terbit & Terbenam */}
          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300 px-2 mt-1">
            <div className="flex items-center gap-1.5">
              <WiSunrise size={22} className="text-amber-500" />
              <span>{formatEpochTime(sunrise, timezone) || '–'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <WiSunset size={22} className="text-orange-500" />
              <span>{formatEpochTime(sunset, timezone) || '–'}</span>
            </div>
          </div>
        </div>

        {/* Panel Fase Bulan & Detail Astronomi */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-3">
          {/* Kartu Bulan */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 block mb-1">
                Fase Bulan Malam Ini
              </span>
              <h4 className="text-lg font-bold text-white tracking-wide">
                {moonInfo?.label || 'Bulan'}
              </h4>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Penyinaran: <span className="font-semibold text-amber-300">{moonInfo?.illumination ?? 0}%</span>
              </p>
            </div>
            <div className="text-4xl drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]">
              {moonInfo?.icon || '🌑'}
            </div>
          </div>

          {/* Grid Mini Info Terbit/Terbenam Bulan & Siang Hari */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <WiMoonrise size={16} className="text-indigo-400" />
                <span>Terbit Bulan</span>
              </div>
              <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {formatEpochTime(moonrise, timezone) || 'Siang Hari'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <WiMoonset size={16} className="text-indigo-400" />
                <span>Terbenam Bulan</span>
              </div>
              <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {formatEpochTime(moonset, timezone) || 'Pagi Hari'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelestialTracker;
