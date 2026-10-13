// src/components/DailyForecast.jsx
import React, { useMemo } from 'react';
import { getWeatherIcon } from '../utils/iconService';
import { translateWeatherCondition } from '../utils/translations';
import { useSettings } from '../context/settingsContext';
import { WiRaindrop } from 'react-icons/wi';
import { FiCalendar } from 'react-icons/fi';

const DailyForecast = ({ dailyData, timezone }) => {
  const { formatTemp } = useSettings();
  const nextDays = dailyData.slice(1);

  // Cari rentang suhu global 7-14 hari ke depan untuk skala bar horizontal
  const { globalMin, globalMax } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    nextDays.forEach((d) => {
      if (d.tempmin < min) min = d.tempmin;
      if (d.tempmax > max) max = d.tempmax;
    });
    return { globalMin: min, globalMax: max };
  }, [nextDays]);

  const totalRange = Math.max(1, globalMax - globalMin);

  return (
    <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400">
            <FiCalendar size={18} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Prakiraan Hari Berikutnya
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Prakiraan cuaca harian dan rentang temperatur
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
          {nextDays.length} Hari ke Depan
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {nextDays.map((day) => {
          // Persentase posisi rentang suhu hari ini relatif terhadap rentang minggu
          const leftPercent = Math.max(0, Math.min(100, ((day.tempmin - globalMin) / totalRange) * 100));
          const rightPercent = Math.max(0, Math.min(100, ((day.tempmax - globalMin) / totalRange) * 100));
          const barWidth = Math.max(8, rightPercent - leftPercent);
          const hasRain = (day.precipprob || 0) >= 20;

          return (
            <div
              key={day.datetimeEpoch}
              className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-gray-50/80 dark:hover:bg-gray-700/30 px-2 rounded-2xl transition-colors"
            >
              {/* Kolom 1: Hari & Tanggal */}
              <div className="w-full sm:w-1/4 flex items-center justify-between sm:justify-start">
                <span className="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100">
                  {new Date(day.datetimeEpoch * 1000).toLocaleString('id-ID', {
                    weekday: 'long',
                    timeZone: timezone,
                  })}
                </span>
                <span className="text-xs text-gray-400 font-medium sm:hidden">
                  {new Date(day.datetimeEpoch * 1000).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: timezone,
                  })}
                </span>
              </div>

              {/* Kolom 2: Ikon & Kondisi Cuaca + Probabilitas Hujan */}
              <div className="w-full sm:w-1/3 flex items-center gap-3">
                <div className="text-blue-500 dark:text-blue-400 flex-shrink-0 filter drop-shadow-xs">
                  {getWeatherIcon(day.icon)}
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize truncate">
                    {translateWeatherCondition(day.conditions)}
                  </p>
                  {hasRain && (
                    <span className="inline-flex items-center text-[11px] font-bold text-sky-500 dark:text-sky-400">
                      <WiRaindrop size={16} className="-mr-0.5" />
                      Hujan {Math.round(day.precipprob)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Kolom 3: Rentang Suhu Apple-Style Bar Visual */}
              <div className="w-full sm:w-5/12 flex items-center gap-3 justify-end">
                <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 w-10 text-right">
                  {formatTemp(day.tempmin, false)}
                </span>

                {/* Horizontal Min-Max Temperature Bar */}
                <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full relative overflow-hidden max-w-[150px] sm:max-w-[180px]">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-500 shadow-xs"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidth}%`,
                    }}
                  />
                </div>

                <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 w-10 text-left">
                  {formatTemp(day.tempmax)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;