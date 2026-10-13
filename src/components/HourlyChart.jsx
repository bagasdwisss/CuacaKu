// src/components/HourlyChart.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceArea,
} from 'recharts';
import { FiTrendingUp, FiCloudRain } from 'react-icons/fi';
import { translateWeatherCondition } from '../utils/translations';
import { useSettings } from '../context/settingsContext';

const CustomTooltip = ({ active, payload, label, unit, mode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 sm:p-4 bg-slate-900/95 text-white rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl text-xs sm:text-sm">
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-white/10 font-bold">
          <span className="text-amber-400">Pukul {label}</span>
          <span className="text-white/70 font-normal">{data.Kondisi}</span>
        </div>
        <div className="space-y-1">
          <p className="flex justify-between gap-4 font-semibold">
            <span>Suhu:</span>
            <span className="text-orange-400 font-bold">{data.Suhu}°{unit} (Terasa {data.TerasaSeperti}°{unit})</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-white/80">Peluang Hujan:</span>
            <span className="text-sky-400 font-bold">{data['Peluang Hujan']}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const HourlyChart = ({ hours, daily }) => {
  const { tempUnit, convertTemp } = useSettings();
  const [activeTab, setActiveTab] = useState('temp'); // 'temp' | 'rain'
  const [xAxisInterval, setXAxisInterval] = useState(2);
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setXAxisInterval(window.innerWidth < 640 ? 4 : 2);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!hours || hours.length === 0 || !daily) return null;

  const isDaylightAt = (epoch) => daily.slice(0, 2).some((d) => epoch >= d.sunriseEpoch && epoch < d.sunsetEpoch);

  const chartData = useMemo(() => {
    return hours.map((hour) => ({
      time: hour.datetime.slice(0, 5),
      Suhu: Math.round(convertTemp(hour.temp)),
      TerasaSeperti: Math.round(convertTemp(hour.feelslike)),
      'Peluang Hujan': Math.round(hour.precipprob || 0),
      Kondisi: translateWeatherCondition(hour.conditions),
      night: !isDaylightAt(hour.datetimeEpoch),
    }));
  }, [hours, daily, convertTemp]);

  // Kelompokkan area malam
  const nightRanges = useMemo(() => {
    const ranges = [];
    let start = null;
    chartData.forEach((d, i) => {
      if (d.night && start === null) start = d.time;
      if (start !== null && (!d.night || i === chartData.length - 1)) {
        ranges.push({ x1: start, x2: d.time });
        start = null;
      }
    });
    return ranges;
  }, [chartData]);

  const temps = chartData.map((d) => d.Suhu);
  const maxTempData = chartData.find((d) => d.Suhu === Math.max(...temps));
  const minTempData = chartData.find((d) => d.Suhu === Math.min(...temps));

  return (
    <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700/60 mb-8 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Prakiraan 24 Jam ke Depan
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tren suhu & potensi hujan jam demi jam
          </p>
        </div>

        {/* Tab Toggle Segmen Apple-style */}
        <div className="flex bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'temp'
                ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <FiTrendingUp size={14} />
            <span>Tren Suhu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rain'
                ? 'bg-white dark:bg-gray-800 text-blue-500 shadow-sm font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <FiCloudRain size={14} />
            <span>Peluang Hujan</span>
          </button>
        </div>
      </div>

      <div ref={chartRef} className="w-full h-[260px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
            onTouchEnd={() => {
              if (chartRef.current) {
                const event = new MouseEvent('mouseleave', { bubbles: true });
                chartRef.current.dispatchEvent(event);
              }
            }}
          >
            <defs>
              {/* Gradient Suhu (Warm Sunrise Orange) */}
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
              {/* Gradient Hujan (Cool Sky Blue) */}
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.15} />
            <XAxis
              dataKey="time"
              interval={xAxisInterval}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              unit={activeTab === 'temp' ? `°${tempUnit}` : '%'}
              domain={activeTab === 'temp' ? ['dataMin - 2', 'dataMax + 2'] : [0, 100]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              content={<CustomTooltip unit={tempUnit} mode={activeTab} />}
              cursor={{ stroke: activeTab === 'temp' ? '#f97316' : '#3b82f6', strokeWidth: 1.5, strokeDasharray: '3 3' }}
            />

            {/* Wilayah Malam Hari */}
            {nightRanges.map((range) => (
              <ReferenceArea
                key={range.x1}
                x1={range.x1}
                x2={range.x2}
                fill="#334155"
                fillOpacity={0.15}
                ifOverflow="hidden"
              />
            ))}

            {activeTab === 'temp' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="Suhu"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
                {maxTempData && (
                  <ReferenceDot
                    x={maxTempData.time}
                    y={maxTempData.Suhu}
                    r={5}
                    fill="#ea580c"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
                {minTempData && (
                  <ReferenceDot
                    x={minTempData.time}
                    y={minTempData.Suhu}
                    r={5}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="Peluang Hujan"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#rainGradient)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;