// src/components/WeatherAlerts.jsx
import React from 'react';
import { FiSun, FiUmbrella, FiAlertTriangle, FiWind } from 'react-icons/fi';

const WeatherAlerts = ({ alerts, current, hourly, timezone }) => {
  if (!current || !hourly || !timezone) {
    return null;
  }

  const suggestions = [];
  const now = new Date();
  const currentHour = parseInt(now.toLocaleTimeString('en-GB', { timeZone: timezone, hour: '2-digit' }), 10);

  // --- DIPERTAJAM: Logika Peringatan Hujan & Angin ---
  
  // 1. Peringatan Hujan Lebat (dalam 6 jam ke depan, karena ini penting untuk diwaspadai)
  const heavyRainHour = hourly.slice(0, 6).find(hour => hour.precipprob > 60 && hour.precip > 2);
  if (heavyRainHour) {
    suggestions.push({
      id: 'heavy-rain',
      type: 'danger',
      icon: <FiAlertTriangle className="text-red-500" />,
      message: `Hujan lebat diprediksi sekitar pukul ${heavyRainHour.datetime.slice(0, 5)}. Waspada potensi genangan.`,
    });
  }

  // 2. Peringatan Hujan Akan Segera Turun (hanya jika belum ada peringatan hujan lebat)
  // Fokus pada 2 jam ke depan untuk relevansi maksimal.
  const rainWithinTwoHours = hourly.slice(0, 2).find(hour => hour.precipprob > 50);
  if (rainWithinTwoHours && !heavyRainHour) {
    suggestions.push({
      id: 'rain-soon',
      type: 'info',
      icon: <FiUmbrella className="text-blue-500" />,
      message: `Hujan diprediksi akan turun dalam 1-2 jam ke depan. Siapkan payung.`,
    });
  }

  // 3. Peringatan Angin Kencang Segera Terjadi
  // Fokus pada 3 jam ke depan dan tingkatkan ambang batas kecepatan angin.
  const strongWindSoon = hourly.slice(0, 3).find(hour => hour.windspeed > 35);
  if (strongWindSoon) {
    suggestions.push({
      id: 'strong-wind-soon',
      type: 'warning',
      icon: <FiWind className="text-orange-500" />,
      message: `Angin kencang (~${Math.round(strongWindSoon.windspeed)} km/j) akan terjadi dalam 3 jam ke depan.`,
    });
  }
  
  // --- Peringatan dari API (Tidak berubah) ---
  const apiAlerts = (alerts || []).map(alert => ({
    id: `api-${alert.event}`,
    type: 'danger',
    icon: <FiAlertTriangle className="text-red-500" />,
    message: `${alert.event}: ${alert.headline}`,
  }));
  suggestions.push(...apiAlerts);


  // --- Logika UV Index (Sudah relevan, tidak diubah) ---
  const isRainingNow = current.icon.includes('rain') || current.icon.includes('showers') || current.icon.includes('thunder');
  const maxUvToday = hourly
    .slice(0, 24)
    .filter(hour => {
      const hourOfDay = parseInt(hour.datetime.split(':')[0], 10);
      return hourOfDay >= 9 && hourOfDay <= 17;
    })
    .reduce((max, hour) => Math.max(max, hour.uvindex), 0);

  if (currentHour < 17 && !isRainingNow && maxUvToday >= 3) {
      if (maxUvToday >= 8) {
          suggestions.push({
              id: 'uv-forecast-extreme',
              type: 'danger',
              icon: <FiSun className="text-red-500" />,
              message: `Puncak UV hari ini Sangat Ekstrem (${maxUvToday}). Wajib gunakan sunscreen SPF 50+ & hindari paparan langsung.`,
          });
      } else if (maxUvToday >= 6) {
          suggestions.push({
              id: 'uv-forecast-high',
              type: 'warning',
              icon: <FiSun className="text-orange-500" />,
              message: `Puncak Indeks UV hari ini Tinggi (${maxUvToday}). Disarankan gunakan sunscreen SPF 30-50.`,
          });
      } else {
          suggestions.push({
              id: 'uv-forecast-moderate',
              type: 'info',
              icon: <FiSun className="text-yellow-500" />,
              message: `Indeks UV hari ini Sedang (${maxUvToday}). Pertimbangkan sunscreen jika beraktivitas di luar.`,
          });
      }
  }

  // Mencegah duplikasi alert
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