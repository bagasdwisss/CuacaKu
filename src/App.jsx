import React, { useState, useEffect, useCallback } from 'react';
import { getWeatherData } from './services/weatherService';

// Impor semua komponen yang dibutuhkan
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherAlerts from './components/WeatherAlerts';
import FavoriteLocations from './components/FavoriteLocations';
import ThemedLoader from './components/ThemedLoader';
import DetectLocation from './components/DetectLocation';
import ActivityIndex from './components/ActivityIndex';
import DailySummary from './components/DailySummary';
import { getThemeAndBackground } from './utils/themeService';

function App() {
  // --- State Management ---
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  const fetchData = useCallback(async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWeatherData(loc);
      setWeatherData(response);
    } catch (err) { // <-- Kurung kurawal yang hilang sudah diperbaiki
      console.error("Error fetching data:", err);
      setError('Lokasi tidak ditemukan atau terjadi kesalahan.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleRemoveFavorite = useCallback((city) => {
    setFavorites(prevFavorites => {
      const updatedFavorites = prevFavorites.filter(fav => fav.toLowerCase() !== city.toLowerCase());
      localStorage.setItem('favoriteCities', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);


  // --- Efek Samping (useEffect) ---

  useEffect(() => {
    fetchData('Medan');
  }, [fetchData]);

  const theme = weatherData ? getThemeAndBackground(weatherData).theme : 'light';
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    // ===== PERBAIKAN STRUKTUR LAYOUT DI SINI =====
    // 1. Div terluar diubah menjadi container flexbox vertikal
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-1000 flex flex-col`}>
      {/* 2. Div ini sekarang bertanggung jawab atas padding dan ikut tumbuh mengisi ruang */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="flex items-center text-3xl font-bold text-blue-600 dark:text-blue-400">
            CuacaKu
            <img 
              src="/logo.png" 
              alt="Logo CuacaKu" 
              className="h-10 w-10 ml-2 align-middle" 
            />
          </h1>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SearchBar onSearch={fetchData} />
            <DetectLocation onDetect={fetchData} />
          </div>
        </header>

        {/* 3. Main sekarang akan mendorong footer ke bawah */}
        {/* Tambahkan class flex untuk menengahkan loader */}
        <main className={`flex-grow ${loading && !weatherData ? 'flex flex-col justify-center' : ''}`}>
          {error && <p className="text-center text-xl text-red-500">{error}</p>}
          
          {loading && !weatherData && (
            <ThemedLoader />
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
              <CurrentWeather data={weatherData} loading={loading} />
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
         <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">
           <p>Weather data provided by <a href="https://www.visualcrossing.com/" title="Visual Crossing" className="text-blue-500 hover:underline">Visual Crossing</a></p>
           <p>AQI data provided by <a href="https://aqicn.org/" title="AQICN" className="text-blue-500 hover:underline">AQICN</a></p>
        </footer>
      </div>
    </div>
  );
}

export default App;
