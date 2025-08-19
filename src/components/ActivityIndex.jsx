// src/components/ActivityIndex.jsx
import React from 'react';
import { FaRunning, FaTshirt, FaStar } from 'react-icons/fa';

// Fungsi untuk menentukan rating berdasarkan kondisi
const getActivityRatings = (today, current) => {
  const ratings = {};

  // 1. Logika untuk Olahraga Lari
  const isGoodTempForRun = today.temp > 18 && today.temp < 28;
  const isNotRaining = today.precipprob < 25;
  const isAqiGood = current.aqi < 100;
  if (isGoodTempForRun && isNotRaining && isAqiGood) {
    ratings.running = { label: 'Baik', color: 'text-green-500' };
  } else if (isGoodTempForRun && isNotRaining) {
    ratings.running = { label: 'Cukup', color: 'text-yellow-500' };
  } else {
    ratings.running = { label: 'Kurang', color: 'text-red-500' };
  }

  // 2. Logika untuk Menjemur Pakaian
  const isSunnyAndDry = today.precipprob < 15 && today.uvindex > 5;
  if (isSunnyAndDry) {
    ratings.laundry = { label: 'Sangat Baik', color: 'text-green-500' };
  } else if (today.precipprob < 40) {
    ratings.laundry = { label: 'Cukup', color: 'text-yellow-500' };
  } else {
    ratings.laundry = { label: 'Tidak Disarankan', color: 'text-red-500' };
  }

  // 3. Logika untuk Melihat Bintang
  const isNight = new Date().getHours() >= 19 || new Date().getHours() < 5;
  const isClearSky = today.cloudcover < 20;
  if (isNight && isClearSky) {
    ratings.stargazing = { label: 'Ideal', color: 'text-green-500' };
  } else if (isNight) {
    ratings.stargazing = { label: 'Berawan', color: 'text-yellow-500' };
  } else {
    ratings.stargazing = { label: 'Belum Malam', color: 'text-gray-500' };
  }

  return ratings;
};

const ActivityIndex = ({ dailyData, currentData }) => {
  if (!dailyData || dailyData.length === 0 || !currentData) return null;

  const today = dailyData[0];
  const ratings = getActivityRatings(today, currentData);

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