// src/components/FavoriteLocations.jsx
import React from 'react';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';

const MAX_FAVORITES = 5; // Batasi jumlah favorit agar UI tetap rapi

const FavoriteLocations = ({ favorites, currentCity, onToggleFavorite, onSelectFavorite, onRemoveFavorite }) => {
  // --- LOGIKA YANG DIPERTAJAM ---
  const isFavorite = currentCity && favorites.some(fav => fav.toLowerCase() === currentCity.toLowerCase());
  const canAddFavorite = !isFavorite && favorites.length < MAX_FAVORITES;

  let buttonText = 'Simpan Lokasi Ini';
  let buttonIcon = <FaRegStar size={18} />;

  if (isFavorite) {
    buttonText = 'Tersimpan di Favorit';
    buttonIcon = <FaStar size={18} />;
  } else if (favorites.length >= MAX_FAVORITES) {
    buttonText = 'Favorit Penuh';
  }

  return (
    // --- DESAIN BARU: Menggunakan padding lebih seimbang dan warna yang lebih lembut ---
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Lokasi Favorit</h3>
        <button 
          onClick={() => onToggleFavorite(currentCity)}
          // Tombol akan nonaktif jika kota sudah jadi favorit atau daftar penuh
          disabled={!canAddFavorite || !currentCity}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                     text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 
                     hover:bg-yellow-200 dark:hover:bg-yellow-900/80
                     disabled:opacity-50 disabled:cursor-not-allowed"
          title={isFavorite ? 'Hapus dari favorit' : (canAddFavorite ? 'Tambah ke favorit' : 'Daftar favorit sudah penuh')}
        >
          {buttonIcon}
          {buttonText}
        </button>
      </div>
      
      <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>

      <div className="flex flex-wrap gap-2">
        {favorites.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Klik ikon bintang untuk menyimpan lokasi favorit Anda (maksimal {MAX_FAVORITES}).</p>
        ) : (
          favorites.map(city => (
            // Desain "pil" yang lebih modern
            <div 
              key={city} 
              className="group flex items-center bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-200"
            >
              <button 
                onClick={() => onSelectFavorite(city)}
                className="pl-4 pr-3 py-1.5 transition-colors duration-200 group-hover:text-blue-500"
              >
                {city}
              </button>
              <button
                onClick={() => onRemoveFavorite(city)}
                className="px-2 py-1.5 rounded-full transition-all duration-200 opacity-50 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
                title={`Hapus ${city}`}
              >
                <FaTimes size={10} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoriteLocations;