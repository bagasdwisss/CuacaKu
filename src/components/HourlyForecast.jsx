// src/components/HourlyForecast.jsx
import React, { useRef, useEffect } from 'react';
import { getWeatherIcon } from '../utils/iconService';
import HourlyChart from './HourlyChart';

// Terima prop 'dayData' untuk diteruskan ke HourlyChart
const HourlyForecast = ({ hourlyData, timezone, dayData }) => {
  // Buat ref untuk menampung elemen div yang di-scroll
  const scrollContainerRef = useRef(null);

  // Gunakan useEffect untuk mereset scroll setiap kali data berubah
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [hourlyData]); // Efek ini berjalan setiap kali `hourlyData` berubah

  // Lakukan null check untuk semua data yang diperlukan
  if (!hourlyData || hourlyData.length === 0 || !timezone || !dayData) {
    return null;
  }

  // Logika untuk menyaring jam yang akan datang
  const now = new Date();
  const currentHourInLocation = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hour12: false,
  }).format(now), 10);

  const upcomingHours = hourlyData.filter(hour => {
    const hourTime = parseInt(hour.datetime.split(':')[0], 10);
    return hourTime >= currentHourInLocation;
  });

  const next24Hours = upcomingHours.slice(0, 24);

  return (
    <>
      {/* Teruskan 'hourlyData' (sebagai prop 'data') dan 'dayData' ke HourlyChart */}
      <HourlyChart data={hourlyData} dayData={dayData} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Prakiraan Per Jam</h3>
        {/* Pasang ref ke div di sini untuk kontrol scroll */}
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