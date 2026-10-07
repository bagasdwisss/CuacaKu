// src/utils/themeService.js

// Fungsi ini sekarang HANYA menentukan tema terang atau gelap
export const getThemeAndBackground = (weatherData) => {
  const { current, timezone } = weatherData;
  const now = new Date();
  
  const localTimeHour = parseInt(now.toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const sunriseHour = parseInt(new Date(current.sunriseEpoch * 1000).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  const sunsetHour = parseInt(new Date(current.sunsetEpoch * 1000).toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', hour12: false }));
  
  const isDay = localTimeHour >= sunriseHour && localTimeHour < sunsetHour;
  const theme = isDay ? 'light' : 'dark';

  // Kita tidak lagi mengembalikan backgroundClass dari sini
  return { theme };
};