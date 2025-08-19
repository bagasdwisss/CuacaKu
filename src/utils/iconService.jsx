// src/utils/iconService.jsx
import React from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog, WiNightClear, WiDayCloudy, WiRainMix, WiShowers, WiCloudyGusts, WiDayHaze } from 'react-icons/wi';

export const getWeatherIcon = (iconName) => {
  switch (iconName) {
    case 'partly-cloudy-day': return <WiDayCloudy size={50} />;
    case 'partly-cloudy-night': return <WiNightClear size={50} />;
    case 'rain': return <WiRain size={50} />;
    case 'clear-day': return <WiDaySunny size={50} />;
    case 'clear-night': return <WiNightClear size={50} />;
    case 'cloudy': return <WiCloudy size={50} />;
    case 'snow': return <WiSnow size={50} />;
    case 'fog': return <WiFog size={50} />;
    case 'wind': return <WiCloudyGusts size={50} />;
    case 'showers-day': return <WiDayHaze size={50} />;
    case 'thunder-rain': return <WiThunderstorm size={50} />;
    case 'showers-night': return <WiShowers size={50} />;
    default: return <WiDaySunny size={50} />;
  }
};