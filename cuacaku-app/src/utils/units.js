// src/utils/units.js

export const convertTemp = (celsius, unit = 'C') => {
    if (unit === 'F') {
        return (celsius * 9) / 5 + 32;
    }
    return celsius;
};

export const formatTemp = (celsius, unit = 'C', withUnit = true) => {
    const value = Math.round(convertTemp(celsius, unit));
    return withUnit ? `${value}°${unit}` : `${value}°`;
};

export const formatWind = (kmh, unit = 'kmh') => {
    if (unit === 'ms') {
        const ms = (kmh / 3.6).toFixed(1);
        return `${ms} m/s`;
    }
    return `${Math.round(kmh)} km/h`;
};