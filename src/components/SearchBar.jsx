// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

// Daftar kota populer yang bisa kita tambahkan sendiri
const popularCities = {
  'indonesia': ['Jakarta', 'Surabaya', 'Medan', 'Bandung'],
  'prancis': ['Paris', 'Marseille', 'Lyon', 'Nice'],
  'jepang': ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo'],
  'malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru'],
  'singapura': ['Singapore'],
  'amerika serikat': ['New York', 'Los Angeles', 'Chicago'],
};

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    const lowerCaseValue = value.toLowerCase();
    // Cek jika input pengguna cocok dengan salah satu negara di daftar kita
    if (popularCities[lowerCaseValue]) {
      setRecommendations(popularCities[lowerCaseValue]);
    } else {
      setRecommendations([]);
    }
  };
  
  const handleRecommendationClick = (city) => {
    setQuery(city);
    onSearch(city);
    setRecommendations([]); // Sembunyikan rekomendasi setelah diklik
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      onSearch(query);
      setRecommendations([]); // Sembunyikan rekomendasi setelah mencari
    }
  };

  return (
    // Kita buat wrapper relative agar daftar rekomendasi bisa diposisikan absolut
    <div className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSearch}>
        <div className="relative flex items-center text-gray-500 focus-within:text-blue-600">
          <span className="absolute left-3"> <FaSearch /> </span>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Cari kota atau negara..."
            className="w-full pl-10 pr-4 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors duration-300"
            autoComplete="off"
          />
          <button type="submit" className="hidden">Search</button>
        </div>
      </form>
      
      {/* Daftar Rekomendasi */}
      {recommendations.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Pilih kota populer:</p>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recommendations.map(city => (
              <li 
                key={city}
                onClick={() => handleRecommendationClick(city)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {city}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;