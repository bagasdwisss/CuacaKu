// src/components/DailySummary.jsx
import React, { useMemo } from 'react';
import { FaRegNewspaper, FaHistory } from 'react-icons/fa';
import { translateWeatherCondition } from '../utils/translations';
import { useSettings } from '../context/settingsContext';
import { getHistoricalDisasterEvent } from '../data/weatherDisasterHistory';

// Helper function untuk menemukan kondisi cuaca yang paling sering muncul dalam satu periode
const getDominantCondition = (hours) => {
  if (!hours || hours.length === 0) return null;

  const conditionCounts = hours.reduce((acc, hour) => {
    const condition = translateWeatherCondition(hour.conditions);
    acc[condition] = (acc[condition] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(conditionCounts).reduce((a, b) =>
    conditionCounts[a] > conditionCounts[b] ? a : b
  );
};

const generateSummary = (dayData, hourlyData, formatTemp) => {
  const maxTemp = formatTemp(dayData.tempmax);
  const minTemp = formatTemp(dayData.tempmin);
  const tempRange = dayData.tempmax - dayData.tempmin; // selisih dihitung dalam °C

  // 1. Analisis segmen waktu
  const hourOf = (h) => parseInt(h.datetime.split(':')[0], 10);
  const morningHours = hourlyData.filter(h => hourOf(h) >= 6 && hourOf(h) < 12);
  const afternoonHours = hourlyData.filter(h => hourOf(h) >= 12 && hourOf(h) < 18);

  const dominantMorningCondition = getDominantCondition(morningHours) || translateWeatherCondition(dayData.conditions);

  // 2. Mencari kejadian cuaca signifikan di sore hari
  const afternoonThunder = afternoonHours.some(h => h.icon.includes('thunder'));
  const afternoonHeavyRain = afternoonHours.some(h => h.precipprob > 60 && h.precip > 2);
  const afternoonLightRain = afternoonHours.some(h => h.precipprob > 45);

  // 3. Membangun kalimat ringkasan
  const summaryParts = [];

  summaryParts.push(`Pagi hari akan didominasi oleh cuaca ${dominantMorningCondition.toLowerCase()}. Suhu maksimum hari ini diperkirakan mencapai ${maxTemp}.`);

  if (afternoonThunder) {
    summaryParts.push("Waspadai potensi badai petir pada sore hari.");
  } else if (afternoonHeavyRain) {
    summaryParts.push("Hujan dengan intensitas lebat diperkirakan akan turun pada sore hari.");
  } else if (afternoonLightRain) {
    summaryParts.push("Terdapat kemungkinan hujan ringan pada sore hari.");
  } else {
    summaryParts.push("Kondisi cuaca pada sore hari diperkirakan akan cerah.");
  }

  if (tempRange > 5) {
    summaryParts.push(`Suhu udara akan menurun hingga ${minTemp} pada malam hari.`);
  }

  return summaryParts.join(' ');
};

const DailySummary = ({ dayData, hourlyData }) => {
  const { formatTemp } = useSettings();
  if (!dayData || !hourlyData) return null;

  const summaryText = generateSummary(dayData, hourlyData, formatTemp);
  const historyEvent = useMemo(() => getHistoricalDisasterEvent(dayData.datetime), [dayData.datetime]);

  return (
    <div className="space-y-3">
      {/* Ringkasan Cuaca Utama Hari Ini */}
      <div className="flex items-start gap-4 p-4 bg-blue-50/90 dark:bg-slate-800/90 border-l-4 border-blue-500 rounded-r-2xl shadow-sm">
        <div className="text-blue-500 mt-1 flex-shrink-0">
          <FaRegNewspaper size={24} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-200">Ringkasan Hari Ini</h4>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base mt-0.5">{summaryText}</p>
        </div>
      </div>

      {/* Kilas Balik Bencana Cuaca & Geologis Bersejarah Dunia (On This Day) */}
      {historyEvent && (
        <div className="flex items-start gap-3 p-3.5 bg-gradient-to-r from-rose-50/95 via-amber-50/90 to-orange-50/80 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-orange-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-200 shadow-sm">
          <div className="p-2 rounded-xl bg-rose-500 text-white flex-shrink-0 shadow-sm mt-0.5">
            <FaHistory size={15} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-rose-700 dark:text-rose-400 text-xs sm:text-sm tracking-tight">
                Kilas Balik Hari Ini ({historyEvent.dateFormatted}):
              </span>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                {historyEvent.title} ({historyEvent.year})
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
              {historyEvent.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySummary;