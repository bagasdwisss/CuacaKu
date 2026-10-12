// src/components/WeekendPlanner.jsx
import React, { useMemo } from 'react';
import { FaCalendarAlt, FaStar, FaUmbrella, FaSun, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { getWeatherIcon } from '../utils/iconService';
import { translateWeatherCondition } from '../utils/translations';
import { useSettings } from '../context/settingsContext';

const WeekendPlanner = ({ dailyData = [] }) => {
  const { formatTemp } = useSettings();

  // Cari hari Sabtu dan Minggu terdekat dari prakiraan harian
  const weekendDays = useMemo(() => {
    if (!dailyData || !dailyData.length) return [];

    const found = [];
    for (const day of dailyData) {
      const date = new Date(`${day.datetime}T00:00:00`);
      const dayIndex = date.getDay(); // 0 = Minggu, 6 = Sabtu

      if (dayIndex === 6 || dayIndex === 0) {
        found.push({
          ...day,
          dayName: dayIndex === 6 ? 'Sabtu' : 'Minggu',
          formattedDate: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        });
      }
      if (found.length >= 2) break;
    }

    return found;
  }, [dailyData]);

  // Evaluasi skor kelayakan akhir pekan (0 - 100)
  const weekendEvaluation = useMemo(() => {
    if (weekendDays.length === 0) return null;

    let totalScore = 0;
    const recommendations = [];

    weekendDays.forEach((day) => {
      const precip = Number(day.precipprob) || 0;
      const tempMax = Number(day.tempmax) || 30;

      // Skor cuaca
      let score = 100 - precip * 0.7; // Hujan mengurangi skor
      if (tempMax > 34 || tempMax < 20) score -= 10; // Suhu terlalu ekstrem mengurangi kenyamanan

      score = Math.max(20, Math.min(100, Math.round(score)));
      totalScore += score;

      // Saran spesifik
      if (precip >= 65) {
        recommendations.push({
          day: day.dayName,
          status: 'Kurang Mendukung Outdoor',
          type: 'indoor',
          advice: `Peluang hujan ${precip}%. Rencanakan aktivitas indoor (kulineran di mall, bioskop, atau kumpul keluarga di rumah).`,
          activities: ['🎬 Nonton Bioskop', '☕ Wisata Kafe', '📚 Baca / Santai di Rumah'],
        });
      } else if (precip >= 35) {
        recommendations.push({
          day: day.dayName,
          status: 'Cukup Bersahabat',
          type: 'mixed',
          advice: `Peluang hujan ${precip}%. Bagus untuk agenda luar ruangan pagi hingga siang hari, waspada hujan menjelang petang.`,
          activities: ['🏃 Jogging Pagi', '🚗 Road Trip Singkat', '🛍️ Belanja Santai'],
        });
      } else {
        recommendations.push({
          day: day.dayName,
          status: 'Sangat Sempurna!',
          type: 'outdoor',
          advice: `Cuaca sangat mendukung dengan potensi hujan hanya ${precip}%. Sangat pas untuk bepergian atau berolahraga.`,
          activities: ['🚴 Gowes / Bersepeda', '🏖️ Piknik Outdoor', '🏕️ Rekreasi Taman'],
        });
      }
    });

    const averageScore = Math.round(totalScore / weekendDays.length);

    return {
      averageScore,
      recommendations,
    };
  }, [weekendDays]);

  if (!weekendDays.length || !weekendEvaluation) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/20 dark:text-indigo-300">
            <FaCalendarAlt size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Perencana Akhir Pekan (Weekend Planner)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Analisis cerdas untuk agenda libur Sabtu & Minggu Anda
            </p>
          </div>
        </div>

        {/* Skor Akhir Pekan */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          <FaStar className="text-amber-400" />
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            Skor Liburan: {weekendEvaluation.averageScore}/100
          </span>
        </div>
      </div>

      {/* Kartu Sabtu & Minggu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weekendDays.map((day, idx) => {
          const rec = weekendEvaluation.recommendations[idx];
          const precip = Number(day.precipprob) || 0;

          return (
            <div
              key={day.datetime}
              className="flex flex-col justify-between p-5 rounded-xl border border-gray-200/80 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {day.dayName}, {day.formattedDate}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {translateWeatherCondition(day.conditions)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatTemp(day.tempmax)}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      Min {formatTemp(day.tempmin)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 my-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="text-blue-500 dark:text-blue-400">
                    {getWeatherIcon(day.icon)}
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <FaUmbrella className={precip > 50 ? 'text-blue-500' : 'text-gray-400'} />
                      <span>Peluang Hujan: <strong>{precip}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <FaSun className="text-amber-500" />
                      <span>UV Index: <strong>{day.uvindex ?? '–'}</strong></span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                  {rec.advice}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Ide Aktivitas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rec.activities.map((act) => (
                    <span
                      key={act}
                      className="px-2.5 py-1 text-xs rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekendPlanner;
