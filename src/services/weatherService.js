import axios from 'axios';

const VC_API_KEY = import.meta.env.VITE_VISUALCROSSING_API_KEY;
const AQI_API_KEY = import.meta.env.VITE_AQI_API_KEY;
const GEO_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY; // Key untuk Geocoding

const VC_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
const AQI_BASE_URL = 'https://api.waqi.info/feed/geo:';
const GEOCODING_URL = 'https://api.geoapify.com/v1/geocode/search'; // URL Geocoding baru (HTTPS)

const convertAqiToScale = (aqiValue) => {
  if (aqiValue <= 50) return 1; if (aqiValue <= 100) return 2;
  if (aqiValue <= 150) return 3; if (aqiValue <= 200) return 4;
  if (aqiValue > 200) return 5; return null;
};

const isCoordinates = (str) => /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(str);

export const getWeatherData = async (location) => {
  let latitude, longitude;
  let verifiedCityName, verifiedCountryName;

  // --- Langkah 1: Dapatkan Koordinat yang Akurat dengan Geoapify ---
  if (!isCoordinates(location)) {
    const geoResponse = await axios.get(GEOCODING_URL, {
      params: { text: location, limit: 1, apiKey: GEO_API_KEY },
    });
    if (!geoResponse.data || !geoResponse.data.features || geoResponse.data.features.length === 0) {
      throw new Error(`Lokasi "${location}" tidak dapat ditemukan.`);
    }
    const result = geoResponse.data.features[0].properties;
    latitude = result.lat;
    longitude = result.lon;
    verifiedCityName = result.city;
    verifiedCountryName = result.country;
  } else {
    [latitude, longitude] = location.split(',').map(Number);
  }

  // --- Langkah 2: Ambil Data Cuaca & AQI dengan Koordinat Terverifikasi ---
  const vcUrl = `${VC_BASE_URL}${latitude},${longitude}?unitGroup=metric&include=hours,current,alerts&key=${VC_API_KEY}&contentType=json`;
  const aqiUrl = `${AQI_BASE_URL}${latitude};${longitude}/?token=${AQI_API_KEY}`;

  const [weatherResponse, aqiResponse] = await Promise.all([
    axios.get(vcUrl).catch(err => { console.error("VC API Error:", err); return null; }),
    axios.get(aqiUrl).catch(err => { console.error("AQI API Error:", err); return null; })
  ]);
  
  if (!weatherResponse || !weatherResponse.data) {
    throw new Error("Gagal mengambil data cuaca utama.");
  }
  const weatherData = weatherResponse.data;

  // --- Langkah 3: Proses Data AQI dan Nama Lokasi Cadangan ---
  let aqiValue = null;
  let aqiCityName = null;
  if (aqiResponse && aqiResponse.data && aqiResponse.data.status === 'ok' && aqiResponse.data.data) {
    if (aqiResponse.data.data.aqi) aqiValue = convertAqiToScale(aqiResponse.data.data.aqi);
    if (aqiResponse.data.data.city && aqiResponse.data.data.city.name) aqiCityName = aqiResponse.data.data.city.name;
  }

  // --- Langkah 4: Logika Final untuk Menentukan Nama Lokasi ---
  let finalCityName = verifiedCityName;
  let finalCountryName = verifiedCountryName;

  if (!finalCityName) {
    if (aqiCityName) {
      const parts = aqiCityName.split(',').map(part => part.trim());
      finalCityName = parts[0];
      if (parts.length > 1 && isNaN(parts[parts.length - 1])) finalCountryName = parts[parts.length - 1];
    } else if (weatherData.resolvedAddress) {
      const addressParts = weatherData.resolvedAddress.split(',').map(part => part.trim());
      finalCityName = addressParts[0];
      if (addressParts.length > 1 && isNaN(addressParts[parts.length - 1])) finalCountryName = addressParts[parts.length - 1];
    } else {
      finalCityName = location;
    }
  }

  // ===== PERBAIKAN FINAL DI SINI: Membersihkan nama kota dengan lebih baik =====
  // Regex ini sekarang juga akan menghapus "Special Capital Region of" dan variasi lainnya
  if (finalCityName) {
    finalCityName = finalCityName.replace(/^(city of|kota|kabupaten|regency of|special capital region of)\s/i, '').trim();
  }

  return {
    location: { name: finalCityName, country: finalCountryName },
    timezone: weatherData.timezone,
    current: { ...weatherData.currentConditions, aqi: aqiValue },
    hourly: weatherData.days[0].hours,
    daily: weatherData.days,
    alerts: weatherData.alerts || [],
  };
};
