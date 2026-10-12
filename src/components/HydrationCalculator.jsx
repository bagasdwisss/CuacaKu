// src/components/HydrationCalculator.jsx
import React, { useState, useMemo } from 'react';
import { FaTint, FaWalking, FaRunning, FaCouch, FaGlassWhiskey } from 'react-icons/fa';
import { FiSun, FiActivity, FiAlertCircle } from 'react-icons/fi';
import { useSettings } from '../context/settingsContext';

const HydrationCalculator = ({ current }) => {
  const { formatTemp } = useSettings();
  const [weight, setWeight] = useState(60); // kg
  const [activityLevel, setActivityLevel] = useState('moderate'); // 'light', 'moderate', 'heavy'

  const temp = current?.temp ?? 28;
  const feelsLike = current?.feelslike ?? temp;
  const humidity = current?.humidity ?? 60;
  const uv = current?.uvindex ?? 5;

  // Analisis Heat Index (Sengatan Panas)
  const heatIndexStatus = useMemo(() => {
    if (feelsLike >= 41) {
      return {
        level: 'Sangat Berbahaya',
        color: 'text-red-500 bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-800',
        advice: 'Risiko tinggi sengatan panas (heat stroke). Hindari aktivitas outdoor berat.',
      };
    }
    if (feelsLike >= 33) {
      return {
        level: 'Waspada Tinggi',
        color: 'text-orange-500 bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800',
        advice: 'Kelelahan akibat panas sangat mungkin terjadi. Minum air secara berkala.',
      };
    }
    if (feelsLike >= 27) {
      return {
        level: 'Waspada Ringan',
        color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800',
        advice: 'Suhu cukup hangat. Pastikan sedia air minum terutama bila beraktivitas.',
      };
    }
    return {
      level: 'Nyaman & Aman',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      advice: 'Suhu relatif sejuk dan ramah untuk beraktivitas normal.',
    };
  }, [feelsLike]);

  // Perhitungan Kebutuhan Air (Liter)
  const hydrationPlan = useMemo(() => {
    // 35 ml per kg berat badan dasar
    let baseLiters = (weight * 35) / 1000;

    // Penyesuaian Suhu & Terasa Panas
    if (feelsLike >= 38) baseLiters += 1.0;
    else if (feelsLike >= 33) baseLiters += 0.6;
    else if (feelsLike >= 29) baseLiters += 0.3;

    // Penyesuaian Kelembapan Rendah (penguapan lebih cepat)
    if (humidity < 45) baseLiters += 0.2;

    // Penyesuaian Tingkat Aktivitas
    if (activityLevel === 'heavy') baseLiters += 0.8;
    else if (activityLevel === 'moderate') baseLiters += 0.4;

    const totalLiters = Math.round(baseLiters * 10) / 10;
    const glasses = Math.round(totalLiters / 0.25); // 1 gelas ~ 250ml

    return { totalLiters, glasses };
  }, [weight, feelsLike, humidity, activityLevel]);

  if (!current) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-400/20 dark:text-blue-300">
            <FaTint size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Kalkulator Hidrasi & Heat Index</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kebutuhan air minum yang dipersonalisasi sesuai cuaca saat ini
            </p>
          </div>
        </div>

        {/* Badge Status Sengatan Panas */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${heatIndexStatus.color}`}
        >
          <FiAlertCircle size={14} />
          {heatIndexStatus.level}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Kolom Kiri: Input Berat Badan & Aktivitas */}
        <div className="space-y-5 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl">
          <div>
            <div className="flex justify-between items-center mb-1 text-sm font-semibold">
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <FiActivity /> Berat Badan
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{weight} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="120"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>40 kg</span>
              <span>80 kg</span>
              <span>120 kg</span>
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Intensitas Aktivitas Hari Ini
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActivityLevel('light')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-xs font-medium border transition-all ${
                  activityLevel === 'light'
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                <FaCouch className="mb-1 text-sm" />
                Santai
              </button>

              <button
                type="button"
                onClick={() => setActivityLevel('moderate')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-xs font-medium border transition-all ${
                  activityLevel === 'moderate'
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                <FaWalking className="mb-1 text-sm" />
                Sedang
              </button>

              <button
                type="button"
                onClick={() => setActivityLevel('heavy')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg text-xs font-medium border transition-all ${
                  activityLevel === 'heavy'
                    ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                <FaRunning className="mb-1 text-sm" />
                Olahraga
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-600/60">
            Kondisi terdeteksi: Terasa {formatTemp(feelsLike)}, Kelembapan {Math.round(humidity)}%, UV {uv}.
          </div>
        </div>

        {/* Kolom Kanan: Hasil Rekomendasi Air & Tips */}
        <div className="flex flex-col justify-between h-full bg-gradient-to-br from-blue-50 to-indigo-50/70 dark:from-gray-700/60 dark:to-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/40">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">
              Target Asupan Air Harian
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400">
                {hydrationPlan.totalLiters}
              </span>
              <span className="text-xl font-bold text-gray-600 dark:text-gray-300">Liter / hari</span>
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
              <FaGlassWhiskey className="text-blue-500" />
              <span>Setara sekitar <strong className="text-blue-600 dark:text-blue-400">{hydrationPlan.glasses} gelas</strong> (250 ml)</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-xs text-gray-600 dark:text-gray-300 border border-blue-100 dark:border-gray-700">
            <span className="font-bold text-blue-600 dark:text-blue-400">💡 Tips Cuaca: </span>
            {heatIndexStatus.advice}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HydrationCalculator;
