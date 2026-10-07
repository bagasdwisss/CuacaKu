// src/utils/weatherHelpers.js

const DIRECTIONS = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];

// Arah angin dalam derajat = arah ASAL angin
export const getWindDirectionLabel = (deg) => {
    if (deg === null || deg === undefined || Number.isNaN(Number(deg))) return '–';
    const normalized = ((Number(deg) % 360) + 360) % 360;
    return DIRECTIONS[Math.round(normalized / 45) % 8];
};

const MOON_PHASES = [
    { label: 'Bulan Baru', icon: '🌑' },
    { label: 'Sabit Awal', icon: '🌒' },
    { label: 'Perempat Pertama', icon: '🌓' },
    { label: 'Cembung Awal', icon: '🌔' },
    { label: 'Purnama', icon: '🌕' },
    { label: 'Cembung Akhir', icon: '🌖' },
    { label: 'Perempat Akhir', icon: '🌗' },
    { label: 'Sabit Akhir', icon: '🌘' },
];

// phase: 0 = bulan baru, 0.5 = purnama (format Visual Crossing)
export const getMoonInfo = (phase) => {
    if (phase === null || phase === undefined || Number.isNaN(Number(phase))) return null;
    const p = ((Number(phase) % 1) + 1) % 1;
    const index = Math.round(p * 8) % 8;
    const illumination = Math.round(((1 - Math.cos(2 * Math.PI * p)) / 2) * 100);
    return { ...MOON_PHASES[index], illumination };
};