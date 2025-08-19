// src/components/SkeletonForecast.jsx
import React from 'react';

const SkeletonForecast = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse">
    <div className="h-7 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      {/* Membuat 5 baris placeholder */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonForecast;