// src/components/WeatherRadarMap.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaMapMarkedAlt,
  FaCrosshairs,
  FaStepBackward,
  FaStepForward,
} from 'react-icons/fa';
import { useSettings } from '../context/settingsContext';

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';
const BASEMAP_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const BASEMAP_DARK = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

const SPEEDS = [
  { label: '0.5x', delay: 1000 },
  { label: '1x', delay: 650 },
  { label: '1.5x', delay: 420 },
];

const WeatherRadarMap = ({ location }) => {
  const { themeMode } = useSettings();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseLayerRef = useRef(null);
  const markerRef = useRef(null);
  const radarLayersMapRef = useRef(new Map());

  const [radarData, setRadarData] = useState(null);
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1x (650ms)

  const lat = location?.lat ?? 3.5952;
  const lon = location?.lon ?? 98.6722;
  const cityName = location?.name || 'Lokasi Anda';

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
        setCurrentFrameIndex(past.length > 0 ? past.length - 1 : 0);
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

  // 2. Inisialisasi Peta Leaflet & Pane Khusus Radar
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
        zoomControl: false, // Diganti dengan tombol kustom yang lebih elegan
        attributionControl: false,
      });

      // Buat pane khusus untuk radar agar memiliki transisi CSS crossfade
      if (!map.getPane('radarPane')) {
        const pane = map.createPane('radarPane');
        pane.style.zIndex = '400';
      }

      const baseLayer = L.tileLayer(basemapUrl, {
        maxZoom: 18,
        subdomains: isDark ? [] : 'abc',
      }).addTo(map);
      baseLayerRef.current = baseLayer;

      // Custom Glowing User Pin
      const pinIcon = L.divIcon({
        className: 'custom-radar-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background: rgba(59, 130, 246, 0.45); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.35);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lon], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`<b>${cityName}</b><br/>Pusat Pantauan`).openPopup();

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

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
      mapInstanceRef.current.invalidateSize();
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.setPopupContent(`<b>${cityName}</b><br/>Pusat Pantauan`);
      }
    }

    const handleWindowResize = () => {
      mapInstanceRef.current?.invalidateSize();
    };
    window.addEventListener('resize', handleWindowResize);

    const layersMap = radarLayersMapRef.current;
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        baseLayerRef.current = null;
        layersMap.clear();
      }
    };
  }, [lat, lon, cityName, themeMode]);

  // 3. Preload Semua Frame Radar ke dalam Map (Mencegah Lag & Berkedip)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !radarData || !frames.length) return;

    // Bersihkan layer lama yang tidak ada di frames baru
    const currentPaths = new Set(frames.map((f) => f.path));
    radarLayersMapRef.current.forEach((layer, path) => {
      if (!currentPaths.has(path)) {
        map.removeLayer(layer);
        radarLayersMapRef.current.delete(path);
      }
    });

    // Daftarkan layer untuk setiap frame dengan opacity awal 0
    frames.forEach((frame) => {
      if (!radarLayersMapRef.current.has(frame.path)) {
        const tileUrl = `${radarData.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        const layer = L.tileLayer(tileUrl, {
          pane: 'radarPane',
          opacity: 0,
          maxNativeZoom: 7,
          maxZoom: 11,
          keepBuffer: 6,
        });
        layer.addTo(map);
        radarLayersMapRef.current.set(frame.path, layer);
      }
    });
  }, [frames, radarData]);

  // 4. Update Opacity dengan Transisi Halus (Smooth Crossfade)
  useEffect(() => {
    if (!frames.length) return;

    frames.forEach((frame, idx) => {
      const layer = radarLayersMapRef.current.get(frame.path);
      if (layer) {
        if (idx === currentFrameIndex) {
          layer.setOpacity(0.82); // Frame aktif memudar masuk secara halus
        } else {
          layer.setOpacity(0);    // Frame lain memudar keluar
        }
      }
    });
  }, [currentFrameIndex, frames]);

  // 5. Timer Pemutaran Animasi Halus
  useEffect(() => {
    let interval = null;
    if (isPlaying && frames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
      }, SPEEDS[speedIndex].delay);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, frames.length, speedIndex]);

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

  const handleStep = (direction) => {
    setIsPlaying(false);
    if (direction === 'prev') {
      setCurrentFrameIndex((prev) => (prev - 1 + frames.length) % frames.length);
    } else {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 6, { duration: 1.2 });
    }
  };

  const toggleSpeed = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEEDS.length);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 transition-all duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20">
            <FaMapMarkedAlt size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Peta Radar Hujan & Cuaca (Live)
              </h3>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                LIVE
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pergerakan awan dan intensitas hujan presisi di sekitar {cityName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchRadarData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/80 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-all shadow-sm active:scale-95"
        >
          <FaRedo className={loading ? 'animate-spin' : ''} />
          Perbarui Data
        </button>
      </div>

      {/* Map Container dengan Efek Glassmorphic & Rounded Elegan */}
      <div
        className="relative w-full h-[460px] sm:h-[440px] rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-700 shadow-inner"
        style={{ minHeight: '420px' }}
      >
        <div ref={mapContainerRef} className="w-full h-full z-10" style={{ minHeight: '420px' }} />

        {/* Tombol Melayang: Pusatkan ke Lokasi */}
        <button
          type="button"
          onClick={handleRecenter}
          title="Pusatkan ke lokasi saya"
          className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 dark:bg-gray-900/90 text-blue-600 dark:text-blue-400 shadow-lg backdrop-blur-md border border-white/50 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
        >
          <FaCrosshairs size={13} />
          <span>Lokasi Saya</span>
        </button>

        {/* Floating Glassmorphic Player Controller */}
        <div className="absolute bottom-2.5 inset-x-2 sm:bottom-3 sm:inset-x-6 z-[400] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-2.5 sm:p-4 rounded-2xl border border-white/60 dark:border-gray-700/70 shadow-2xl flex flex-col gap-2.5 sm:gap-3">
          {/* Baris Atas: Tombol Putar, Waktu, & Pengatur Kecepatan */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => handleStep('prev')}
                title="Frame Sebelumnya"
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <FaStepBackward size={10} />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all text-xs"
              >
                {isPlaying ? <FaPause size={11} /> : <FaPlay size={11} />}
                <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStep('next')}
                title="Frame Berikutnya"
                className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <FaStepForward size={10} />
              </button>

              <button
                type="button"
                onClick={toggleSpeed}
                title="Ubah Kecepatan Putar"
                className="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[11px] sm:text-xs border border-gray-200 dark:border-gray-700 transition-colors"
              >
                {SPEEDS[speedIndex].label}
              </button>
            </div>

            {/* Waktu Frame & Status Live / Prediksi */}
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-gray-800 dark:text-gray-100 font-mono tracking-tight">
                {formattedFrameTime} WIB
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${
                  isNowcast
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {isNowcast ? 'Prediksi' : 'Terekam'}
              </span>
            </div>
          </div>

          {/* Baris Bawah: Timeline Scrubber & Legenda Warna */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            {frames.length > 0 && (
              <div className="w-full flex-grow relative">
                <input
                  type="range"
                  min="0"
                  max={frames.length - 1}
                  value={currentFrameIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentFrameIndex(Number(e.target.value));
                  }}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none"
                />
              </div>
            )}

            {/* Legenda Intensitas Presipitasi */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              <span>Gerimis</span>
              <div className="flex h-2.5 w-20 sm:w-24 rounded-full overflow-hidden shadow-inner">
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
    </div>
  );
};

export default WeatherRadarMap;
