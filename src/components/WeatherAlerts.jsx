// src/components/WeatherAlerts.jsx
import React from 'react';
import { FiSun, FiUmbrella, FiAlertTriangle } from 'react-icons/fi';

const WeatherAlerts = ({ alerts, current, hourly }) => {
  const suggestions = [];
  const now = new Date();
  const currentHour = now.getHours();

  // 1. Saran Sunscreen berdasarkan UV Index
  if (current.uvindex > 6 && currentHour >= 9 && currentHour <= 16) {
    suggestions.push({
      type: 'warning',
      icon: <FiSun className="text-yellow-500" />,
      message: `Indeks UV sangat tinggi (${current.uvindex}). Gunakan sunscreen jika keluar rumah.`,
    });
  }

  // 2. Saran Bawa Payung jika akan hujan dalam beberapa jam ke depan
  if (hourly && hourly.length > 0) {
    // Ambil 4 jam prakiraan ke depan dari jam saat ini
    const nextFourHours = hourly
      .filter(hour => parseInt(hour.datetime.split(':')[0], 10) >= currentHour)
      .slice(0, 4);

    // Cek jika ada kemungkinan hujan > 50% di jam-jam tersebut
    if (nextFourHours.some(hour => hour.precipprob > 50)) {
      suggestions.push({
        type: 'info',
        icon: <FiUmbrella className="text-blue-500" />,
        message: 'Ada kemungkinan hujan dalam beberapa jam ke depan. Sebaiknya siapkan payung.',
      });
    }
  }

  // 3. Peringatan Banjir (Simulasi dari curah hujan tinggi)
  if (hourly && hourly.length > 0) {
    const nextThreeHours = hourly
      .filter(hour => parseInt(hour.datetime.split(':')[0], 10) >= currentHour)
      .slice(0, 3);
    
    // Cek jika curah hujan > 5mm dalam satu jam
    if (nextThreeHours.some(hour => hour.precip > 5)) {
      suggestions.push({
        type: 'danger',
        icon: <FiAlertTriangle className="text-red-500" />,
        message: 'Hujan lebat diprediksi terjadi. Waspada potensi genangan air di daerah rawan banjir.',
      });
    }
  }

  // Gabungkan alert dari API (jika ada) dengan saran custom
  const apiAlerts = (alerts || []).map(alert => ({
    type: 'danger',
    icon: <FiAlertTriangle className="text-red-500" />,
    message: `${alert.event}: ${alert.headline}`,
  }));

  const finalAlerts = [...suggestions, ...apiAlerts];

  if (finalAlerts.length === 0) {
    return null;
  }

  const alertStyles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    danger: 'bg-red-100 border-red-500 text-red-700',
  };

  return (
    <div className="space-y-3">
      {finalAlerts.map((alert, index) => (
        <div key={index} className={`border-l-4 p-4 rounded-r-lg ${alertStyles[alert.type]}`} role="alert">
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