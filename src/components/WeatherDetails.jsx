// src/components/WeatherDetails.jsx
import React from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { FiEye, FiSliders } from 'react-icons/fi';
import { WiStrongWind, WiBarometer, WiCloud, WiThermometer, WiRaindrops } from 'react-icons/wi';
import { useSettings } from '../context/settingsContext';
import { getWindDirectionLabel, getMoonInfo } from '../utils/weatherHelpers';

const has = (v) => v !== null && v !== undefined && !Number.isNaN(Number(v));

const getPressureText = (p) => {
  if (!p) return null;
  const num = Number(p);
  if (num > 1016) return 'Tinggi (Kondisi stabil)';
  if (num < 1005) return 'Rendah (Potensi awan/hujan)';
  return 'Normal (1013 hPa standar)';
};

const getVisibilityText = (v) => {
  if (!v) return null;
  const num = Number(v);
  if (num >= 10) return 'Jarak pandang sangat jernih';
  if (num >= 6) return 'Jarak pandang baik';
  if (num >= 3) return 'Cukup (Agak berkabut/hujan)';
  return 'Terbatas (Kabut tebal/hujan)';
};

const getCloudText = (c) => {
  if (!c && c !== 0) return null;
  const num = Number(c);
  if (num < 20) return 'Langit bersih hampir tanpa awan';
  if (num < 50) return 'Cerah berawan sebagian';
  if (num < 80) return 'Didominasi tutupan awan';
  return 'Mendung tertutup tebal';
};

const getDewText = (dew) => {
  if (dew === null || dew === undefined) return null;
  const num = Number(dew);
  if (num >= 24) return 'Sangat gerah & lengket';
  if (num >= 20) return 'Udara terasa lembap';
  if (num >= 13) return 'Kelembapan nyaman';
  return 'Udara sejuk & kering';
};

const Tile = ({
  icon,
  label,
  value,
  sub,
  progress = null,
  iconBg = 'bg-blue-50 dark:bg-blue-900/30',
  iconColor = 'text-blue-500 dark:text-blue-400',
}) => (
  <div className="p-4 sm:p-4.5 rounded-2xl bg-gray-50/80 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between group text-left">
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${iconBg} ${iconColor} transition-transform group-hover:scale-105 flex-shrink-0`}>
          {icon}
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        {value}
      </p>
    </div>

    <div className="mt-3">
      {progress !== null && (
        <div className="w-full bg-gray-200 dark:bg-gray-600/60 h-1.5 rounded-full overflow-hidden mb-1.5">
          <div
            className="bg-blue-500 dark:bg-blue-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {sub && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug font-medium">
          {sub}
        </p>
      )}
    </div>
  </div>
);

const WeatherDetails = ({ current, today }) => {
  const { formatTemp, formatWind } = useSettings();
  if (!current || !today) return null;

  const moon = getMoonInfo(current.moonphase ?? today.moonphase);
  const windDir = current.winddir;

  return (
    <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400">
            <FiSliders size={18} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Detail Cuaca
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Parameter atmosferik komprehensif & metrik lingkungan
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">
          Metrik Lengkap
        </span>
      </div>

      {/* Grid Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* 1. Arah Angin */}
        <Tile
          icon={
            has(windDir) ? (
              <FaArrowUp
                size={14}
                className="transition-transform duration-500"
                style={{ transform: `rotate(${Number(windDir) + 180}deg)` }}
              />
            ) : (
              <WiStrongWind size={18} />
            )
          }
          iconBg="bg-sky-50 dark:bg-sky-900/30"
          iconColor="text-sky-500 dark:text-sky-400"
          label="Arah Angin"
          value={has(windDir) ? `Dari ${getWindDirectionLabel(windDir)}` : '–'}
          sub={has(windDir) ? `${Math.round(windDir)}° Azimuth kompas` : null}
        />

        {/* 2. Hembusan Angin */}
        <Tile
          icon={<WiStrongWind size={20} />}
          iconBg="bg-teal-50 dark:bg-teal-900/30"
          iconColor="text-teal-500 dark:text-teal-400"
          label="Hembusan Angin"
          value={
            has(current.windgust) && Number(current.windgust) > Number(current.windspeed || 0)
              ? formatWind(current.windgust)
              : 'Tenang'
          }
          sub={
            has(current.windgust) && Number(current.windgust) > Number(current.windspeed || 0)
              ? `Laju stabil ${formatWind(current.windspeed)}`
              : `Kecepatan stabil ${formatWind(current.windspeed)}`
          }
        />

        {/* 3. Tekanan Udara */}
        <Tile
          icon={<WiBarometer size={20} />}
          iconBg="bg-indigo-50 dark:bg-indigo-900/30"
          iconColor="text-indigo-500 dark:text-indigo-400"
          label="Tekanan Udara"
          value={has(current.pressure) ? `${Math.round(current.pressure)} hPa` : '–'}
          sub={getPressureText(current.pressure)}
        />

        {/* 4. Jarak Pandang */}
        <Tile
          icon={<FiEye size={16} />}
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          iconColor="text-emerald-500 dark:text-emerald-400"
          label="Jarak Pandang"
          value={has(current.visibility) ? `${Number(current.visibility).toFixed(1)} km` : '–'}
          sub={getVisibilityText(current.visibility)}
        />

        {/* 5. Tutupan Awan */}
        <Tile
          icon={<WiCloud size={20} />}
          iconBg="bg-slate-100 dark:bg-slate-800/60"
          iconColor="text-slate-600 dark:text-slate-300"
          label="Tutupan Awan"
          value={has(current.cloudcover) ? `${Math.round(current.cloudcover)}%` : '–'}
          progress={has(current.cloudcover) ? Number(current.cloudcover) : null}
          sub={getCloudText(current.cloudcover)}
        />

        {/* 6. Titik Embun */}
        <Tile
          icon={<WiThermometer size={20} />}
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          iconColor="text-amber-500 dark:text-amber-400"
          label="Titik Embun"
          value={has(current.dew) ? formatTemp(current.dew) : '–'}
          sub={getDewText(current.dew)}
        />

        {/* 7. Curah Hujan */}
        <Tile
          icon={<WiRaindrops size={22} />}
          iconBg="bg-blue-50 dark:bg-blue-900/30"
          iconColor="text-blue-500 dark:text-blue-400"
          label="Curah Hujan"
          value={`${Number(today.precip ?? 0).toFixed(1)} mm`}
          sub={`Peluang ${Math.round(today.precipprob ?? 0)}% presipitasi`}
        />

        {/* 8. Fase Bulan */}
        <Tile
          icon={<span className="text-base leading-none">{moon ? moon.icon : '🌙'}</span>}
          iconBg="bg-purple-50 dark:bg-purple-900/30"
          iconColor="text-purple-500 dark:text-purple-400"
          label="Fase Bulan"
          value={moon ? moon.label : '–'}
          sub={moon ? `Penerangan ${moon.illumination}% di langit` : null}
        />
      </div>
    </div>
  );
};

export default WeatherDetails;