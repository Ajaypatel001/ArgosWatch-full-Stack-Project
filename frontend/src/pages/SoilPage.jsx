import { LineChart, Leaf } from 'lucide-react';
import Card from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export default function SoilPage() {
  const [soilData, setSoilData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/soil')
      .then(res => res.json())
      .then(data => {
        setSoilData(data.map(item => ({
          time: item.time,
          moisture: parseFloat(item.moisture),
          ph: parseFloat(item.ph),
          temperature: parseFloat(item.temperature)
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching soil data:', err);
        setLoading(false);
      });
  }, []);

  // Compute current summary values from the latest reading
  const latestReading = soilData.length > 0 ? soilData[soilData.length - 1] : { moisture: 0, temperature: 0, ph: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <LineChart className="w-8 h-8 mr-3 text-farm-green-600" />
          Soil Data Analysis
        </h1>
        <p className="text-gray-500 mt-2">Real-time metrics on your plot's moisture, pH, and temperature.</p>
      </div>
      
      <Card title="Soil Moisture Trends" icon={Leaf}>
        <div className="h-80 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={soilData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="moisture" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-farm-green-50 p-6 rounded-2xl text-center border border-farm-green-100">
            <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-semibold">Moisture</p>
            <p className="text-4xl font-bold text-farm-green-700">{loading ? '-' : `${latestReading.moisture}%`}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-2xl text-center border border-blue-100">
            <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-semibold">Temperature (Depth)</p>
            <p className="text-4xl font-bold text-blue-700">{loading ? '-' : `${latestReading.temperature}°C`}</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-2xl text-center border border-purple-100">
            <p className="text-gray-500 text-sm mb-1 uppercase tracking-wider font-semibold">Soil pH</p>
            <p className="text-4xl font-bold text-purple-700">{loading ? '-' : latestReading.ph}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
