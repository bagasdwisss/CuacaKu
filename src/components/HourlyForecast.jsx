// src/components/HourlyForecast.jsx
import React, { useRef, useEffect } from 'react';
import { getWeatherIcon } from '../utils/iconService';
import { useSettings } from '../context/settingsContext';
import { WiRaindrop } from 'react-icons/wi';
import { FiClock, FiWind } from 'react-icons/fi';
import HourlyChart from './HourlyChart';

// hours: 24 jam ke depan mulai dari jam sekarang, resetKey: berubah saat lokasi berganti
const HourlyForecast = ({ hours, daily, resetKey }) => {
  const scrollContainerRef = useRef(null);
  const { formatTemp, formatWind } = useSettings();

  // Kembalikan scroll ke awal saat lokasi berganti
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [resetKey]);

  if (!hours || hours.length === 0 || !daily) {
    return null;
  }

  return (
    <>
      {/* 1. Grafik Tren 24 Jam ke Depan */}
      <HourlyChart hours={hours} daily={daily} />

      {/* 2. Kartu Prakiraan Per Jam Mendatar (Apple Carousel Style) */}
      <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400">
              <FiClock size={18} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Prakiraan Per Jam
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Geser ke kanan untuk melihat rincian jam berikutnya
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
            24 Jam Aktif
          </span>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 pb-3 pt-1 scrollbar-thin scrollbar-thumb-blue-400/40 scrollbar-track-transparent snap-x snap-mandatory"
        >
          {hours.map((hour, index) => {
            const isNow = index === 0;
            const hasRain = (hour.precipprob || 0) >= 20;

            return (
              <div
                key={hour.datetimeEpoch}
                className={`flex flex-col items-center flex-shrink-0 p-3.5 rounded-2xl w-24 sm:w-28 border transition-all duration-300 snap-start ${
                  isNow
                    ? 'bg-gradient-to-b from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border-blue-300 dark:border-blue-700/80 shadow-md scale-[1.02]'
                    : 'bg-gray-50/90 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {/* Waktu */}
                <span
                  className={`text-xs font-bold tracking-tight ${
                    isNow ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {isNow ? 'Sekarang' : hour.datetime.slice(0, 5)}
                </span>

                {/* Ikon Cuaca */}
                <div className="my-2.5 text-blue-500 dark:text-blue-300 filter drop-shadow-sm flex items-center justify-center h-10">
                  {getWeatherIcon(hour.icon)}
                </div>

                {/* Derajat Suhu */}
                <span className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-gray-100 tracking-tight">
                  {formatTemp(hour.temp)}
                </span>

                {/* Peluang Hujan */}
                <div className="mt-1 flex items-center justify-center h-5">
                  {hasRain ? (
                    <span className="flex items-center text-[11px] font-bold text-sky-500 dark:text-sky-400">
                      <WiRaindrop size={16} className="-mr-0.5" />
                      {Math.round(hour.precipprob)}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-medium">Kering</span>
                  )}
                </div>

                {/* Info Angin Mini */}
                <span className="text-[10px] text-gray-400 dark:text-gray-400 mt-0.5 flex items-center gap-0.5">
                  <FiWind size={10} />
                  {formatWind(hour.windspeed)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default HourlyForecast;