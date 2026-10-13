import React from 'react';
import { FaRunning, FaBiking, FaUtensils, FaTshirt, FaStar, FaCamera } from 'react-icons/fa';
import { FiActivity } from 'react-icons/fi';
import { getLocalHour, isDaytime, formatLocalTime } from '../utils/timeUtils';
import { getMoonInfo } from '../utils/weatherHelpers';

// --- Pembuat rating dengan badge status modern ---
const rate = (status, badgeBg, badgeText, dotColor) => (label, reason) => ({
  label,
  reason,
  status,
  badgeBg,
  badgeText,
  dotColor,
});

const great = rate('great', 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-400/30', 'text-emerald-600 dark:text-emerald-400', 'bg-emerald-500');
const ok = rate('ok', 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30', 'text-amber-600 dark:text-amber-400', 'bg-amber-500');
const bad = rate('bad', 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/30', 'text-rose-600 dark:text-rose-400', 'bg-rose-500');
const idle = rate('idle', 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-400/30', 'text-gray-500 dark:text-gray-400', 'bg-gray-400');

const maxOf = (hours, key) => hours.reduce((max, h) => Math.max(max, Number(h[key]) || 0), 0);

// --- 1. Olahraga lari & Jogging (Smart Outdoor Sports Hour) ---
const rateRunning = ({ current, upcoming, isDay, localHour }) => {
  const rainSoon = maxOf(upcoming.slice(0, 3), 'precipprob');
  const feels = Number(current.feelslike ?? current.temp);

  // Cari jam terbaik untuk lari dalam 12 jam ke depan
  const bestRunHour = upcoming.slice(0, 12).find(h => {
    const hr = parseInt(h.datetime?.split(':')[0], 10);
    const tempOk = (h.temp || 30) <= 28;
    const rainOk = (h.precipprob || 0) <= 20;
    return (hr >= 5 && hr <= 8) || (hr >= 16 && hr <= 19) || (tempOk && rainOk);
  });
  const bestHourText = bestRunHour ? `Jam ideal: ${bestRunHour.datetime.slice(0, 5)}` : '06:00 & 17:00';

  if (current.aqi > 100) return bad('Hindari', `Polusi tinggi (${current.aqi}). ${bestHourText}`);
  if (rainSoon > 40) return bad('Hindari', `Berpotensi hujan. ${bestHourText}`);
  if (current.windspeed > 25) return bad('Hindari', `Angin kencang. ${bestHourText}`);
  if (feels >= 34) return bad('Hindari', `Terasa sangat panas. ${bestHourText}`);
  if (isDay && current.uvindex >= 8) return bad('Hindari', `UV ekstrem (${current.uvindex}). ${bestHourText}`);

  const isGoodRunTime = (localHour >= 5 && localHour < 9) || (localHour >= 16 && localHour < 19);
  if (!isGoodRunTime) return ok('Waktu Kurang Pas', `Paling sejuk pukul ${bestHourText.replace('Jam ideal: ', '')}`);

  const aqiPerfect = (current.aqi ?? 0) <= 50;
  const humidityOk = current.humidity <= 75;
  const windPerfect = current.windspeed <= 15;
  if (aqiPerfect && humidityOk && windPerfect && feels <= 31) return great('Sangat Baik', `Waktu sempurna! Udara segar (${Math.round(current.temp)}°C).`);
  if ((current.aqi ?? 0) <= 100 && humidityOk) return ok('Cukup Baik', `Kondisi layak untuk jogging.`);
  return ok('Bisa Dicoba', `Suhu hangat (${Math.round(current.temp)}°C), cukupi hidrasi.`);
};

// --- 2. Bersepeda (Cycling Window) ---
const rateCycling = ({ current, upcoming, isDay }) => {
  const rainSoon = maxOf(upcoming.slice(0, 3), 'precipprob');
  const feels = Number(current.feelslike ?? current.temp);

  const bestCycleHour = upcoming.slice(0, 12).find(h => {
    const hr = parseInt(h.datetime?.split(':')[0], 10);
    return (hr >= 6 && hr <= 9) || (hr >= 16 && hr <= 18);
  });
  const bestHourText = bestCycleHour ? `Rekomendasi: ${bestCycleHour.datetime.slice(0, 5)}` : '06:30';

  if (rainSoon > 40) return bad('Hindari', `Jalanan licin/hujan. ${bestHourText}`);
  if (current.aqi > 100) return bad('Hindari', `Kualitas udara buruk. ${bestHourText}`);
  if (current.windspeed > 30) return bad('Hindari', `Angin kencang (~${Math.round(current.windspeed)} km/j).`);
  if (feels >= 35) return bad('Hindari', `Risiko dehidrasi panas.`);
  if (!isDay) return ok('Hati-hati', 'Malam hari, wajib lampu & rompi.');
  if (current.uvindex >= 8) return ok('Kurang Nyaman', `UV terik (${current.uvindex}). Pakai kacamata & tabir surya.`);
  if (feels >= 22 && feels <= 31 && current.windspeed <= 20 && (current.aqi ?? 0) <= 100) {
    return great('Sangat Baik', `Angin sejuk & jalan kering. Gowes aman!`);
  }
  return ok('Bisa Dicoba', 'Kondisi cukup bersahabat.');
};

// --- 3. Piknik & Santai Luar Ruangan ---
const ratePicnic = ({ current, upcoming, isDay }) => {
  const rain = maxOf(upcoming.slice(0, 6), 'precipprob');
  const feels = Number(current.feelslike ?? current.temp);

  if (!isDay) return idle('Belum Waktunya', 'Lebih pas saat siang / sore.');
  if (rain >= 30) return bad('Hindari', 'Berpotensi basah dalam 6 jam.');
  if (current.windspeed > 30) return bad('Hindari', 'Angin kencang menerbangkan tikar.');
  if (feels >= 34) return ok('Kurang Nyaman', 'Cari area pepohonan rindang.');
  if (feels >= 24 && feels <= 31 && rain < 15 && current.windspeed <= 20 && current.uvindex <= 7 && (current.aqi ?? 0) <= 100) {
    return great('Sangat Baik', 'Cuaca teduh dan sangat nyaman.');
  }
  return ok('Cukup Baik', 'Siapkan payung peneduh.');
};

// --- 4. Kalkulator Jemuran Pintar (Smart Laundry Estimator) ---
const rateLaundry = ({ today, current, upcoming, isDay }) => {
  if (!isDay) return idle('Sudah Malam', 'Jemur besok pagi untuk hasil maksimal.');

  const rainSoon = maxOf(upcoming.slice(0, 6), 'precipprob');
  const humidity = current.humidity ?? today.humidity ?? 80;
  const temp = current.temp ?? today.temp ?? 28;
  const wind = current.windspeed ?? today.windspeed ?? 10;

  // Estimasi durasi kering pakaian berdasarkan fisika penguapan
  let dryHours = 3.5;
  if (temp > 32 && humidity < 60) dryHours = 2;
  else if (temp > 29 && humidity < 75) dryHours = 3;
  else if (humidity > 80 || temp < 26) dryHours = 5;
  if (wind > 15) dryHours = Math.max(1.5, dryHours - 0.5);

  if (rainSoon >= 50) return bad('Risiko Kehujanan', `Potensi hujan tinggi (${rainSoon}%). Jangan jemur di luar.`);
  if (rainSoon >= 30) return ok('Waspada Hujan', `Jemur di teras beratap. Estimasi ~${dryHours} jam.`);
  if (temp >= 30 && humidity <= 70) return great('Cepat Kering', `Sinar terik & angin cukup. Kering ~${dryHours} jam!`);
  if (temp >= 27) return ok('Kering Normal', `Estimasi kering ~${dryHours}–${dryHours + 1} jam.`);
  return ok('Agak Lambat', `Udara lembap (${Math.round(humidity)}%). Butuh >${Math.round(dryHours)} jam.`);
};

// --- 5. Melihat bintang ---
const rateStargazing = ({ today, current, isDay }) => {
  if (isDay) return idle('Belum Malam', 'Tunggu setelah matahari terbenam.');
  const cloud = Number(current.cloudcover ?? today.cloudcover ?? 100);
  const moon = getMoonInfo(current.moonphase ?? today.moonphase);
  const brightMoon = moon && moon.illumination > 60;

  if (cloud >= 20) return ok('Berawan', 'Langit tertutup awan.');
  if (brightMoon) return ok('Cukup Baik', `Bulan terang (${moon.illumination}%) mengurangi bintang.`);
  return great('Ideal', 'Langit cerah dan gelap.');
};

// --- 6. Fotografi golden hour ---
const rateGoldenHour = ({ daily, upcoming, current, timezone }) => {
  const nowSec = Date.now() / 1000;
  const [today, tomorrow] = daily;

  const windows = [
    { name: 'pagi', start: today.sunriseEpoch, end: today.sunriseEpoch + 3600 },
    { name: 'sore', start: today.sunsetEpoch - 3600, end: today.sunsetEpoch },
  ];
  if (tomorrow) windows.push({ name: 'pagi besok', start: tomorrow.sunriseEpoch, end: tomorrow.sunriseEpoch + 3600 });

  const win = windows.find((w) => nowSec < w.end);
  if (!win) return idle('Besok', 'Golden hour hari ini sudah lewat.');

  const hourAt = upcoming.find((h) => h.datetimeEpoch <= win.start && win.start < h.datetimeEpoch + 3600);
  const cloud = Number(hourAt?.cloudcover ?? current.cloudcover ?? 50);
  const rain = Number(hourAt?.precipprob ?? 0);

  const range = `${formatLocalTime(win.start, timezone)}–${formatLocalTime(win.end, timezone)}`;
  const prefix = nowSec >= win.start ? `Sedang berlangsung (${range}).` : `Golden hour ${win.name} ${range}.`;

  if (rain >= 50) return bad('Kurang Ideal', `${prefix} Berpotensi hujan.`);
  if (cloud > 85) return ok('Kurang Ideal', `${prefix} Langit tertutup awan tebal.`);
  if (cloud > 70) return ok('Cukup Baik', `${prefix} Awan agak tebal, warna mungkin redup.`);
  if (cloud >= 15) return great('Sangat Baik', `${prefix} Awan tipis memantulkan warna langit.`);
  return great('Baik', `${prefix} Langit cerah, cahaya hangat.`);
};

const ActivityIndex = ({ dailyData, currentData, upcoming, timezone }) => {
  if (!dailyData || dailyData.length === 0 || !currentData || !timezone) return null;

  const ctx = {
    today: dailyData[0],
    daily: dailyData,
    current: currentData,
    upcoming: upcoming || [],
    timezone,
    isDay: isDaytime(currentData),
    localHour: getLocalHour(timezone),
  };

  const activities = [
    {
      name: 'Olahraga Lari',
      icon: <FaRunning />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      rating: rateRunning(ctx),
    },
    {
      name: 'Bersepeda',
      icon: <FaBiking />,
      iconBg: 'bg-sky-50 dark:bg-sky-950/40',
      iconColor: 'text-sky-600 dark:text-sky-400',
      rating: rateCycling(ctx),
    },
    {
      name: 'Piknik & Santai',
      icon: <FaUtensils />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      rating: ratePicnic(ctx),
    },
    {
      name: 'Jemur Pakaian',
      icon: <FaTshirt />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      rating: rateLaundry(ctx),
    },
    {
      name: 'Melihat Bintang',
      icon: <FaStar />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      rating: rateStargazing(ctx),
    },
    {
      name: 'Foto Golden Hour',
      icon: <FaCamera />,
      iconBg: 'bg-orange-50 dark:bg-orange-950/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
      rating: rateGoldenHour(ctx),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400">
            <FiActivity size={18} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Indeks Aktivitas
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rekomendasi kenyamanan olahraga, jemuran & kegiatan luar ruangan
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/20">
          Smart Outdoor Tracker
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {activities.map((activity) => (
          <div
            key={activity.name}
            className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600/80 hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`p-2.5 rounded-xl ${activity.iconBg} ${activity.iconColor} transition-transform group-hover:scale-105`}>
                  {React.cloneElement(activity.icon, { size: 18 })}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${activity.rating.badgeBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activity.rating.dotColor} animate-pulse`} />
                  {activity.rating.label}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 tracking-tight">
                {activity.name}
              </h4>
            </div>
            {activity.rating.reason && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {activity.rating.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityIndex;