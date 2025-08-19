// src/components/WeatherAlerts.jsx
import React from 'react';
import { FiSun, FiUmbrella, FiAlertTriangle, FiWind } from 'react-icons/fi';

const WeatherAlerts = ({ alerts, current, hourly, timezone }) => {
  // Jika data belum lengkap, jangan render apa-apa
  if (!current || !hourly || !timezone) {
    return null;
  }

  const suggestions = [];
  const now = new Date();
  
  // Menggunakan jam lokal di lokasi yang dicari, bukan jam di komputer Anda
  const currentHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  
  const upcomingHours = hourly
    .filter(hour => parseInt(hour.datetime.split(':')[0], 10) >= currentHour)
    .slice(0, 6); // Analisis untuk 6 jam ke depan

  // --- LOGIKA BARU YANG LEBIH CERDAS ---

  // 1. Peringatan Cuaca Ekstrem dari API (Prioritas Tertinggi)
  const apiAlerts = (alerts || []).map(alert => ({
    id: `api-${alert.event}`,
    type: 'danger',
    icon: <FiAlertTriangle className="text-red-500" />,
    message: `${alert.event}: ${alert.headline}`,
  }));
  suggestions.push(...apiAlerts);


  // 2. Analisis Potensi Hujan & Angin (Hanya jika tidak ada alert badai dari API)
  if (!suggestions.some(alert => alert.message.toLowerCase().includes('thunderstorm'))) {
    const heavyRainHour = upcomingHours.find(hour => hour.precipprob > 60 && hour.precip > 5);
    const lightRainHour = upcomingHours.find(hour => hour.precipprob > 50);
    const strongWindHour = upcomingHours.find(hour => hour.windspeed > 30); // Angin kencang > 30 km/j

    // Peringatan Hujan Lebat/Banjir (lebih prioritas)
    if (heavyRainHour) {
      suggestions.push({
        id: 'heavy-rain',
        type: 'danger',
        icon: <FiAlertTriangle className="text-red-500" />,
        message: `Hujan sangat lebat diprediksi terjadi sekitar pukul ${heavyRainHour.datetime.slice(0, 5)}. Waspada potensi genangan.`,
      });
    } 
    // Jika tidak ada hujan lebat, baru cek hujan ringan
    else if (lightRainHour) {
      suggestions.push({
        id: 'light-rain',
        type: 'info',
        icon: <FiUmbrella className="text-blue-500" />,
        message: `Ada kemungkinan hujan dalam beberapa jam ke depan. Sebaiknya siapkan payung.`,
      });
    }

    // Peringatan Angin Kencang (bisa muncul bersamaan dengan hujan)
    if (strongWindHour) {
      suggestions.push({
        id: 'strong-wind',
        type: 'warning',
        icon: <FiWind className="text-orange-500" />,
        message: `Angin kencang dengan kecepatan ${Math.round(strongWindHour.windspeed)} km/j diprediksi terjadi.`,
      });
    }
  }

  // 3. Saran Sunscreen (Hanya jika tidak hujan)
  if (!suggestions.some(alert => alert.id.includes('rain'))) {
    if (current.uvindex > 6 && currentHour >= 9 && currentHour <= 16) {
      suggestions.push({
        id: 'uv-index',
        type: 'warning',
        icon: <FiSun className="text-yellow-500" />,
        message: `Indeks UV sangat tinggi (${current.uvindex}). Gunakan sunscreen jika beraktivitas di luar.`,
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