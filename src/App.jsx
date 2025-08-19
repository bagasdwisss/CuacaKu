// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getWeatherData } from './services/weatherService';

// Impor semua komponen yang dibutuhkan
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherAlerts from './components/WeatherAlerts';
import FavoriteLocations from './components/FavoriteLocations';
import SkeletonCurrentWeather from './components/SkeletonCurrentWeather';
import SkeletonForecast from './components/SkeletonForecast';
import DetectLocation from './components/DetectLocation';
import ActivityIndex from './components/ActivityIndex';
import DailySummary from './components/DailySummary';
import { getThemeAndBackground } from './utils/themeService';

function App() {
  // --- State Management ---
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mengambil favorit dari localStorage saat pertama kali dimuat
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavorites = localStorage.getItem('favoriteCities');
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (e) {
      console.error("Gagal memuat favorit dari localStorage", e);
      return [];
    }
  });

  // --- Fungsi-fungsi Utama (Dioptimalkan dengan useCallback) ---

  // Fungsi utama untuk mengambil data cuaca
  const fetchData = useCallback(async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWeatherData(loc);
      setWeatherData(response);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Lokasi tidak ditemukan atau terjadi kesalahan.');
      setWeatherData(null); // Kosongkan data jika terjadi error
    } finally {
      setLoading(false);
    }
  }, []); // useCallback dengan dependency kosong karena tidak bergantung pada state lain

  // Fungsi untuk menambah/menghapus favorit
  const handleToggleFavorite = useCallback((city) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(fav => fav.toLowerCase() === city.toLowerCase());
      const updatedFavorites = isFavorite
        ? prevFavorites.filter(fav => fav.toLowerCase() !== city.toLowerCase())
        : [...prevFavorites, city];
      
      localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);

  // Fungsi untuk menghapus favorit dari daftar
  const handleRemoveFavorite = useCallback((city) => {
    setFavorites(prevFavorites => {
      const updatedFavorites = prevFavorites.filter(fav => fav.toLowerCase() !== city.toLowerCase());
      localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);


  // --- Efek Samping (useEffect) ---

  // Efek untuk memuat data awal saat aplikasi pertama kali dibuka
  useEffect(() => {
    const initialCity = favorites.length > 0 ? favorites[0] : 'Medan';
    fetchData(initialCity);
  }, [fetchData]); // Hanya bergantung pada fetchData

  // Efek untuk mengubah tema terang/gelap
  const theme = weatherData ? getThemeAndBackground(weatherData).theme : 'light';
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-1000 p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="flex items-center text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4 sm:mb-0">
            CuacaKu
            <img 
              src="/logo.png" 
              alt="Logo CuacaKu" 
              className="h-10 w-10 ml-2 align-middle" 
            />
          </h1>
          <div className="w-full sm:w-auto">
            <SearchBar onSearch={fetchData} />
          </div>
        </header>

        <main>
          <DetectLocation onDetect={fetchData} />
          
          {error && <p className="text-center text-xl text-red-500">{error}</p>}
          
          {loading && !weatherData && (
            <div className="space-y-8">
              <SkeletonCurrentWeather />
              <SkeletonForecast />
            </div>
          )}

          {weatherData && (
            <div className="space-y-8">
              <FavoriteLocations 
                favorites={favorites}
                currentCity={weatherData.location.name}
                onToggleFavorite={handleToggleFavorite}
                onSelectFavorite={fetchData}
                onRemoveFavorite={handleRemoveFavorite}
              />
              <WeatherAlerts 
                alerts={weatherData.alerts} 
                current={weatherData.current} 
                hourly={weatherData.hourly}
                timezone={weatherData.timezone}
              />
              <CurrentWeather data={weatherData} />
              <DailySummary dayData={weatherData.daily[0]} hourlyData={weatherData.hourly} />
              <ActivityIndex 
                dailyData={weatherData.daily} 
                currentData={weatherData.current} 
                timezone={weatherData.timezone} 
              />
              <HourlyForecast hourlyData={weatherData.hourly} />
              <DailyForecast dailyData={weatherData.daily} />
            </div>
          )}
        </main>
         <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
           <p>Weather data provided by <a href="https://www.visualcrossing.com/" title="Visual Crossing" className="text-blue-500 hover:underline">Visual Crossing</a></p>
        </footer>
      </div>
    </div>
  );
}

export default App;