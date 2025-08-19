// src/services/weatherService.js
import axios from 'axios';

const VC_API_KEY = import.meta.env.VITE_VISUALCROSSING_API_KEY;
const AQI_API_KEY = import.meta.env.VITE_AQI_API_KEY; // <-- Menggunakan key baru

const VC_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
const AQI_BASE_URL = 'https://api.waqi.info/feed/geo:';

// Fungsi helper untuk mengubah skala AQI dari WAQI (0-500+) ke skala kita (1-5)
const convertAqiToScale = (aqiValue) => {
  if (aqiValue <= 50) return 1;  // Baik
  if (aqiValue <= 100) return 2; // Sedang
  if (aqiValue <= 150) return 3; // Kurang Sehat (Sensitif)
  if (aqiValue <= 200) return 4; // Tidak Sehat
  if (aqiValue > 200) return 5;  // Sangat Buruk
  return null; // Jika data tidak valid
};

export const getWeatherData = async (location) => {
  // --- Langkah 1: Ambil data cuaca utama dari Visual Crossing ---
  const vcUrl = `${VC_BASE_URL}${encodeURIComponent(location)}?unitGroup=metric&include=hours,current,alerts&key=${VC_API_KEY}&contentType=json`;
  const weatherResponse = await axios.get(vcUrl);
  const weatherData = weatherResponse.data;

  const { latitude, longitude } = weatherData;

  let aqiValue = null;
  try {
    // --- Langkah 2: Gunakan koordinat untuk mengambil data AQI dari WAQI ---
    const aqiUrl = `${AQI_BASE_URL}${latitude};${longitude}/?token=${AQI_API_KEY}`;
    const aqiResponse = await axios.get(aqiUrl);

    // Cek jika API merespon dengan 'ok' dan ada data AQI
    if (aqiResponse.data.status === 'ok' && aqiResponse.data.data.aqi) {
      const rawAqi = aqiResponse.data.data.aqi;
      // Konversi nilai AQI mentah ke skala 1-5 yang digunakan UI kita
      aqiValue = convertAqiToScale(rawAqi);
    }
  } catch (error) {
    console.error("Gagal mengambil data AQI dari WAQI:", error);
    aqiValue = null;
  }

  // --- Langkah 3: Gabungkan semua data menjadi satu objek ---
  const addressParts = weatherData.resolvedAddress.split(',').map(part => part.trim());
  const cityName = addressParts[0];
  const countryName = addressParts.length > 1 ? addressParts[addressParts.length - 1] : '';

  return {
    location: { name: cityName, country: countryName },
    timezone: weatherData.timezone,
    current: {
      ...weatherData.currentConditions,
      aqi: aqiValue, // Suntikkan data AQI yang sudah dikonversi
    },
    hourly: weatherData.days[0].hours,
    daily: weatherData.days,
    alerts: weatherData.alerts || [],
  };
};