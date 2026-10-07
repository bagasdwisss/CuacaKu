// src/components/ActivityIndex.jsx
import React from 'react';
import { FaRunning, FaBiking, FaUtensils, FaTshirt, FaStar, FaCamera } from 'react-icons/fa';
import { getLocalHour, isDaytime, formatLocalTime } from '../utils/timeUtils';
import { getMoonInfo } from '../utils/weatherHelpers';

// --- Pembuat rating ---
const rate = (color) => (label, reason) => ({ label, reason, color });
const great = rate('text-green-500');
const ok = rate('text-yellow-500');
const bad = rate('text-red-500');
const idle = rate('text-gray-500');

const maxOf = (hours, key) => hours.reduce((max, h) => Math.max(max, Number(h[key]) || 0), 0);

// --- 1. Olahraga lari ---
const rateRunning = ({ current, upcoming, isDay, localHour }) => {
  const rainSoon = maxOf(upcoming.slice(0, 3), 'precipprob');
  const feels = Number(current.feelslike ?? current.temp);

  if (current.aqi > 100) return bad('Hindari', 'Kualitas udara buruk.');
  if (rainSoon > 40) return bad('Hindari', 'Berpotensi hujan dalam 3 jam.');
  if (current.windspeed > 25) return bad('Hindari', 'Angin terlalu kencang.');
  if (feels >= 34) return bad('Hindari', 'Terasa terlalu panas.');
  if (isDay && current.uvindex >= 8) return bad('Hindari', 'Indeks UV terlalu tinggi.');

  const isGoodRunTime = (localHour >= 5 && localHour < 8) || (localHour >= 16 && localHour < 19);
  if (!isGoodRunTime) return ok('Kurang Ideal', 'Waktu terbaik: 05–08 atau 16–19.');

  const aqiPerfect = (current.aqi ?? 0) <= 50;
  const humidityOk = current.humidity <= 75;
  const windPerfect = current.windspeed <= 15;
  if (aqiPerfect && humidityOk && windPerfect && feels <= 31) return great('Sangat Baik', 'Udara bersih dan nyaman.');
  if ((current.aqi ?? 0) <= 100 && humidityOk) return ok('Cukup Baik', 'Kondisi cukup nyaman.');
  return ok('Bisa Dicoba', 'Kelembapan atau suhu agak tinggi.');
};

// --- 2. Bersepeda ---
const rateCycling = ({ current, upcoming, isDay }) => {
  const rainSoon = maxOf(upcoming.slice(0, 3), 'precipprob');
  const feels = Number(current.feelslike ?? current.temp);

  if (rainSoon > 40) return bad('Hindari', 'Berpotensi hujan dalam 3 jam.');
  if (current.aqi > 100) return bad('Hindari', 'Kualitas udara buruk.');
  if (current.windspeed > 30) return bad('Hindari', 'Angin terlalu kencang.');
  if (feels >= 35) return bad('Hindari', 'Terasa terlalu panas.');
  if (!isDay) return ok('Kurang Ideal', 'Gelap, pakai lampu & rompi reflektif.');
  if (current.uvindex >= 8) return ok('Kurang Ideal', 'Indeks UV tinggi, pakai pelindung.');
  if (feels >= 22 && feels <= 31 && current.windspeed <= 20 && (current.aqi ?? 0) <= 100) {
    return great('Sangat Baik', 'Suhu dan angin bersahabat.');
  }
  return ok('Bisa Dicoba', 'Kondisi cukup layak.');
};

// --- 3. Piknik ---
const ratePicnic = ({ current, upcoming, isDay }) => {
  const rain = maxOf(upcoming.slice(0, 6), 'precipprob');
  const feels = Number(current.feelslike ?? current.temp);

  if (!isDay) return idle('Belum Waktunya', 'Piknik paling nyaman saat siang.');
  if (rain >= 30) return bad('Hindari', 'Berpotensi hujan dalam 6 jam.');
  if (current.windspeed > 30) return bad('Hindari', 'Angin terlalu kencang.');
  if (feels >= 34) return ok('Kurang Ideal', 'Terasa terlalu panas.');
  if (feels >= 24 && feels <= 31 && rain < 15 && current.windspeed <= 20 && current.uvindex <= 7 && (current.aqi ?? 0) <= 100) {
    return great('Sangat Baik', 'Cerah dan nyaman di luar ruangan.');
  }
  return ok('Cukup Baik', 'Cari tempat teduh.');
};

// --- 4. Menjemur pakaian ---
const rateLaundry = ({ today, isDay }) => {
  if (!isDay) return idle('Sudah Malam', 'Tunggu besok pagi.');
  const isHotAndDry = today.tempmax > 29 && today.precipprob < 15;
  const isWindy = today.windspeed > 5 && today.windspeed < 30;
  if (isHotAndDry && isWindy) return great('Sangat Baik', 'Panas, kering, dan berangin.');
  if (isHotAndDry) return ok('Cukup Baik', 'Panas dan kering, angin kurang.');
  return bad('Jangan Dulu', 'Lembap atau berpotensi hujan.');
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
    { name: 'Olahraga Lari', icon: <FaRunning />, rating: rateRunning(ctx) },
    { name: 'Bersepeda', icon: <FaBiking />, rating: rateCycling(ctx) },
    { name: 'Piknik', icon: <FaUtensils />, rating: ratePicnic(ctx) },
    { name: 'Jemur Pakaian', icon: <FaTshirt />, rating: rateLaundry(ctx) },
    { name: 'Melihat Bintang', icon: <FaStar />, rating: rateStargazing(ctx) },
    { name: 'Foto Golden Hour', icon: <FaCamera />, rating: rateGoldenHour(ctx) },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Indeks Aktivitas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
        {activities.map((activity) => (
          <div key={activity.name} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl text-blue-500 dark:text-blue-400 mx-auto w-fit mb-2">{activity.icon}</div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{activity.name}</p>
            <p className={`font-bold text-lg ${activity.rating.color}`}>{activity.rating.label}</p>
            {activity.rating.reason && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{activity.rating.reason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityIndex;