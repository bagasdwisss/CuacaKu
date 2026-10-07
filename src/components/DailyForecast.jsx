// src/components/DailyForecast.jsx
import React from 'react';
import { getWeatherIcon } from '../utils/iconService';
import { translateWeatherCondition } from '../utils/translations';
import { useSettings } from '../context/settingsContext';

const DailyForecast = ({ dailyData, timezone }) => {
  const { formatTemp } = useSettings();
  const nextDays = dailyData.slice(1);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Prakiraan Hari Berikutnya</h3>
      <div className="space-y-3">
        {nextDays.map((day) => (
          <div key={day.datetimeEpoch} className="flex justify-between items-start p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            {/* timeZone lokasi dipakai agar nama hari tidak bergeser saat melihat kota di zona waktu lain */}
            <p className="font-semibold w-1/4 pt-2">
              {new Date(day.datetimeEpoch * 1000).toLocaleString('id-ID', { weekday: 'long', timeZone: timezone })}
            </p>

            <div className="flex items-center w-1/4 justify-center min-h-10">
              {getWeatherIcon(day.icon)}
              <span className="ml-2 hidden sm:inline capitalize text-center">
                {translateWeatherCondition(day.conditions)}
              </span>
            </div>

            <p className="w-1/4 text-center pt-2">{formatTemp(day.tempmin, false)} / {formatTemp(day.tempmax)}</p>
            <p className="w-1/4 text-right pt-2">Hujan: {Math.round(day.precipprob || 0)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;