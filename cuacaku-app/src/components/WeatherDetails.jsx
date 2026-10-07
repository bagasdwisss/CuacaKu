// src/components/WeatherDetails.jsx
import React from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';
import { WiStrongWind, WiBarometer, WiCloud, WiThermometer, WiRaindrops } from 'react-icons/wi';
import { useSettings } from '../context/settingsContext';
import { getWindDirectionLabel, getMoonInfo } from '../utils/weatherHelpers';

const has = (v) => v !== null && v !== undefined && !Number.isNaN(Number(v));

const Tile = ({ icon, label, value, sub }) => (
    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
            {icon}
            <span>{label}</span>
        </div>
        <p className="mt-1 text-xl font-bold">{value}</p>
        {sub && <p className="text-sm text-gray-500 dark:text-gray-400">{sub}</p>}
    </div>
);

const WeatherDetails = ({ current, today }) => {
    const { formatTemp, formatWind } = useSettings();
    if (!current || !today) return null;

    const moon = getMoonInfo(current.moonphase ?? today.moonphase);
    const windDir = current.winddir;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Detail Cuaca</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Tile
                    icon={
                        has(windDir) ? (
                            <FaArrowUp size={14} style={{ transform: `rotate(${Number(windDir) + 180}deg)` }} />
                        ) : (
                            <WiStrongWind size={22} />
                        )
                    }
                    label="Arah Angin"
                    value={has(windDir) ? `Dari ${getWindDirectionLabel(windDir)}` : '–'}
                    sub={has(windDir) ? `${Math.round(windDir)}°` : null}
                />
                <Tile
                    icon={<WiStrongWind size={22} />}
                    label="Hembusan"
                    value={has(current.windgust) ? formatWind(current.windgust) : '–'}
                    sub={`Angin ${formatWind(current.windspeed)}`}
                />
                <Tile
                    icon={<WiBarometer size={22} />}
                    label="Tekanan"
                    value={has(current.pressure) ? `${Math.round(current.pressure)} hPa` : '–'}
                />
                <Tile
                    icon={<FiEye size={16} />}
                    label="Jarak Pandang"
                    value={has(current.visibility) ? `${Number(current.visibility).toFixed(1)} km` : '–'}
                />
                <Tile
                    icon={<WiCloud size={22} />}
                    label="Tutupan Awan"
                    value={has(current.cloudcover) ? `${Math.round(current.cloudcover)}%` : '–'}
                />
                <Tile
                    icon={<WiThermometer size={22} />}
                    label="Titik Embun"
                    value={has(current.dew) ? formatTemp(current.dew) : '–'}
                />
                <Tile
                    icon={<WiRaindrops size={22} />}
                    label="Curah Hujan"
                    value={`${Number(today.precip ?? 0).toFixed(1)} mm`}
                    sub={`Peluang ${Math.round(today.precipprob ?? 0)}% hari ini`}
                />
                <Tile
                    icon={<span className="text-base leading-none">{moon ? moon.icon : '🌙'}</span>}
                    label="Fase Bulan"
                    value={moon ? moon.label : '–'}
                    sub={moon ? `Penerangan ${moon.illumination}%` : null}
                />
            </div>
        </div>
    );
};

export default WeatherDetails;