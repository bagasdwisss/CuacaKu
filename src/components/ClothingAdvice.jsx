// src/components/ClothingAdvice.jsx
import React from 'react';
import {
  FaTshirt,
  FaUmbrella,
  FaSun,
  FaWind,
  FaTint,
  FaHeadSideMask,
  FaShoePrints,
  FaLightbulb,
} from 'react-icons/fa';
import { useSettings } from '../context/settingsContext';

const maxOf = (hours, key, fallback = 0) =>
  hours.reduce((max, h) => Math.max(max, Number(h[key]) || 0), fallback);

const buildAdvice = ({ current, upcoming, formatTemp, formatWind }) => {
  const tips = [];
  const next6 = (upcoming || []).slice(0, 6);
  const next12 = (upcoming || []).slice(0, 12);

  const feelsNow = Number(current.feelslike ?? current.temp);
  const feelsValues = [feelsNow, ...next12.map((h) => Number(h.feelslike ?? h.temp))].filter(Number.isFinite);
  const minFeels = Math.min(...feelsValues);
  const maxFeels = Math.max(...feelsValues);

  const rainProb = maxOf(next6, 'precipprob');
  const rainAmount = maxOf(next6, 'precip');
  const maxUv = Math.max(Number(current.uvindex) || 0, maxOf(next6, 'uvindex'));
  const maxWind = Math.max(Number(current.windspeed) || 0, maxOf(next6, 'windspeed'));

  // 1. Suhu Dingin (Jaket / Outerwear)
  if (minFeels <= 16) {
    tips.push({
      id: 'jacket',
      icon: <FaTshirt />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: {
        label: 'Kehangatan Ekstra',
        style: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/30',
      },
      title: 'Pakai jaket tebal / sweater',
      detail: `Suhu terasa dingin hingga ${formatTemp(minFeels)} dalam rentang 12 jam ke depan.`,
    });
  } else if (minFeels <= 22) {
    tips.push({
      id: 'jacket',
      icon: <FaTshirt />,
      iconBg: 'bg-sky-50 dark:bg-sky-950/50',
      iconColor: 'text-sky-600 dark:text-sky-400',
      badge: {
        label: 'Disarankan',
        style: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-400/30',
      },
      title: 'Bawa jaket ringan / cardigan',
      detail: `Suhu cukup sejuk hingga ${formatTemp(minFeels)}. Nyaman jika memakai pakaian rangkap.`,
    });
  }

  // 2. Potensi Hujan & Jalanan Basah
  if (rainProb >= 60 || rainAmount >= 2) {
    tips.push({
      id: 'rain',
      icon: <FaUmbrella />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/50',
      iconColor: 'text-rose-600 dark:text-rose-400',
      badge: {
        label: 'Wajib Bawa',
        style: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/30',
      },
      title: 'Bawa payung besar / jas hujan',
      detail: `Peluang presipitasi tinggi (${Math.round(rainProb)}%) dalam 6 jam ke depan.`,
    });
  } else if (rainProb >= 35) {
    tips.push({
      id: 'rain',
      icon: <FaUmbrella />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      badge: {
        label: 'Siap Siaga',
        style: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-400/30',
      },
      title: 'Siapkan payung lipat',
      detail: `Ada peluang hujan lokal (${Math.round(rainProb)}%) dalam 6 jam ke depan.`,
    });
  }

  if (rainAmount >= 2) {
    tips.push({
      id: 'shoes',
      icon: <FaShoePrints />,
      iconBg: 'bg-slate-100 dark:bg-slate-800/60',
      iconColor: 'text-slate-600 dark:text-slate-300',
      badge: {
        label: 'Alas Kaki',
        style: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30',
      },
      title: 'Sepatu tahan air / sol anti-slip',
      detail: 'Hujan deras berpotensi membuat genangan & permukaan jalan licin.',
    });
  }

  // 3. Paparan Matahari & Radiasi UV
  if (maxUv >= 6) {
    tips.push({
      id: 'hat',
      icon: <FaSun />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: {
        label: 'Proteksi UV Tinggi',
        style: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30',
      },
      title: 'Topi, kacamata hitam & sunscreen',
      detail: `Indeks radiasi UV mencapai ${Math.round(maxUv)}. Lindungi mata & kulit dari paparan langsung.`,
    });
  } else if (maxUv >= 3) {
    tips.push({
      id: 'sunscreen',
      icon: <FaSun />,
      iconBg: 'bg-yellow-50 dark:bg-yellow-950/50',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      badge: {
        label: 'Proteksi Kulit',
        style: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-400/30',
      },
      title: 'Oleskan sunscreen (tabir surya)',
      detail: `Indeks UV moderat (${Math.round(maxUv)}). Dianjurkan bila beraktivitas lama di luar.`,
    });
  }

  // 4. Suhu Panas & Dehidrasi
  if (maxFeels >= 32) {
    tips.push({
      id: 'hot',
      icon: <FaTint />,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/50',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      badge: {
        label: 'Hidrasi & Bahan Sejuk',
        style: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-400/30',
      },
      title: 'Baju katun tipis & botol air',
      detail: `Terasa gerah hingga ${formatTemp(maxFeels)}. Gunakan bahan menyerap keringat.`,
    });
  }

  // 5. Angin Kencang
  if (maxWind >= 25) {
    tips.push({
      id: 'wind',
      icon: <FaWind />,
      iconBg: 'bg-orange-50 dark:bg-orange-950/50',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badge: {
        label: 'Penahan Angin',
        style: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-400/30',
      },
      title: 'Outerwear windbreaker',
      detail: `Kecepatan angin mencapai ${formatWind(maxWind)}. Siapkan penahan angin yang pas.`,
    });
  }

  // 6. Kualitas Udara (AQI)
  if (current.aqi > 100) {
    tips.push({
      id: 'mask',
      icon: <FaHeadSideMask />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/50',
      iconColor: 'text-rose-600 dark:text-rose-400',
      badge: {
        label: 'Kesehatan Udara',
        style: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/30',
      },
      title: 'Kenakan masker respirator / medis',
      detail: `Kualitas udara kurang sehat (AQI ${current.aqi}). Batasi paparan inhalasi partikel halus.`,
    });
  }

  if (tips.length === 0) {
    tips.push({
      id: 'ok',
      icon: <FaTshirt />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badge: {
        label: 'Nyaman & Bebas',
        style: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30',
      },
      title: 'Pakaian kasual harian',
      detail: 'Kondisi cuaca sangat bersahabat tanpa dinamika ekstrem.',
    });
  }

  // Smart summary text
  let summaryText = 'Kondisi cuaca bersahabat — pakaian kasual harian sangat nyaman digunakan.';
  if (rainProb >= 50) {
    summaryText = '🌧️ Cuaca berpotensi basah — siapkan payung atau jas hujan sebelum bepergian.';
  } else if (maxUv >= 7) {
    summaryText = '☀️ Paparan UV intensif — kenakan pelindung kepala, kacamata hitam, dan tabir surya.';
  } else if (minFeels <= 18) {
    summaryText = '🧥 Udara cukup dingin — kenakan pakaian berlapis atau bawa jaket hangat.';
  } else if (maxFeels >= 33) {
    summaryText = '💧 Suhu terasa panas terik — kenakan pakaian berbahan sejuk & cukupi konsumsi air minum.';
  } else if (current.aqi > 100) {
    summaryText = '😷 Udara tercemar polusi — sangat disarankan mengenakan masker saat berada di luar.';
  }

  return { tips, summaryText };
};

const ClothingAdvice = ({ current, upcoming }) => {
  const { formatTemp, formatWind } = useSettings();
  if (!current || !upcoming) return null;

  const { tips, summaryText } = buildAdvice({ current, upcoming, formatTemp, formatWind });

  return (
    <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-900/40 text-violet-500 dark:text-violet-400">
            <FaTshirt size={18} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Saran Pakaian & Perlengkapan
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rekomendasi busana cerdas & barang bawaan esensial
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-3 py-1 rounded-full border border-violet-500/20">
          Smart Dress Code
        </span>
      </div>

      {/* Smart Summary Banner */}
      <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-500/20 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500 text-white shadow-sm flex-shrink-0">
          <FaLightbulb size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
            {summaryText}
          </p>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600/80 hover:shadow-md transition-all duration-200 flex items-start gap-3.5 group text-left"
          >
            <div className={`p-2.5 rounded-xl ${tip.iconBg} ${tip.iconColor} transition-transform group-hover:scale-105 flex-shrink-0 text-xl`}>
              {tip.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 tracking-tight">
                  {tip.title}
                </h4>
                {tip.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border flex-shrink-0 whitespace-nowrap ${tip.badge.style}`}>
                    {tip.badge.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {tip.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClothingAdvice;