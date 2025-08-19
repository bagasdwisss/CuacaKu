// src/utils/translations.js

const weatherConditions = {
  'Partially cloudy': 'Berawan Sebagian',
  'Rain, Partially cloudy': 'Hujan, Berawan Sebagian',
  'Rain, Overcast': 'Hujan, Mendung',
  'Rain': 'Hujan',
  'Overcast': 'Mendung',
  'Clear': 'Cerah',
  'Snow': 'Salju',
  'Fog': 'Kabut',
};

export const translateWeatherCondition = (condition) => {
  // Jika ada terjemahan yang pas, gunakan itu
  if (weatherConditions[condition]) {
    return weatherConditions[condition];
  }
  
  // Jika tidak, kembalikan teks aslinya agar tidak error
  // dan ubah huruf pertama menjadi kapital
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};