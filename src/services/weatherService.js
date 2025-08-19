// src/services/weatherService.js
import axios from 'axios';

const API_KEY = import.meta.env.VITE_VISUALCROSSING_API_KEY;
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';

export const getWeatherData = async (location) => {
  const url = `${BASE_URL}${encodeURIComponent(location)}?unitGroup=metric&include=hours,current,alerts&key=${API_KEY}&contentType=json`;
  
  const response = await axios.get(url);
  const data = response.data;

  // ===== LOGIKA LOKASI VERSI FINAL & PALING TANGGUH =====
  const addressParts = data.resolvedAddress.split(',').map(part => part.trim());
  const cityName = addressParts[0];
  const countryName = addressParts.length > 1 ? addressParts[addressParts.length - 1] : '';

  return {
    location: {
      name: cityName,
      country: countryName,
    },
    // Menambahkan timezone untuk perbaikan jam
    timezone: data.timezone,
    current: {
      ...data.currentConditions,
      temp: data.currentConditions.temp,
      humidity: data.currentConditions.humidity,
      wind_speed: data.currentConditions.windspeed,
      uvi: data.currentConditions.uvindex,
      weather: [{ 
        description: data.currentConditions.conditions,
        icon: data.currentConditions.icon 
      }],
      dt: data.currentConditions.datetimeEpoch,
      sunrise: data.currentConditions.sunriseEpoch,
      sunset: data.currentConditions.sunsetEpoch,
    },
    hourly: data.days[0].hours,
    daily: data.days,
    alerts: data.alerts || [],
    air_quality: {
      main: { aqi: data.currentConditions.aqi }
    },
  };
};