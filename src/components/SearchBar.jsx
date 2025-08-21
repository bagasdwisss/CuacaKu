import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';

// Daftar kota populer yang bisa kita tambahkan sendiri
const popularCities = {
  'indonesia': ['Jakarta', 'Surabaya', 'Medan', 'Bandung', 'Semarang', 'Yogyakarta', 'Makassar', 'Denpasar', 'Palembang', 'Balikpapan'],
  'prancis': ['Paris', 'Marseille', 'Lyon', 'Nice', 'Toulouse', 'Bordeaux', 'Nantes', 'Strasbourg', 'Lille', 'Montpellier'],
  'jepang': ['Tokyo', 'Osaka', 'Kyoto', 'Sapporo', 'Nagoya', 'Fukuoka', 'Hiroshima', 'Kobe', 'Yokohama', 'Nara'],
  'malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Malacca', 'Kota Kinabalu', 'Kuching', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Seremban'],
  'singapura': ['Singapore', 'Jurong East', 'Woodlands', 'Tampines', 'Hougang', 'Yishun', 'Choa Chu Kang', 'Bukit Batok', 'Punggol', 'Clementi'],
  'amerika serikat': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  'inggris': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Sheffield', 'Newcastle', 'Bristol', 'Nottingham', 'Oxford'],
  'jerman': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Dusseldorf', 'Dresden', 'Nuremberg', 'Leipzig'],
  'italia': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Venice', 'Bologna', 'Palermo', 'Genoa', 'Verona'],
  'spanyol': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga', 'Zaragoza', 'Granada', 'Toledo', 'Santander'],
  'thailand': ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Ayutthaya', 'Hua Hin', 'Krabi', 'Chiang Rai', 'Ko Samui', 'Nakhon Ratchasima'],
  'korea selatan': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Jeonju', 'Jeju City'],
  'cina': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Wuhan', 'Hangzhou', 'Xi\'an', 'Tianjin', 'Nanjing'],
  'india': ['New Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Pune', 'Lucknow'],
  'australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Hobart', 'Darwin', 'Gold Coast', 'Cairns'],
  'kanada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City', 'Halifax', 'Victoria'],
  'rusia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Nizhny Novgorod', 'Samara', 'Omsk', 'Chelyabinsk', 'Sochi'],
  'turki': ['Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa', 'Gaziantep', 'Konya', 'Adana', 'Trabzon', 'Eskisehir'],
  'mesir': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Sharm El Sheikh', 'Hurghada', 'Port Said', 'Suez', 'Mansoura'],
  'brasil': ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador', 'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba', 'Manaus', 'Belo Horizonte']
};


const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const searchBarRef = useRef(null);

  // --- LOGIKA BARU YANG SUDAH DIPERBAIKI ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cek apakah elemen yang diklik berada di luar komponen SearchBar
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        // Jika ya, sembunyikan rekomendasi DAN reset input pencarian
        setRecommendations([]);
        setQuery('');
      }
    };

    // Tambahkan event listener saat komponen pertama kali dimuat
    document.addEventListener('mousedown', handleClickOutside);
    
    // Hapus event listener saat komponen akan dibongkar untuk mencegah kebocoran memori
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Array dependensi kosong agar efek ini hanya berjalan sekali

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    const lowerCaseValue = value.toLowerCase().trim();

    if (!lowerCaseValue) {
      setRecommendations([]);
      return;
    }

    const matchingCountry = Object.keys(popularCities).find(country =>
      country.startsWith(lowerCaseValue)
    );

    if (matchingCountry) {
      setRecommendations(popularCities[matchingCountry]);
    } else {
      setRecommendations([]);
    }
  };
  
  const handleRecommendationClick = (city) => {
    setQuery(city);
    onSearch(city);
    setRecommendations([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      onSearch(query);
      setRecommendations([]);
    }
  };

  return (
    <div ref={searchBarRef} className="relative w-full max-w-md mx-auto">
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
      
      {recommendations.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Pilih kota populer:</p>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto 
                         scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100 
                         dark:scrollbar-thumb-blue-400 dark:scrollbar-track-slate-700
                         hover:scrollbar-thumb-blue-600 dark:hover:scrollbar-thumb-blue-500">
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
