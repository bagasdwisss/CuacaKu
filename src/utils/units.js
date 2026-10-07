// src/utils/units.js
// Semua data dari API berupa metrik (°C, km/j). Konversi hanya dilakukan saat ditampilkan.

const isNum = (v) => v !== null && v !== undefined && !Number.isNaN(Number(v));

export const convertTemp = (celsius, unit = 'C') =>
    unit === 'F' ? (Number(celsius) * 9) / 5 + 32 : Number(celsius);

export const formatTemp = (celsius, unit = 'C', withUnit = true) => {
    if (!isNum(celsius)) return '–';
    const value = Math.round(convertTemp(celsius, unit));
    return withUnit ? `${value}°${unit}` : `${value}°`;
};

export const formatWind = (kmh, unit = 'kmh') => {
    if (!isNum(kmh)) return '–';
    return unit === 'ms'
        ? `${(Number(kmh) / 3.6).toFixed(1)} m/s`
        : `${Math.round(Number(kmh))} km/j`;
};