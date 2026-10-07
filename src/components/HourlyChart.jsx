// src/components/HourlyChart.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea } from 'recharts';
import { translateWeatherCondition } from '../utils/translations';
import { useSettings } from '../context/settingsContext';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-slate-700/80 dark:bg-slate-800/80 text-white rounded-lg border border-slate-600 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-lg mb-2">{`Jam: ${label}`}</p>
        <p className="text-base">{`Suhu: ${data.Suhu}°${unit} (Terasa ${data.TerasaSeperti}°${unit})`}</p>
        <p className="text-base">{`Peluang Hujan: ${data['Peluang Hujan']}%`}</p>
        <p className="text-base">{`Kondisi: ${data.Kondisi}`}</p>
      </div>
    );
  }
  return null;
};

// hours: 24 jam ke depan (bisa melewati tengah malam), daily: data harian (untuk matahari terbit/terbenam)
const HourlyChart = ({ hours, daily }) => {
  const { tempUnit, convertTemp } = useSettings();
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

  const chartData = hours.map((hour) => ({
    time: hour.datetime.slice(0, 5),
    Suhu: Math.round(convertTemp(hour.temp)),
    TerasaSeperti: Math.round(convertTemp(hour.feelslike)),
    'Peluang Hujan': Math.round(hour.precipprob || 0),
    Kondisi: translateWeatherCondition(hour.conditions),
    night: !isDaylightAt(hour.datetimeEpoch),
  }));

  // Kelompokkan jam-jam malam yang berurutan menjadi area berbayang
  const nightRanges = [];
  let start = null;
  chartData.forEach((d, i) => {
    if (d.night && start === null) start = d.time;
    if (start !== null && (!d.night || i === chartData.length - 1)) {
      nightRanges.push({ x1: start, x2: d.time });
      start = null;
    }
  });

  const temps = chartData.map((d) => d.Suhu);
  const maxTempData = chartData.find((d) => d.Suhu === Math.max(...temps));
  const minTempData = chartData.find((d) => d.Suhu === Math.min(...temps));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Prakiraan 24 Jam ke Depan</h3>
      <div ref={chartRef} style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            onTouchEnd={() => {
              if (chartRef.current) {
                // Memicu event mouseleave secara manual untuk menyembunyikan tooltip di mobile
                const event = new MouseEvent('mouseleave', { bubbles: true });
                chartRef.current.dispatchEvent(event);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="time" interval={xAxisInterval} />
            <YAxis yAxisId="left" unit={`°${tempUnit}`} domain={['dataMin - 2', 'dataMax + 2']} />

            <Tooltip content={<CustomTooltip unit={tempUnit} />} cursor={{ stroke: '#a78bfa', strokeWidth: 1, strokeDasharray: '3 3' }} />

            {nightRanges.map((range) => (
              <ReferenceArea key={range.x1} x1={range.x1} x2={range.x2} yAxisId="left" fill="#2d3748" fillOpacity={0.2} ifOverflow="hidden" />
            ))}

            <Line yAxisId="left" type="monotone" dataKey="Suhu" stroke="#f97316" strokeWidth={3} dot={false} />

            {maxTempData && <ReferenceDot yAxisId="left" x={maxTempData.time} y={maxTempData.Suhu} r={5} fill="#ef4444" stroke="white" />}
            {minTempData && <ReferenceDot yAxisId="left" x={minTempData.time} y={minTempData.Suhu} r={5} fill="#3b82f6" stroke="white" />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;