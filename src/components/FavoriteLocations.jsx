// src/components/FavoriteLocations.jsx
import React from 'react';
import { FaStar, FaRegStar, FaTimes } from 'react-icons/fa';

const FavoriteLocations = ({ favorites, currentCity, onToggleFavorite, onSelectFavorite, onRemoveFavorite }) => {
  const isFavorite = favorites.some(fav => fav.toLowerCase() === currentCity.toLowerCase());

  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Lokasi Favorit</h3>
        <button 
          onClick={() => onToggleFavorite(currentCity)}
          className="flex items-center text-yellow-500 hover:text-yellow-400 transition-colors"
          title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        >
          {isFavorite ? <FaStar size={20} /> : <FaRegStar size={20} />}
          <span className="ml-2 text-sm font-semibold">{isFavorite ? 'Tersimpan' : 'Simpan'}</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {favorites.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada lokasi favorit.</p>
        ) : (
          favorites.map(city => (
            <div key={city} className="flex items-center bg-blue-500 text-white rounded-full">
              <button 
                onClick={() => onSelectFavorite(city)}
                className="px-4 py-1 text-sm font-semibold hover:bg-blue-600 rounded-l-full"
              >
                {city}
              </button>
              <button
                onClick={() => onRemoveFavorite(city)}
                className="px-2 py-1 hover:bg-blue-600 rounded-r-full"
                title={`Hapus ${city}`}
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoriteLocations;