// src/components/DailySummary.jsx
import React from 'react';
import { FaRegNewspaper } from 'react-icons/fa';
import { translateWeatherCondition } from '../utils/translations';
import { useSettings } from '../context/settingsContext';

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

  return (
    <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-500 rounded-r-lg">
      <div className="text-blue-500 mt-1 flex-shrink-0">
        <FaRegNewspaper size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 dark:text-gray-200">Ringkasan Hari Ini</h4>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{summaryText}</p>
      </div>
    </div>
  );
};

export default DailySummary;