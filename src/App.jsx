// src/App.jsx
import React, { useState, useEffect } from 'react';
import { getWeatherData } from './services/weatherService';

import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherAlerts from './components/WeatherAlerts';
import FavoriteLocations from './components/FavoriteLocations';
import SkeletonCurrentWeather from './components/SkeletonCurrentWeather';
import SkeletonForecast from './components/SkeletonForecast';
import DetectLocation from './components/DetectLocation';
import ActivityIndex from './components/ActivityIndex'; // <-- Impor baru
import DailySummary from './components/DailySummary';   // <-- Impor baru
import { getThemeAndBackground } from './utils/themeService';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCity, setCurrentCity] = useState('');

  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favoriteCities');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    const initialCity = favorites.length > 0 ? favorites[0] : 'Medan';
    fetchData(initialCity);
  }, []); 

  const fetchData = async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWeatherData(loc);
      setWeatherData(response);
      setCurrentCity(response.location.name);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Lokasi tidak ditemukan atau terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (city) => { /* ... Logika tidak berubah ... */ };
  const handleRemoveFavorite = (city) => { /* ... Logika tidak berubah ... */ };
  // (Sisipkan logika handleToggleFavorite & handleRemoveFavorite dari jawaban sebelumnya di sini)

  const themeAndBackground = weatherData ? getThemeAndBackground(weatherData) : { theme: 'light', backgroundClass: 'bg-gray-100' };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeAndBackground.theme);
  }, [themeAndBackground.theme]);

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-1000 p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="flex items-center text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4 sm:mb-0">CuacaKu
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
                currentCity={currentCity}
                onToggleFavorite={handleToggleFavorite}
                onSelectFavorite={fetchData}
                onRemoveFavorite={handleRemoveFavorite}
              />
              <WeatherAlerts alerts={weatherData.alerts} current={weatherData.current} hourly={weatherData.hourly} />
              <CurrentWeather data={weatherData} />
              {/* ===== KOMPONEN BARU DITAMPILKAN DI SINI ===== */}
              <DailySummary dayData={weatherData.daily[0]} hourlyData={weatherData.hourly} />
              <ActivityIndex dailyData={weatherData.daily} currentData={weatherData.current} />
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

// Jangan lupa untuk menyalin fungsi ini juga jika terhapus
App.prototype.handleToggleFavorite = function (city) {
  const { favorites, setFavorites } = this;
  const updatedFavorites = favorites.some(fav => fav.toLowerCase() === city.toLowerCase())
    ? favorites.filter(fav => fav.toLowerCase() !== city.toLowerCase())
    : [...favorites, city];
  setFavorites(updatedFavorites);
  localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
};
App.prototype.handleRemoveFavorite = function (city) {
  const { favorites, setFavorites } = this;
  const updatedFavorites = favorites.filter(fav => fav.toLowerCase() !== city.toLowerCase());
  setFavorites(updatedFavorites);
  localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
};

export default App;