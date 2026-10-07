// src/utils/themeService.js
import { isDaytime } from './timeUtils';

// Menentukan tema otomatis (terang saat siang, gelap saat malam) di lokasi yang sedang dilihat
export const getThemeAndBackground = (weatherData) => {
  const theme = isDaytime(weatherData.current) ? 'light' : 'dark';
  return { theme };
};