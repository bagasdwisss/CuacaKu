// src/components/DailySummary.jsx
import React from 'react';
import { FaRegNewspaper } from 'react-icons/fa';
import { translateWeatherCondition } from '../utils/translations';

const generateSummary = (dayData, hourlyData) => {
  const maxTemp = Math.round(dayData.tempmax);
  const generalCondition = translateWeatherCondition(dayData.conditions).toLowerCase();
  
  let rainTime = '';
  const afternoonHours = hourlyData.filter(h => parseInt(h.datetime.split(':')[0]) >= 12 && parseInt(h.datetime.split(':')[0]) < 18);
  const eveningHours = hourlyData.filter(h => parseInt(h.datetime.split(':')[0]) >= 18);

  const willRainAfternoon = afternoonHours.some(h => h.precipprob > 40);
  const willRainEvening = eveningHours.some(h => h.precipprob > 40);

  if (willRainAfternoon) {
    rainTime = 'di sore hari';
  } else if (willRainEvening) {
    rainTime = 'di malam hari';
  }
  
  let summary = `Hari ini diperkirakan akan ${generalCondition} dengan suhu tertinggi mencapai ${maxTemp}°C.`;

  if (rainTime) {
    summary += ` Waspada potensi hujan ${rainTime}.`;
  } else if (dayData.precipprob > 30) {
    summary += ` Ada sedikit kemungkinan hujan sepanjang hari.`;
  }

  return summary;
};

const DailySummary = ({ dayData, hourlyData }) => {
  if (!dayData || !hourlyData) return null;

  const summaryText = generateSummary(dayData, hourlyData);

  return (
    <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-500 rounded-r-lg">
      <div className="text-blue-500 mt-1">
        <FaRegNewspaper size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-800 dark:text-gray-200">Ringkasan Hari Ini</h4>
        <p className="text-gray-600 dark:text-gray-300">{summaryText}</p>
      </div>
    </div>
  );
};

export default DailySummary;