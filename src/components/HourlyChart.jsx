// src/components/HourlyChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Komponen ini menerima prop bernama 'data'
const HourlyChart = ({ data }) => {
  // Jika data belum ada, jangan render apa-apa untuk mencegah error
  if (!data || data.length === 0) {
    return null;
  }

  // Format data untuk grafik
  const chartData = data.map(hour => ({
    time: hour.datetime.slice(0, 5), // Ambil jam saja, cth: "14:00"
    Suhu: Math.round(hour.temp),
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
      <h3 className="text-xl font-bold mb-4">Grafik Suhu 24 Jam</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(51, 65, 85, 0.8)',
                border: 'none',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#cbd5e1' }}
            />
            <Line type="monotone" dataKey="Suhu" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyChart;