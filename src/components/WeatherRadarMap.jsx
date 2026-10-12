// src/components/WeatherRadarMap.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPlay, FaPause, FaRedo, FaMapMarkedAlt } from 'react-icons/fa';
import { useSettings } from '../context/settingsContext';

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';
const BASEMAP_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const BASEMAP_DARK = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

const WeatherRadarMap = ({ location }) => {
  const { themeMode } = useSettings();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseLayerRef = useRef(null);
  const radarLayerRef = useRef(null);
  const markerRef = useRef(null);

  const [radarData, setRadarData] = useState(null);
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const lat = location?.lat ?? 3.5952;
  const lon = location?.lon ?? 98.6722;
  const cityName = location?.name || 'Lokasi';

  // 1. Ambil data radar frame dari RainViewer
  const fetchRadarData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(RAINVIEWER_API);
      if (res.data && res.data.radar) {
        const past = res.data.radar.past || [];
        const nowcast = res.data.radar.nowcast || [];
        const allFrames = [...past, ...nowcast];

        setRadarData(res.data);
        setFrames(allFrames);
        setCurrentFrameIndex(past.length > 0 ? past.length - 1 : 0); // Default ke frame terkini
      }
    } catch (err) {
      console.error('Gagal memuat radar cuaca:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRadarData();
  }, [fetchRadarData]);

  // 2. Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const isDark = themeMode === 'dark' || document.documentElement.classList.contains('dark');
    const basemapUrl = isDark ? BASEMAP_DARK : BASEMAP_LIGHT;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 6,
        minZoom: 3,
        maxZoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      const baseLayer = L.tileLayer(basemapUrl, {
        maxZoom: 18,
        subdomains: isDark ? [] : 'abc',
      }).addTo(map);
      baseLayerRef.current = baseLayer;

      // Custom Glowing User Marker
      const pinIcon = L.divIcon({
        className: 'custom-radar-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
            <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lon], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`<b>${cityName}</b><br/>Pusat Lokasi Anda`).openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      // Update basemap jika tema berganti
      if (baseLayerRef.current) {
        mapInstanceRef.current.removeLayer(baseLayerRef.current);
      }
      const newBase = L.tileLayer(basemapUrl, {
        maxZoom: 18,
        subdomains: isDark ? [] : 'abc',
      }).addTo(mapInstanceRef.current);
      baseLayerRef.current = newBase;

      // Pan ke lokasi baru jika koordinat berubah
      mapInstanceRef.current.setView([lat, lon], 6);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.setPopupContent(`<b>${cityName}</b><br/>Pusat Lokasi Anda`);
      }
    }

    return () => {
      // Cleanup saat unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        baseLayerRef.current = null;
      }
    };
  }, [lat, lon, cityName, themeMode]);

  // 3. Update layer radar saat frame aktif berubah
  useEffect(() => {
    if (!mapInstanceRef.current || !radarData || !frames.length) return;

    const currentFrame = frames[currentFrameIndex];
    if (!currentFrame) return;

    const tileUrl = `${radarData.host}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

    if (radarLayerRef.current) {
      mapInstanceRef.current.removeLayer(radarLayerRef.current);
    }

    const newLayer = L.tileLayer(tileUrl, {
      opacity: 0.75,
      zIndex: 100,
      maxNativeZoom: 7,
      maxZoom: 11,
    });

    newLayer.addTo(mapInstanceRef.current);
    radarLayerRef.current = newLayer;
  }, [currentFrameIndex, frames, radarData]);

  // 4. Timer Animasi Play / Pause
  useEffect(() => {
    let interval = null;
    if (isPlaying && frames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
      }, 750);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, frames.length]);

  // Format label waktu frame
  const currentTimestamp = frames[currentFrameIndex]?.time;
  const formattedFrameTime = currentTimestamp
    ? new Date(currentTimestamp * 1000).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '–';

  const isNowcast = radarData?.radar?.past?.length
    ? currentFrameIndex >= radarData.radar.past.length
    : false;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/20 dark:text-cyan-300">
            <FaMapMarkedAlt size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Peta Radar Hujan & Cuaca (Live)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pergerakan awan dan intensitas presipitasi real-time di sekitar {cityName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRadarData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <FaRedo className={loading ? 'animate-spin' : ''} />
          Perbarui Radar
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Overlay Kontrol Pemutar Radar */}
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-[400] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-xl border border-white/40 dark:border-gray-700 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition-colors"
            >
              {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
              {isPlaying ? 'Jeda' : 'Putar'}
            </button>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {formattedFrameTime} WIB
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isNowcast
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                }`}
              >
                {isNowcast ? 'Prediksi' : 'Terekam'}
              </span>
            </div>
          </div>

          {/* Slider Timeline */}
          {frames.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-64">
              <input
                type="range"
                min="0"
                max={frames.length - 1}
                value={currentFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrameIndex(Number(e.target.value));
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          )}

          {/* Legenda Intensitas Hujan */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
            <span>Ringan</span>
            <div className="flex h-2.5 w-20 rounded-full overflow-hidden">
              <span className="w-1/4 bg-blue-300"></span>
              <span className="w-1/4 bg-emerald-400"></span>
              <span className="w-1/4 bg-amber-400"></span>
              <span className="w-1/4 bg-red-500"></span>
            </div>
            <span>Lebat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherRadarMap;
