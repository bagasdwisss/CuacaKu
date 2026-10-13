// src/components/WeatherAlerts.jsx
import React, { useState } from 'react';
import { FiSun, FiUmbrella, FiAlertTriangle, FiWind, FiChevronDown, FiChevronUp, FiShield } from 'react-icons/fi';
import { WiThunderstorm } from 'react-icons/wi';
import { useSettings } from '../context/settingsContext';
import { getLocalHour } from '../utils/timeUtils';

const WeatherAlerts = ({ alerts, current, upcoming, hoursToday, timezone }) => {
  const { formatWind } = useSettings();
  const [expandedAlerts, setExpandedAlerts] = useState({});

  if (!current || !upcoming || !hoursToday || !timezone) {
    return null;
  }

  const toggleExpand = (id) => {
    setExpandedAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const suggestions = [];
  const currentHour = getLocalHour(timezone);
  const isRainingNow = current.icon.includes('rain') || current.icon.includes('showers') || current.icon.includes('thunder');

  // --- 1. Peringatan Resmi Global / Nasional (BMKG, NOAA, NWS, WMO via Visual Crossing Alerts) ---
  if (Array.isArray(alerts) && alerts.length > 0) {
    alerts.forEach((alert, index) => {
      const eventName = alert.event || 'Peringatan Cuaca Ekstrem';
      const headline = alert.headline || alert.description || '';
      const isSevere = /badai|storm|tornado|cyclone|typhoon|tsunami|ekstrem|extreme|peringatan dini|warning/i.test(eventName + headline);

      suggestions.push({
        id: `official-alert-${index}`,
        type: isSevere ? 'danger' : 'warning',
        isOfficial: true,
        source: 'Peringatan Resmi (BMKG / Layanan Meteorologi Nasional)',
        icon: <FiAlertTriangle className={isSevere ? "text-red-500 animate-bounce" : "text-amber-500"} size={22} />,
        title: eventName,
        message: headline || 'Terdeteksi potensi cuaca signifikan di wilayah ini.',
        detail: alert.description || null,
        instruction: alert.instruction || 'Tetap waspada, pantau pembaruan cuaca berkala, dan patuhi arahan otoritas setempat.',
      });
    });
  }

  // --- 2. Deteksi Badai Petir Ekstrem (Worldwide Real-time Detection) ---
  const stormHour = upcoming.slice(0, 6).find(hour => hour.icon?.includes('thunder') || hour.conditions?.toLowerCase().includes('thunder'));
  if (stormHour) {
    suggestions.push({
      id: 'severe-thunderstorm',
      type: 'danger',
      icon: <WiThunderstorm className="text-purple-600 dark:text-purple-400" size={28} />,
      title: 'Potensi Badai Petir Aktif',
      message: `Badai petir diprediksi aktif sekitar pukul ${stormHour.datetime.slice(0, 5)}. Waspadai sambaran kilat dan hembusan angin kencang mendadak.`,
      instruction: 'Hindari berteduh di bawah pohon rindang atau tiang listrik. Segera cari bangunan tertutup yang aman.',
    });
  }

  // --- 3. Hujan lebat dalam 6 jam ke depan ---
  const heavyRainHour = upcoming.slice(0, 6).find(hour => hour.precipprob > 60 && hour.precip > 2);
  if (heavyRainHour && !stormHour) {
    suggestions.push({
      id: 'heavy-rain',
      type: 'danger',
      icon: <FiAlertTriangle className="text-red-500" size={20} />,
      title: 'Peringatan Hujan Lebat',
      message: `Hujan lebat diprediksi sekitar pukul ${heavyRainHour.datetime.slice(0, 5)}. Waspada potensi genangan dan penurunan jarak pandang berkendara.`,
      instruction: 'Kurangi kecepatan kendaraan dan siapkan payung atau jas hujan.',
    });
  }

  // --- 4. Hujan akan segera turun (1-2 jam ke depan) ---
  const rainWithinTwoHours = upcoming.slice(0, 2).find(hour => hour.precipprob > 50);
  if (rainWithinTwoHours && !heavyRainHour && !isRainingNow && !stormHour) {
    const estimatedHour = rainWithinTwoHours.datetime.slice(0, 5);
    suggestions.push({
      id: 'rain-soon',
      type: 'info',
      icon: <FiUmbrella className="text-blue-500" size={20} />,
      title: 'Prakiraan Hujan Singkat',
      message: `Hujan diprediksi akan turun dalam 1-2 jam ke depan (sekitar pukul ${estimatedHour}). Siapkan payung sebelum bepergian.`,
    });
  }

  // --- 5. Angin Kencang (Gale Warning) ---
  const strongWindSoon = upcoming.slice(0, 4).find(hour => hour.windspeed > 35 || (hour.windgust && hour.windgust > 45));
  if (strongWindSoon) {
    suggestions.push({
      id: 'strong-wind-soon',
      type: 'warning',
      icon: <FiWind className="text-amber-500" size={20} />,
      title: 'Peringatan Angin Kencang',
      message: `Hembusan angin kuat (~${formatWind(strongWindSoon.windgust || strongWindSoon.windspeed)}) diperkirakan terjadi dalam beberapa jam ke depan.`,
      instruction: 'Waspadai baliho atau dahan rapuh yang berisiko tumbang.',
    });
  }

  // --- 6. Indeks UV Ekstrem / Tinggi ---
  const maxUvToday = hoursToday
    .filter(hour => {
      const hourOfDay = parseInt(hour.datetime.split(':')[0], 10);
      return hourOfDay >= 9 && hourOfDay <= 17;
    })
    .reduce((max, hour) => Math.max(max, hour.uvindex), 0);

  if (currentHour < 17 && !isRainingNow && maxUvToday >= 6) {
    const isExtreme = maxUvToday >= 8;
    suggestions.push({
      id: isExtreme ? 'uv-extreme' : 'uv-high',
      type: isExtreme ? 'danger' : 'warning',
      icon: <FiSun className={isExtreme ? "text-rose-500" : "text-amber-500"} size={20} />,
      title: isExtreme ? 'Bahaya Radiasi UV Sangat Ekstrem' : 'Indeks Radiasi UV Tinggi',
      message: `Puncak radiasi UV hari ini mencapai level ${maxUvToday}. Paparan sinar matahari berisiko membakar kulit tanpa perlindungan.`,
      instruction: isExtreme ? 'Gunakan sunscreen SPF 50+, kenakan kacamata hitam, dan batasi waktu di bawah terik langsung.' : 'Gunakan sunscreen SPF 30-50 dan pelindung kepala saat di luar ruangan.',
    });
  }

  // Mencegah duplikasi alert
  const uniqueAlerts = Array.from(new Set(suggestions.map(a => a.id)))
    .map(id => suggestions.find(a => a.id === id));

  if (uniqueAlerts.length === 0) {
    return null;
  }

  const alertCardStyles = {
    danger: 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700/60 text-rose-900 dark:text-rose-200',
    warning: 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700/60 text-amber-900 dark:text-amber-200',
    info: 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700/60 text-blue-900 dark:text-blue-200',
  };

  const badgeStyles = {
    danger: 'bg-rose-500 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1 px-1">
        <FiShield className="text-rose-500" size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Radar Peringatan & Cuaca Ekstrem (Nasional & Global)
        </h3>
      </div>

      {uniqueAlerts.map((alert) => {
        const isExpanded = !!expandedAlerts[alert.id];
        const hasDetails = alert.detail || alert.instruction;

        return (
          <div
            key={alert.id}
            className={`border rounded-2xl p-4 shadow-sm transition-all duration-300 ${alertCardStyles[alert.type]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-grow">
                <div className="mt-0.5 flex-shrink-0">{alert.icon}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-sm sm:text-base tracking-tight">{alert.title}</span>
                    {alert.isOfficial && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider shadow-xs">
                        Resmi
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium opacity-90 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              {hasDetails && (
                <button
                  type="button"
                  onClick={() => toggleExpand(alert.id)}
                  className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0 text-current"
                  aria-label={isExpanded ? 'Tutup rincian' : 'Buka rincian'}
                >
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
              )}
            </div>

            {/* Panel Rincian Tambahan & Tips Keselamatan */}
            {isExpanded && hasDetails && (
              <div className="mt-3 pt-3 border-t border-current/15 text-xs space-y-2 animate-fadeIn">
                {alert.source && (
                  <p className="text-[11px] opacity-75 font-semibold">Sumber: {alert.source}</p>
                )}
                {alert.detail && (
                  <p className="opacity-85 whitespace-pre-line leading-relaxed">{alert.detail}</p>
                )}
                {alert.instruction && (
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-current/10 flex items-start gap-2">
                    <span className="font-bold uppercase tracking-wide text-[10px]">Tindakan:</span>
                    <span className="opacity-95 leading-relaxed">{alert.instruction}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeatherAlerts;