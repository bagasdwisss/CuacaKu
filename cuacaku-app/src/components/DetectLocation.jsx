import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import { FiAlertTriangle } from 'react-icons/fi';

const DetectLocation = ({ onDetect }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');

  // Otomatis sembunyikan pop-up setelah 5 detik
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDetect = () => {
    setIsDetecting(true);
    setError('');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onDetect(`${latitude},${longitude}`);
        setIsDetecting(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Izin lokasi ditolak. Harap aktifkan di pengaturan browser.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Informasi lokasi tidak tersedia saat ini.');
            break;
          case err.TIMEOUT:
            setError('Waktu permintaan lokasi habis, coba lagi.');
            break;
          default:
            setError('Gagal mendeteksi lokasi.');
            break;
        }
        setIsDetecting(false);
        console.error(err);
      },
      options
    );
  };

  return (
    <>
      <button
        onClick={handleDetect}
        disabled={isDetecting}
        className="p-2.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-wait transition-all"
        title="Gunakan lokasi saya saat ini"
      >
        {isDetecting ? <FaSpinner className="animate-spin" size={18} /> : <FaMapMarkerAlt size={18} />}
      </button>

      {/* --- POP-UP NOTIFIKASI DENGAN DESAIN RESPONSIVE BARU --- */}
      {error && (
        <div 
          className="fixed bottom-4 left-4 right-4 sm:w-auto sm:max-w-md sm:left-1/2 sm:-translate-x-1/2 sm:right-auto
                     bg-red-500 text-white p-4 rounded-lg shadow-2xl 
                     flex items-center justify-between z-50 animate-toast-in"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <FiAlertTriangle size={24} />
            <p className="font-semibold text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError('')} 
            className="p-1 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <FaTimes size={16} />
          </button>
        </div>
      )}
    </>
  );
};

export default DetectLocation;