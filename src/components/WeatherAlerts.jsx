// src/components/WeatherAlerts.jsx
import React from 'react';
import { FiSun, FiUmbrella, FiAlertTriangle, FiWind } from 'react-icons/fi';

const WeatherAlerts = ({ alerts, current, hourly, timezone }) => {
  if (!current || !hourly || !timezone) {
    return null;
  }

  const suggestions = [];
  const now = new Date();
  const currentHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  
  const upcomingHours = hourly
    .filter(hour => parseInt(hour.datetime.split(':')[0], 10) >= currentHour)
    .slice(0, 6);

  // --- LOGIKA BARU YANG SUDAH DIPERTAJAM ---

  // 1. Peringatan Cuaca Ekstrem dari API (Prioritas Tertinggi)
  const apiAlerts = (alerts || []).map(alert => ({
    id: `api-${alert.event}`,
    type: 'danger',
    icon: <FiAlertTriangle className="text-red-500" />,
    message: `${alert.event}: ${alert.headline}`,
  }));
  suggestions.push(...apiAlerts);

  // 2. Analisis Potensi Hujan & Angin
  const heavyRainHour = upcomingHours.find(hour => hour.precipprob > 60 && hour.precip > 5);
  const lightRainHour = upcomingHours.find(hour => hour.precipprob > 50);
  const strongWindHour = upcomingHours.find(hour => hour.windspeed > 30);

  if (heavyRainHour) {
    suggestions.push({
      id: 'heavy-rain',
      type: 'danger',
      icon: <FiAlertTriangle className="text-red-500" />,
      message: `Hujan sangat lebat diprediksi terjadi sekitar pukul ${heavyRainHour.datetime.slice(0, 5)}. Waspada potensi genangan.`,
    });
  } else if (lightRainHour) {
    suggestions.push({
      id: 'light-rain',
      type: 'info',
      icon: <FiUmbrella className="text-blue-500" />,
      message: 'Ada kemungkinan hujan dalam beberapa jam ke depan. Sebaiknya siapkan payung.',
    });
  }

  if (strongWindHour) {
    suggestions.push({
      id: 'strong-wind',
      type: 'warning',
      icon: <FiWind className="text-orange-500" />,
      message: `Angin kencang dengan kecepatan ${Math.round(strongWindHour.windspeed)} km/j diprediksi terjadi.`,
    });
  }

  // 3. LOGIKA BARU & SPESIFIK UNTUK UV INDEX
  const isSunRelevantTime = currentHour >= 9 && currentHour <= 16;
  const isRainingNow = current.icon.includes('rain') || current.icon.includes('showers') || current.icon.includes('thunder');
  const uvIndex = current.uvindex;
  
  // Saran sunscreen hanya muncul jika sedang tidak hujan dan di jam yang relevan
  if (isSunRelevantTime && !isRainingNow) {
    if (uvIndex >= 8) {
      suggestions.push({
        id: 'uv-extreme',
        type: 'danger',
        icon: <FiSun className="text-red-500" />,
        message: `UV Sangat Ekstrem (${uvIndex}). Wajib gunakan sunscreen SPF 50+ dan hindari paparan langsung.`,
      });
    } else if (uvIndex >= 6) {
      suggestions.push({
        id: 'uv-high',
        type: 'warning',
        icon: <FiSun className="text-orange-500" />,
        message: `Indeks UV Tinggi (${uvIndex}). Disarankan gunakan sunscreen minimal SPF 30-50.`,
      });
    } else if (uvIndex >= 3) {
      suggestions.push({
        id: 'uv-moderate',
        type: 'info',
        icon: <FiSun className="text-yellow-500" />,
        message: `Indeks UV Sedang (${uvIndex}). Gunakan sunscreen minimal SPF 30 jika keluar.`,
      });
    }
  }

  // Mencegah duplikasi alert dan memastikan hanya yang paling relevan yang tampil
  const uniqueAlerts = Array.from(new Set(suggestions.map(a => a.id)))
    .map(id => {
      return suggestions.find(a => a.id === id)
    });

  if (uniqueAlerts.length === 0) {
    return null;
  }

  const alertStyles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-200',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-500 dark:text-yellow-200',
    danger: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-200',
  };

  return (
    <div className="space-y-3">
      {uniqueAlerts.map((alert) => (
        <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${alertStyles[alert.type]}`} role="alert">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{alert.icon}</div>
            <p className="font-bold">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeatherAlerts;