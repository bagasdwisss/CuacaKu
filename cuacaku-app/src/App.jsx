import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
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
import ClothingAdvice from './components/ClothingAdvice';
import WeatherDetails from './components/WeatherDetails';
import SettingsMenu from './components/SettingsMenu';
import UpdateStatus from './components/UpdateStatus';
import Toast from './components/Toast';

import { getThemeAndBackground } from './utils/themeService';
import { getUpcomingHours } from './utils/timeUtils';
import { hasCoords, isSameLocation, toStoredLocation, normalizeFavorites } from './utils/locationUtils';
import { useSettings } from './context/settingsContext';
import useLocalStorage from './hooks/useLocalStorage';
import useAutoRefresh from './hooks/useAutoRefresh';

const DEFAULT_LOCATION = { name: 'Medan' };
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // auto-refresh tiap 10 menit
const STALE_AFTER_MS = 5 * 60 * 1000;       // saat tab kembali aktif, refresh bila data lebih tua dari 5 menit

function App() {
  const { themeMode } = useSettings();

  // --- State Management ---
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [rawFavorites, setFavorites] = useLocalStorage('favoriteCities', []);
  const [lastLocation, setLastLocation] = useLocalStorage('lastLocation', null);
  const favorites = useMemo(() => normalizeFavorites(rawFavorites), [rawFavorites]);

  const initialLocationRef = useRef(lastLocation); // lokasi terakhir dipakai sekali saat aplikasi dibuka
  const abortRef = useRef(null);
  const busyRef = useRef(false);
  const hasDataRef = useRef(false);
  const currentTargetRef = useRef(null);

  // --- Fungsi-fungsi Utama ---

  // target: string (teks / "lat,lon") atau objek { name, country, lat, lon }
  const fetchData = useCallback(async (target, { silent = false } = {}) => {
    abortRef.current?.abort(); // batalkan request sebelumnya agar hasil lama tidak menimpa hasil baru
    const controller = new AbortController();
    abortRef.current = controller;
    busyRef.current = true;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await getWeatherData(target, { signal: controller.signal });
      if (controller.signal.aborted) return;

      const location = toStoredLocation(response.location);
      currentTargetRef.current = location;
      hasDataRef.current = true;

      setWeatherData(response);
      setLastUpdated(Date.now());
      setError(null);
      setLastLocation(location);

      // Favorit lama (tanpa koordinat) otomatis dilengkapi koordinatnya
      setFavorites((prev) => {
        const normalized = normalizeFavorites(prev);
        const next = normalized.map((fav) =>
          !hasCoords(fav) && isSameLocation(fav, location)
            ? { ...fav, country: location.country, lat: location.lat, lon: location.lon }
            : fav
        );
        return next.some((fav, i) => fav !== prev[i]) ? next : prev;
      });
    } catch (err) {
      if (axios.isCancel(err) || controller.signal.aborted) return;
      console.error('Error fetching data:', err);
      const message = err?.userMessage || 'Lokasi tidak ditemukan atau terjadi kesalahan.';

      if (hasDataRef.current) {
        // Data lama tetap ditampilkan, kesalahan cukup lewat notifikasi
        setToast(silent ? 'Gagal memperbarui data. Menampilkan data terakhir.' : message);
      } else {
        setError(message);
        setWeatherData(null);
      }
    } finally {
      if (abortRef.current === controller) {
        busyRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [setFavorites, setLastLocation]);

  // Refresh diam-diam untuk lokasi yang sedang ditampilkan (tombol manual + auto-refresh)
  const refresh = useCallback(() => {
    if (busyRef.current || !currentTargetRef.current) return;
    fetchData(currentTargetRef.current, { silent: true });
  }, [fetchData]);

  const handleToggleFavorite = useCallback((location) => {
    if (!location?.name) return;
    setFavorites((prev) => {
      const list = normalizeFavorites(prev);
      return list.some((fav) => isSameLocation(fav, location))
        ? list.filter((fav) => !isSameLocation(fav, location))
        : [...list, toStoredLocation(location)];
    });
  }, [setFavorites]);

  const handleRemoveFavorite = useCallback((location) => {
    setFavorites((prev) => normalizeFavorites(prev).filter((fav) => !isSameLocation(fav, location)));
  }, [setFavorites]);

  const handleCloseToast = useCallback(() => setToast(null), []);

  // --- Efek Samping ---

  // Muat lokasi terakhir (atau Medan untuk pengunjung baru) saat aplikasi dibuka
  useEffect(() => {
    const saved = initialLocationRef.current;
    fetchData(saved && saved.name ? saved : DEFAULT_LOCATION);
    return () => abortRef.current?.abort();
  }, [fetchData]);

  useAutoRefresh(refresh, {
    lastUpdated,
    enabled: !!weatherData,
    intervalMs: REFRESH_INTERVAL_MS,
    staleAfterMs: STALE_AFTER_MS,
  });

  // Tema: otomatis (siang/malam di lokasi) atau pilihan manual
  const autoTheme = weatherData ? getThemeAndBackground(weatherData).theme : 'light';
  const theme = themeMode === 'auto' ? autoTheme : themeMode;
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // 24 jam ke depan dihitung mulai dari jam sekarang (melewati tengah malam bila perlu)
  const upcoming = useMemo(
    () => (weatherData ? getUpcomingHours(weatherData.hoursAll, 24) : []),
    [weatherData]
  );

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-1000 flex flex-col`}>
      {/* Bar loading tipis saat berpindah lokasi */}
      {loading && weatherData && (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-blue-200/40" role="progressbar" aria-label="Memuat data cuaca">
          <div className="h-full w-1/4 bg-blue-500 animate-loading-bar" />
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
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
            <SettingsMenu />
          </div>
        </header>

        {/* Main content area with consistent min-height */}
        <main className="flex-grow flex flex-col justify-center min-h-0">
          {error && (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-center text-xl text-red-500">{error}</p>
            </div>
          )}

          {loading && !weatherData && (
            <div className="flex-grow flex items-center justify-center">
              <ThemedLoader />
            </div>
          )}

          {weatherData && (
            <div className={`space-y-8 py-4 transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
              <UpdateStatus lastUpdated={lastUpdated} refreshing={refreshing || loading} onRefresh={refresh} />
              <FavoriteLocations
                favorites={favorites}
                currentLocation={weatherData.location}
                onToggleFavorite={handleToggleFavorite}
                onSelectFavorite={fetchData}
                onRemoveFavorite={handleRemoveFavorite}
              />
              <WeatherAlerts
                alerts={weatherData.alerts}
                current={weatherData.current}
                upcoming={upcoming}
                hoursToday={weatherData.hoursToday}
                timezone={weatherData.timezone}
              />
              <CurrentWeather data={weatherData} />
              <DailySummary dayData={weatherData.daily[0]} hourlyData={weatherData.hoursToday} />
              <ClothingAdvice current={weatherData.current} upcoming={upcoming} />
              <WeatherDetails current={weatherData.current} today={weatherData.daily[0]} />
              <ActivityIndex
                dailyData={weatherData.daily}
                currentData={weatherData.current}
                upcoming={upcoming}
                timezone={weatherData.timezone}
              />
              <HourlyForecast
                hours={upcoming}
                daily={weatherData.daily}
                resetKey={`${weatherData.location.lat},${weatherData.location.lon}`}
              />
              <DailyForecast dailyData={weatherData.daily} timezone={weatherData.timezone} />
            </div>
          )}
        </main>

        {/* Footer akan selalu tampil di bagian bawah */}
        <footer className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm flex-shrink-0">
          <p>Weather data provided by <a href="https://www.visualcrossing.com/" title="Visual Crossing" className="text-blue-500 hover:underline">Visual Crossing</a></p>
          <p>AQI data provided by <a href="https://aqicn.org/" title="AQICN" className="text-blue-500 hover:underline">AQICN</a></p>
        </footer>
      </div>

      {toast && <Toast message={toast} onClose={handleCloseToast} />}
    </div>
  );
}

export default App;