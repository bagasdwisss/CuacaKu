import axios from 'axios';
import { geocodePlace, reverseGeocode, cleanPlaceName, isCoordinates, userError } from './geoService';

const VC_API_KEY = import.meta.env.VITE_VISUALCROSSING_API_KEY;
const AQI_API_KEY = import.meta.env.VITE_AQI_API_KEY;

const VC_BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
const AQI_BASE_URL = 'https://api.waqi.info/feed/geo:';

const isValidCoord = (lat, lon) =>
  Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;

// Target bisa berupa:
//  - objek { name, country, lat, lon } (dari autocomplete / favorit / lokasi terakhir)
//  - objek { name } tanpa koordinat (favorit versi lama)
//  - string "lat,lon" (dari tombol deteksi lokasi)
//  - string nama tempat (diketik bebas)
const resolvePlace = async (target, signal) => {
  if (target && typeof target === 'object' && typeof target.lat === 'number' && typeof target.lon === 'number') {
    if (!isValidCoord(target.lat, target.lon)) throw userError('Koordinat lokasi tidak valid.');
    return { name: target.name || null, country: target.country || null, lat: target.lat, lon: target.lon };
  }

  const text = (typeof target === 'string' ? target : target?.name || '').trim();
  if (!text) throw userError('Lokasi tidak valid.');

  if (isCoordinates(text)) {
    const [lat, lon] = text.split(',').map(Number);
    if (!isValidCoord(lat, lon)) throw userError('Koordinat lokasi tidak valid.');
    return { name: null, country: null, lat, lon };
  }

  return geocodePlace(text, { signal });
};

// Request opsional: bila gagal (selain dibatalkan) kembalikan null agar tidak menggagalkan seluruh data
const optionalRequest = async (promiseFactory, label) => {
  try {
    return await promiseFactory();
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.error(`${label} Error:`, err);
    return null;
  }
};

export const getWeatherData = async (target, { signal } = {}) => {
  // --- Langkah 1: Tentukan koordinat ---
  const place = await resolvePlace(target, signal);
  const { lat, lon } = place;

  // --- Langkah 2: Ambil cuaca, AQI, dan (bila perlu) nama tempat secara paralel ---
  const needsReverse = !place.name;
  const [weatherResponse, aqiResponse, reverse] = await Promise.all([
    optionalRequest(
      () =>
        axios.get(`${VC_BASE_URL}${lat},${lon}`, {
          params: { unitGroup: 'metric', include: 'hours,current,alerts', key: VC_API_KEY, contentType: 'json' },
          signal,
        }),
      'VC API'
    ),
    optionalRequest(() => axios.get(`${AQI_BASE_URL}${lat};${lon}/`, { params: { token: AQI_API_KEY }, signal }), 'AQI API'),
    needsReverse ? optionalRequest(() => reverseGeocode(lat, lon, { signal }), 'Reverse Geocoding') : Promise.resolve(null),
  ]);

  if (!weatherResponse || !weatherResponse.data || !weatherResponse.data.days?.length) {
    throw userError('Gagal mengambil data cuaca utama.');
  }
  const weatherData = weatherResponse.data;

  if (import.meta.env.DEV) {
    // Pantau penggunaan kuota Visual Crossing (batas gratis: 1.000 record/hari)
    console.info('[CuacaKu] Visual Crossing queryCost:', weatherData.queryCost);
  }

  // --- Langkah 3: AQI (nilai mentah 0-500) dan nama kota cadangan dari stasiun AQI ---
  let aqiValue = null;
  let aqiCityName = null;
  if (aqiResponse?.data?.status === 'ok' && aqiResponse.data.data) {
    const rawAqi = Number(aqiResponse.data.data.aqi);
    if (Number.isFinite(rawAqi)) aqiValue = rawAqi;
    aqiCityName = aqiResponse.data.data.city?.name || null;
  }

  // --- Langkah 4: Tentukan nama lokasi final ---
  let finalCityName = place.name || reverse?.name || null;
  let finalCountryName = place.country || reverse?.country || null;

  if (!finalCityName && aqiCityName) {
    const parts = aqiCityName.split(',').map((part) => part.trim());
    finalCityName = parts[0];
    const last = parts[parts.length - 1];
    if (!finalCountryName && parts.length > 1 && Number.isNaN(Number(last))) finalCountryName = last;
  }

  if (!finalCityName && weatherData.resolvedAddress && !isCoordinates(weatherData.resolvedAddress)) {
    const parts = weatherData.resolvedAddress.split(',').map((part) => part.trim());
    finalCityName = parts[0];
    const last = parts[parts.length - 1];
    if (!finalCountryName && parts.length > 1 && Number.isNaN(Number(last))) finalCountryName = last;
  }

  finalCityName = cleanPlaceName(finalCityName) || 'Lokasi Anda';

  // --- Langkah 5: Susun data jam ---
  const days = weatherData.days;
  const hoursToday = days[0].hours || [];
  const hoursAll = [...hoursToday, ...(days[1]?.hours || [])]; // hari ini + besok, untuk "24 jam ke depan"

  return {
    location: { name: finalCityName, country: finalCountryName, lat, lon },
    timezone: weatherData.timezone,
    current: { ...weatherData.currentConditions, aqi: aqiValue },
    hoursToday,
    hoursAll,
    daily: days,
    alerts: weatherData.alerts || [],
  };
};