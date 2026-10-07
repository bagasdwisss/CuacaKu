// src/utils/translations.js
// Kunci ditulis huruf kecil. Kondisi gabungan ("Rain, Partially cloudy") dipecah per koma.

const weatherConditions = {
  'clear': 'Cerah',
  'partially cloudy': 'Berawan Sebagian',
  'overcast': 'Mendung',
  'rain': 'Hujan',
  'light rain': 'Hujan Ringan',
  'heavy rain': 'Hujan Lebat',
  'rain showers': 'Hujan Lokal',
  'drizzle': 'Gerimis',
  'light drizzle': 'Gerimis Ringan',
  'heavy drizzle': 'Gerimis Lebat',
  'drizzle/rain': 'Gerimis',
  'light drizzle/rain': 'Gerimis Ringan',
  'heavy drizzle/rain': 'Gerimis Lebat',
  'thunderstorm': 'Badai Petir',
  'thunderstorm without precipitation': 'Petir Tanpa Hujan',
  'lightning without thunder': 'Kilat Tanpa Guntur',
  'precipitation in vicinity': 'Hujan di Sekitar',
  'fog': 'Kabut',
  'freezing fog': 'Kabut Beku',
  'mist': 'Kabut Tipis',
  'smoke or haze': 'Asap atau Kabut Asap',
  'dust storm': 'Badai Debu',
  'squalls': 'Angin Squall',
  'hail': 'Hujan Es',
  'hail showers': 'Hujan Es Lokal',
  'ice': 'Es',
  'snow': 'Salju',
  'light snow': 'Salju Ringan',
  'heavy snow': 'Salju Lebat',
  'snow showers': 'Hujan Salju Lokal',
  'rain and snow': 'Hujan dan Salju',
  'light rain and snow': 'Hujan dan Salju Ringan',
  'heavy rain and snow': 'Hujan dan Salju Lebat',
  'snow and rain showers': 'Salju dan Hujan Lokal',
  'blowing or drifting snow': 'Salju Tertiup Angin',
  'freezing drizzle/freezing rain': 'Gerimis atau Hujan Beku',
  'light freezing rain': 'Hujan Beku Ringan',
  'heavy freezing rain': 'Hujan Beku Lebat',
  'funnel cloud/tornado': 'Angin Puting Beliung',
  'diamond dust': 'Kristal Es',
  'sky coverage decreasing': 'Awan Berkurang',
  'sky coverage increasing': 'Awan Bertambah',
  'sky unchanged': 'Langit Tidak Berubah',
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const translateWeatherCondition = (condition) => {
  if (!condition) return '';
  return condition
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => weatherConditions[part.toLowerCase()] ?? capitalize(part))
    .join(', ');
};