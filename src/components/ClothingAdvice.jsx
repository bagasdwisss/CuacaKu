// src/components/ClothingAdvice.jsx
import React from 'react';
import { FaTshirt, FaUmbrella, FaSun, FaWind, FaTint, FaHeadSideMask, FaShoePrints } from 'react-icons/fa';
import { useSettings } from '../context/settingsContext';

const maxOf = (hours, key, fallback = 0) =>
    hours.reduce((max, h) => Math.max(max, Number(h[key]) || 0), fallback);

const buildAdvice = ({ current, upcoming, formatTemp, formatWind }) => {
    const tips = [];
    const next6 = upcoming.slice(0, 6);
    const next12 = upcoming.slice(0, 12);

    const feelsNow = Number(current.feelslike ?? current.temp);
    const feelsValues = [feelsNow, ...next12.map((h) => Number(h.feelslike ?? h.temp))].filter(Number.isFinite);
    const minFeels = Math.min(...feelsValues);
    const maxFeels = Math.max(...feelsValues);

    const rainProb = maxOf(next6, 'precipprob');
    const rainAmount = maxOf(next6, 'precip');
    const maxUv = Math.max(Number(current.uvindex) || 0, maxOf(next6, 'uvindex'));
    const maxWind = Math.max(Number(current.windspeed) || 0, maxOf(next6, 'windspeed'));

    // Dingin
    if (minFeels <= 16) {
        tips.push({ id: 'jacket', icon: <FaTshirt />, color: 'text-blue-500', title: 'Pakai jaket tebal', detail: `Terasa sedingin ${formatTemp(minFeels)} dalam 12 jam ke depan.` });
    } else if (minFeels <= 22) {
        tips.push({ id: 'jacket', icon: <FaTshirt />, color: 'text-blue-500', title: 'Bawa jaket', detail: `Terasa hingga ${formatTemp(minFeels)} dalam 12 jam ke depan.` });
    }

    // Hujan
    if (rainProb >= 60 || rainAmount >= 2) {
        tips.push({ id: 'rain', icon: <FaUmbrella />, color: 'text-blue-500', title: 'Bawa payung atau jas hujan', detail: `Peluang hujan hingga ${Math.round(rainProb)}% dalam 6 jam ke depan.` });
    } else if (rainProb >= 35) {
        tips.push({ id: 'rain', icon: <FaUmbrella />, color: 'text-blue-400', title: 'Siapkan payung lipat', detail: `Peluang hujan hingga ${Math.round(rainProb)}% dalam 6 jam ke depan.` });
    }
    if (rainAmount >= 2) {
        tips.push({ id: 'shoes', icon: <FaShoePrints />, color: 'text-slate-500', title: 'Pakai sepatu tahan air', detail: 'Hujan cukup deras, jalanan kemungkinan tergenang.' });
    }

    // Matahari
    if (maxUv >= 6) {
        tips.push({ id: 'hat', icon: <FaSun />, color: 'text-orange-500', title: 'Pakai topi, kacamata hitam & sunscreen', detail: `Indeks UV mencapai ${Math.round(maxUv)}.` });
    } else if (maxUv >= 3) {
        tips.push({ id: 'sunscreen', icon: <FaSun />, color: 'text-yellow-500', title: 'Oleskan sunscreen', detail: `Indeks UV mencapai ${Math.round(maxUv)}.` });
    }

    // Panas
    if (maxFeels >= 32) {
        tips.push({ id: 'hot', icon: <FaTint />, color: 'text-cyan-500', title: 'Pilih pakaian tipis & bawa air minum', detail: `Terasa hingga ${formatTemp(maxFeels)}, hindari dehidrasi.` });
    }

    // Angin
    if (maxWind >= 25) {
        tips.push({ id: 'wind', icon: <FaWind />, color: 'text-orange-500', title: 'Pakai jaket tahan angin', detail: `Angin hingga ${formatWind(maxWind)}.` });
    }

    // Kualitas udara
    if (current.aqi > 100) {
        tips.push({ id: 'mask', icon: <FaHeadSideMask />, color: 'text-red-500', title: 'Pakai masker', detail: `AQI ${current.aqi}, kualitas udara kurang sehat.` });
    }

    if (tips.length === 0) {
        tips.push({ id: 'ok', icon: <FaTshirt />, color: 'text-green-500', title: 'Pakaian ringan sudah cukup', detail: 'Tidak ada kondisi ekstrem dalam beberapa jam ke depan.' });
    }
    return tips;
};

const ClothingAdvice = ({ current, upcoming }) => {
    const { formatTemp, formatWind } = useSettings();
    if (!current || !upcoming) return null;

    const tips = buildAdvice({ current, upcoming, formatTemp, formatWind });

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Saran Pakaian & Perlengkapan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tips.map((tip) => (
                    <div key={tip.id} className="flex items-start gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className={`text-2xl mt-0.5 flex-shrink-0 ${tip.color}`}>{tip.icon}</div>
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{tip.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tip.detail}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClothingAdvice;