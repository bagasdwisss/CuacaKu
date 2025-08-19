// src/components/HourlyForecast.jsx
import React from 'react';
import { getWeatherIcon } from '../utils/iconService';
import HourlyChart from './HourlyChart'; // Impor komponen grafik

// Komponen ini menerima prop bernama 'hourlyData'
const HourlyForecast = ({ hourlyData }) => {
  // Jika data belum ada, jangan render apa-apa untuk mencegah error
  if (!hourlyData || hourlyData.length === 0) {
    return null;
  }

  const now = new Date();
  const currentHour = now.getHours();

  const upcomingHours = hourlyData.filter(hour => {
    const hourTime = parseInt(hour.datetime.split(':')[0], 10);
    return hourTime >= currentHour;
  });

  return (
    <>
      {/* Memanggil komponen grafik dan mengirimkan 'hourlyData' sebagai prop 'data' */}
      <HourlyChart data={hourlyData} />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Prakiraan Per Jam Hari Ini</h3>
        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
          {upcomingHours.map((hour, index) => (
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