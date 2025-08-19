// src/components/DetectLocation.jsx
import React, { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const DetectLocation = ({ onDetect }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');

  const handleDetect = () => {
    setIsDetecting(true);
    setError('');
    
    // Meminta lokasi pengguna
    navigator.geolocation.getCurrentPosition(
      // Jika berhasil:
      (position) => {
        const { latitude, longitude } = position.coords;
        onDetect(`${latitude},${longitude}`); // Kirim koordinat ke App.jsx
        setIsDetecting(false);
      },
      // Jika gagal:
      (err) => {
        setError('Gagal mendeteksi lokasi. Pastikan izin lokasi sudah diberikan pada browser Anda.');
        setIsDetecting(false);
        console.error(err);
      }
    );
  };

  return (
    <div className="mb-4 text-center">
      <button
        onClick={handleDetect}
        disabled={isDetecting}
        className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
      >
        <FaMapMarkerAlt className="mr-2" />
        {isDetecting ? 'Mendeteksi...' : 'Gunakan Lokasi Saya'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default DetectLocation;