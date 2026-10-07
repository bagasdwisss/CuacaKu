// src/context/SettingsProvider.jsx
import React, { useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SettingsContext } from './settingsContext';
import { convertTemp, formatTemp, formatWind } from '../utils/units';

const THEME_MODES = ['auto', 'light', 'dark'];

const SettingsProvider = ({ children }) => {
    const [storedTemp, setTempUnit] = useLocalStorage('settings.tempUnit', 'C');
    const [storedWind, setWindUnit] = useLocalStorage('settings.windUnit', 'kmh');
    const [storedTheme, setThemeMode] = useLocalStorage('settings.themeMode', 'auto');

    // Jaga-jaga bila isi localStorage tidak valid
    const tempUnit = storedTemp === 'F' ? 'F' : 'C';
    const windUnit = storedWind === 'ms' ? 'ms' : 'kmh';
    const themeMode = THEME_MODES.includes(storedTheme) ? storedTheme : 'auto';

    const value = useMemo(
        () => ({
            tempUnit,
            windUnit,
            themeMode,
            setTempUnit,
            setWindUnit,
            setThemeMode,
            convertTemp: (celsius) => convertTemp(celsius, tempUnit),
            formatTemp: (celsius, withUnit = true) => formatTemp(celsius, tempUnit, withUnit),
            formatWind: (kmh) => formatWind(kmh, windUnit),
        }),
        [tempUnit, windUnit, themeMode, setTempUnit, setWindUnit, setThemeMode]
    );

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsProvider;