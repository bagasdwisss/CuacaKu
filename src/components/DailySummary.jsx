// src/components/DailySummary.jsx
import React from 'react';
import { FaRegNewspaper } from 'react-icons/fa';
import { translateWeatherCondition } from '../utils/translations';

// --- FUNGSI LOGIKA BARU YANG LEBIH CERDAS ---
const generateSummary = (dayData, hourlyData) => {
  const maxTemp = Math.round(dayData.tempmax);
  const minTemp = Math.round(dayData.tempmin);

  // 1. Analisis segmen waktu untuk menemukan kejadian penting
  const morningHours = hourlyData.filter(h => parseInt(h.datetime.split(':')[0]) >= 6 && parseInt(h.datetime.split(':')[0]) < 12);
  const afternoonHours = hourlyData.filter(h => parseInt(h.datetime.split(':')[0]) >= 12 && parseInt(h.datetime.split(':')[0]) < 18);
  
  // Menemukan kondisi pagi hari yang paling umum
  const morningCondition = morningHours.length > 0 
    ? translateWeatherCondition(morningHours[0].conditions).toLowerCase()
    : translateWeatherCondition(dayData.conditions).toLowerCase();

  // 2. Mencari kejadian cuaca paling signifikan di siang/sore hari
  const afternoonThunder = afternoonHours.some(h => h.icon.includes('thunder'));
  const afternoonHeavyRain = afternoonHours.some(h => h.precipprob > 60 && h.precip > 2);
  const afternoonLightRain = afternoonHours.some(h => h.precipprob > 40);

  // 3. Membangun kalimat naratif
  let summary = `Hari akan dimulai dengan cuaca ${morningCondition}, `;
  summary += `dengan suhu tertinggi hari ini mencapai sekitar ${maxTemp}°C.`;

  // Menambahkan detail sore hari berdasarkan prioritas (petir > hujan lebat > hujan ringan)
  if (afternoonThunder) {
    summary += " Waspada potensi badai petir di sore hari.";
  } else if (afternoonHeavyRain) {
    summary += " Hujan dengan intensitas sedang hingga lebat diperkirakan turun sore nanti.";
  } else if (afternoonLightRain) {
    summary += " Ada kemungkinan hujan ringan di sore hari.";
  }

  // Menambahkan info suhu malam jika ada perbedaan signifikan
  if (maxTemp - minTemp > 5) {
    summary += ` Suhu akan mendingin hingga ${minTemp}°C di malam hari.`;
  }

  return summary;
};

const DailySummary = ({ dayData, hourlyData }) => {
  if (!dayData || !hourlyData) return null;

  const summaryText = generateSummary(dayData, hourlyData);

  return (
    <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-slate-800 border-l-4 border-blue-500 rounded-r-lg">
      <div className="text-blue-500 mt-1 flex-shrink-0">
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