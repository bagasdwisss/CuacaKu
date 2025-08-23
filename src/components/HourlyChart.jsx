// src/components/HourlyChart.jsx
import React, { useState, useEffect } from 'react'; // PERUBAHAN 1: Menambahkan useState dan useEffect
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceArea } from 'recharts';
import { translateWeatherCondition } from '../utils/translations';

// Custom Tooltip tidak diubah, karena sudah menampilkan data peluang hujan
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-slate-700/80 dark:bg-slate-800/80 text-white rounded-lg border border-slate-600 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-lg mb-2">{`Jam: ${label}`}</p>
        <p className="text-base">{`Suhu: ${data.Suhu}°C (Terasa ${data.TerasaSeperti}°C)`}</p>
        <p className="text-base">{`Peluang Hujan: ${data['Peluang Hujan']}%`}</p>
        <p className="text-base">{`Kondisi: ${data.Kondisi}`}</p>
      </div>
    );
  }
  return null;
};

const HourlyChart = ({ data, dayData }) => {
  // PERUBAHAN 2: Menambahkan state untuk interval sumbu-X yang dinamis
  const [xAxisInterval, setXAxisInterval] = useState(2);

  // PERUBAHAN 3: Menambahkan logika untuk mendeteksi ukuran layar
  useEffect(() => {
    const handleResize = () => {
      // Jika lebar layar di bawah 640px (standar HP)
      if (window.innerWidth < 640) {
        setXAxisInterval(4); // Tampilkan label setiap 5 jam
      } else {
        setXAxisInterval(2); // Tampilkan label setiap 3 jam di layar lebih besar
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Panggil saat komponen pertama kali dimuat

    // Membersihkan event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!data || data.length === 0 || !dayData) {
    return null;
  }

  // Logika pemrosesan data tidak diubah, agar data hujan tetap ada untuk tooltip
  const next24HoursData = data.slice(0, 24);
  const chartData = next24HoursData.map(hour => ({
    time: hour.datetime.slice(0, 5),
    Suhu: Math.round(hour.temp),
    'Peluang Hujan': Math.round(hour.precipprob),
    TerasaSeperti: Math.round(hour.feelslike),
    Kondisi: translateWeatherCondition(hour.conditions),
  }));

  // Semua logika cerdas Anda (min/max temp, sunrise/sunset) dipertahankan
  const { minTemp, maxTemp } = next24HoursData.reduce((acc, hour) => ({
      minTemp: Math.min(acc.minTemp, hour.temp),
      maxTemp: Math.max(acc.maxTemp, hour.temp),
    }), { minTemp: Infinity, maxTemp: -Infinity }
  );
  const minTempData = chartData.find(d => d.Suhu === Math.round(minTemp));
  const maxTempData = chartData.find(d => d.Suhu === Math.round(maxTemp));
  const sunriseTime = dayData.sunrise.slice(0, 5);
  const sunsetTime = dayData.sunset.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Prakiraan 24 Jam ke Depan</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            {/* PERUBAHAN 4: Menerapkan interval dinamis untuk responsivitas */}
            <XAxis dataKey="time" interval={xAxisInterval} />
            <YAxis yAxisId="left" unit="°C" domain={['dataMin - 2', 'dataMax + 2']} />
            
            {/* PERUBAHAN 5: Sumbu-Y untuk hujan dihapus */}
            {/* <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 100]} /> */}
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Latar belakang malam hari dipertahankan */}
            <ReferenceArea x1={sunsetTime} x2={chartData[23].time} yAxisId="left" fill="#2d3748" fillOpacity={0.2} ifOverflow="hidden" />
            <ReferenceArea x1={chartData[0].time} x2={sunriseTime} yAxisId="left" fill="#2d3748" fillOpacity={0.2} ifOverflow="hidden" />

            {/* PERUBAHAN 6: Visual Bar Chart untuk hujan dihapus */}
            {/* <Bar yAxisId="right" dataKey="Peluang Hujan" barSize={20} fill="#3b82f6" fillOpacity={0.5} /> */}
            <Line yAxisId="left" type="monotone" dataKey="Suhu" stroke="#f97316" strokeWidth={3} dot={false} />

            {/* Penanda suhu min/maks dipertahankan */}
            {maxTempData && <ReferenceDot yAxisId="left" x={maxTempData.time} y={maxTempData.Suhu} r={5} fill="#ef4444" stroke="white" />}
            {minTempData && <ReferenceDot yAxisId="left" x={minTempData.time} y={minTempData.Suhu} r={5} fill="#3b82f6" stroke="white" />}

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;