// src/components/HourlyForecast.jsx
import React, { useRef, useEffect } from 'react';
import { getWeatherIcon } from '../utils/iconService';
import { useSettings } from '../context/settingsContext';
import HourlyChart from './HourlyChart';

// hours: 24 jam ke depan mulai dari jam sekarang, resetKey: berubah saat lokasi berganti
const HourlyForecast = ({ hours, daily, resetKey }) => {
  const scrollContainerRef = useRef(null);
  const { formatTemp } = useSettings();

  // Kembalikan scroll ke awal hanya saat lokasi berganti (bukan setiap auto-refresh)
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
      <HourlyChart hours={hours} daily={daily} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Prakiraan Per Jam</h3>
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
        >
          {hours.map((hour, index) => (
            <div key={hour.datetimeEpoch} className="flex flex-col items-center flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-28">
              <p className="font-semibold">{index === 0 ? 'Sekarang' : hour.datetime.slice(0, 5)}</p>
              <div className="my-2 text-blue-500 dark:text-blue-300">
                {getWeatherIcon(hour.icon)}
              </div>
              <p className="font-bold text-lg">{formatTemp(hour.temp)}</p>
              <p className={`text-xs mt-1 ${hour.precipprob >= 30 ? 'text-blue-500 dark:text-blue-300' : 'text-transparent select-none'}`}>
                Hujan {Math.round(hour.precipprob || 0)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HourlyForecast;