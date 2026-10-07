// src/components/SettingsMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiSettings } from 'react-icons/fi';
import { useSettings } from '../context/settingsContext';

const Segmented = ({ label, options, value, onChange }) => (
    <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    aria-pressed={value === opt.value}
                    className={`flex-1 px-3 py-1.5 text-sm font-semibold transition-colors ${value === opt.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

const SettingsMenu = () => {
    const { tempUnit, setTempUnit, windUnit, setWindUnit, themeMode, setThemeMode } = useSettings();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="true"
                className="p-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
                title="Pengaturan"
                aria-label="Pengaturan"
            >
                <FiSettings size={18} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 p-4 space-y-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-30">
                    <Segmented
                        label="Suhu"
                        value={tempUnit}
                        onChange={setTempUnit}
                        options={[{ value: 'C', label: '°C' }, { value: 'F', label: '°F' }]}
                    />
                    <Segmented
                        label="Kecepatan angin"
                        value={windUnit}
                        onChange={setWindUnit}
                        options={[{ value: 'kmh', label: 'km/j' }, { value: 'ms', label: 'm/s' }]}
                    />
                    <Segmented
                        label="Tema"
                        value={themeMode}
                        onChange={setThemeMode}
                        options={[
                            { value: 'auto', label: 'Otomatis' },
                            { value: 'light', label: 'Terang' },
                            { value: 'dark', label: 'Gelap' },
                        ]}
                    />
                </div>
            )}
        </div>
    );
};

export default SettingsMenu;