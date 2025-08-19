// src/components/SkeletonCurrentWeather.jsx
import React from 'react';

const SkeletonCurrentWeather = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
    {/* Placeholder untuk Lokasi dan Tanggal */}
    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
    
    {/* Placeholder untuk Ikon dan Suhu */}
    <div className="flex items-center mt-4">
      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="ml-4 flex-1">
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    
    {/* Placeholder untuk detail di bawah */}
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-4">
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

export default SkeletonCurrentWeather;