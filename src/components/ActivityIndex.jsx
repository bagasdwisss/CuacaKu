// src/components/ActivityIndex.jsx
import React from 'react';
import { FaRunning, FaTshirt, FaStar } from 'react-icons/fa';

// --- FUNGSI LOGIKA BARU YANG SUDAH DIPERBAIKI TOTAL ---
const getActivityRatings = (today, current, timezone) => {
  const ratings = {};
  
  // --- 1. Logika Baru dan Mendalam untuk Olahraga Lari ---
  const getRunningRating = () => {
    const now = new Date();
    const localTimeHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));

    // Kondisi Pemblokir (Deal-breakers) -> Langsung Tidak Disarankan
    if (localTimeHour >= 10 && localTimeHour < 16) {
      return { label: 'Hindari', color: 'text-red-500', reason: 'Indeks UV terlalu tinggi.' };
    }
    if (current.aqi > 100) {
      return { label: 'Hindari', color: 'text-red-500', reason: 'Kualitas udara buruk.' };
    }
    if (current.windspeed > 25) {
      return { label: 'Hindari', color: 'text-red-500', reason: 'Angin terlalu kencang.' };
    }
    if (today.precipprob > 30) {
        return { label: 'Hindari', color: 'text-red-500', reason: 'Risiko hujan tinggi.' };
    }

    // Cek Waktu Ideal
    const isGoodRunTime = (localTimeHour >= 5 && localTimeHour < 8) || (localTimeHour >= 16 && localTimeHour < 18);
    if (!isGoodRunTime) {
      return { label: 'Kurang Ideal', color: 'text-yellow-500', reason: 'Bukan waktu terbaik untuk lari.' };
    }

    // Jika waktu ideal, cek kondisi lainnya untuk rating final
    const isAqiPerfect = current.aqi <= 50;
    const isHumidityIdeal = current.humidity >= 40 && current.humidity <= 60;
    const isWindPerfect = current.windspeed <= 15;

    // Kondisi Sempurna
    if (isAqiPerfect && isHumidityIdeal && isWindPerfect) {
      return { label: 'Sangat Baik', color: 'text-green-500' };
    }

    // Kondisi Cukup Baik (setidaknya beberapa faktor ideal)
    if (!isAqiPerfect && current.aqi <= 100 && isHumidityIdeal) {
        return { label: 'Cukup Baik', color: 'text-yellow-500' };
    }
    
    // Jika tidak sempurna tapi masih dalam waktu lari yang baik
    return { label: 'Bisa Dicoba', color: 'text-yellow-500' };
  };

  ratings.running = getRunningRating();

  // --- 2. Logika yang Dipertajam untuk Menjemur Pakaian ---
  const isHotAndDry = today.tempmax > 29 && today.precipprob < 15;
  const isWindy = today.windspeed > 5 && today.windspeed < 30;

  if (isHotAndDry && isWindy) {
    ratings.laundry = { label: 'Sangat Baik', color: 'text-green-500' };
  } else if (isHotAndDry) {
    ratings.laundry = { label: 'Cukup Baik', color: 'text-yellow-500' };
  } else {
    ratings.laundry = { label: 'Jangan Dulu', color: 'text-red-500' };
  }

  // --- 3. Logika yang Dipertajam untuk Melihat Bintang ---
  const now = new Date();
  const localTimeHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const sunsetHour = parseInt(new Date(current.sunsetEpoch * 1000).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const isNightTime = localTimeHour >= sunsetHour || localTimeHour < 5;
  const isClearSky = today.cloudcover < 20; // Langit sangat cerah

  if (isNightTime && isClearSky) {
    ratings.stargazing = { label: 'Ideal', color: 'text-green-500' };
  } else if (isNightTime) {
    ratings.stargazing = { label: 'Berawan', color: 'text-yellow-500' };
  } else {
    ratings.stargazing = { label: 'Belum Malam', color: 'text-gray-500' };
  }

  return ratings;
};

const ActivityIndex = ({ dailyData, currentData, timezone }) => {
  if (!dailyData || dailyData.length === 0 || !currentData || !timezone) return null;

  const today = dailyData[0];
  const ratings = getActivityRatings(today, currentData, timezone);

  const activities = [
    { name: 'Olahraga Lari', icon: <FaRunning />, rating: ratings.running },
    { name: 'Jemur Pakaian', icon: <FaTshirt />, rating: ratings.laundry },
    { name: 'Melihat Bintang', icon: <FaStar />, rating: ratings.stargazing },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Indeks Aktivitas Hari Ini</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {activities.map(activity => (
          <div key={activity.name} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl text-blue-500 dark:text-blue-400 mx-auto w-fit mb-2">
              {activity.icon}
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{activity.name}</p>
            <p className={`font-bold text-lg ${activity.rating.color}`}>{activity.rating.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityIndex;