import React from 'react';

const ThemedLoader = ({ isOverlay = false }) => {
  const containerClasses = isOverlay
    ? "absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-30 animate-fade-in"
    : "flex flex-col items-center justify-center py-20";

  return (
    <div className={containerClasses}>
      <div className="relative w-32 h-32">
        {/* Matahari */}
        <svg className="absolute inset-0 animate-spin-slow text-yellow-400" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="20" />
          {[...Array(12)].map((_, i) => (
            <rect key={i} x="48" y="5" width="4" height="15" rx="2" transform={`rotate(${i * 30}, 50, 50)`} />
          ))}
        </svg>
        {/* Awan */}
        <svg className="absolute inset-0 animate-cloud-float text-white/90" viewBox="0 0 120 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M81.5 48.8C79.2 41.1 71.1 36 62.1 36c-1.8 0-3.6.3-5.3.9C52.1 25.2 41.1 18 28.1 18c-14.9 0-27 12.1-27 27s12.1 27 27 27h54c10.5 0 19-8.5 19-19s-8.5-19-19-19.2z" />
        </svg>
      </div>
      <p className={`mt-4 font-semibold ${isOverlay ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
        Memuat data cuaca...
      </p>
    </div>
  );
};

export default ThemedLoader;
