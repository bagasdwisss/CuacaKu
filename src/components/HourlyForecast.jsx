// src/components/HourlyForecast.jsx
import React, { useRef, useEffect } from 'react'; // BARU: Impor useRef dan useEffect
import { getWeatherIcon } from '../utils/iconService';
import HourlyChart from './HourlyChart';

const HourlyForecast = ({ hourlyData, timezone }) => {
  // BARU: Buat ref untuk menampung elemen div yang di-scroll
  const scrollContainerRef = useRef(null);

  // BARU: Gunakan useEffect untuk mereset scroll setiap kali data berubah
  useEffect(() => {
    // Cek jika ref sudah terpasang ke elemen div
    if (scrollContainerRef.current) {
      // Reset posisi horizontal scroll ke paling kiri
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [hourlyData]); // Dependency array: Efek ini akan berjalan setiap kali `hourlyData` berubah

  if (!hourlyData || hourlyData.length === 0 || !timezone) {
    return null;
  }

  const now = new Date();
  const hourStringInLocation = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hour12: false,
  }).format(now);
  const currentHourInLocation = parseInt(hourStringInLocation, 10);

  const upcomingHours = hourlyData.filter(hour => {
    const hourTime = parseInt(hour.datetime.split(':')[0], 10);
    return hourTime >= currentHourInLocation;
  });

  const next24Hours = upcomingHours.slice(0, 24);

  return (
    <>
      <HourlyChart data={hourlyData} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Prakiraan Per Jam</h3>
        {/* BARU: Pasang ref ke div di sini */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700"
        >
          {next24Hours.map((hour, index) => (
            <div key={index} className="flex flex-col items-center flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-28">
              <p className="font-semibold">{hour.datetime.slice(0, 5)}</p>
              <div className="my-2 text-blue-500 dark:text-blue-300">
                  {getWeatherIcon(hour.icon)}
              </div>
              <p className="font-bold text-lg">{Math.round(hour.temp)}°C</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HourlyForecast;