import { 
  CloudSun, 
  Droplets, 
  MapPin, 
  ThermometerSun, 
  Sprout, 
  LineChart, 
  Cpu,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as ReChartsLineChart,
  Line,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();

  const [soilDataState, setSoilDataState] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [irrigationData, setIrrigationData] = useState(null);
  const [mandiPrices, setMandiPrices] = useState([]);
  const [seedsData, setSeedsData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState({ title: 'AI Advice', message: 'Loading advice...' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch user data for location/crop
        const userRes = await fetch('/api/auth/me');
        const user = await userRes.json();
        setUserData(user);

        // Fetch soil trends
        const soilRes = await fetch('/api/soil');
        const soil = await soilRes.json();
        setSoilDataState(soil.map(item => ({
             time: new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             moisture: parseFloat(item.moisture),
             ph: parseFloat(item.ph)
        })));

        // Fetch weather
        const locationQuery = user.location || 'New Delhi';
        const weatherRes = await fetch(`/api/weather?location=${encodeURIComponent(locationQuery)}`);
        const weather = await weatherRes.json();
        setWeatherData(weather[0]);

        // Fetch irrigation
        const irrigationRes = await fetch('/api/irrigation');
        const irrigation = await irrigationRes.json();
        setIrrigationData(irrigation[0]);

        // Fetch seeds
        const seedsRes = await fetch('/api/seeds');
        const seeds = await seedsRes.json();
        setSeedsData(seeds);

        // Fetch mandi
        const mandiRes = await fetch('/api/mandi');
        const mandi = await mandiRes.json();
        setMandiPrices(mandi.slice(0, 5));

        // Fetch AI Advice
        try {
          const aiRes = await fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Give me some farming advice based on my dashboard data.' })
          });
          const aiData = await aiRes.json();
          setAiAdvice({
            title: 'AI Insights',
            message: aiData.botReply || 'Keep monitoring your soil moisture for optimal growth.'
          });
        } catch (aiErr) {
          console.error('Error fetching AI advice:', aiErr);
          setAiAdvice({
            title: 'AI Insights',
            message: 'Check soil moisture and upcoming weather for better yield.'
          });
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const latestSoil = soilDataState.length > 0 ? soilDataState[soilDataState.length - 1] : { moisture: 0, ph: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Farm Overview</h2>
          <p className="text-gray-500 flex items-center mt-1">
            <MapPin className="w-4 h-4 mr-1 pb-[1px]" />
            {userData ? `${userData.location || 'Your Farm'} (${userData.primary_crop || 'Active Plot'})` : 'Loading farm details...'}
          </p>
        </div>
        <button className="flex items-center space-x-2 text-farm-green-600 bg-farm-green-50 px-4 py-2 rounded-lg font-medium hover:bg-farm-green-100 transition-colors border border-farm-green-100 shadow-sm">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Soil & Weather Row */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Soil Moisture & pH Trends" 
            icon={LineChart} 
            onClick={() => navigate('/soil')}
            bgImage="https://images.unsplash.com/photo-1592982537447-6f23f1b46571?q=80&w=1000"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={soilDataState} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="moisture" name="Moisture %" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
                  <Area type="monotone" dataKey="ph" name="Soil pH" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPH)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-farm-green-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 text-sm mb-1">Avg Moisture</p>
                <p className="text-2xl font-bold text-farm-green-700">{loading ? '--' : `${latestSoil.moisture}%`}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 text-sm mb-1">Temperature</p>
                <p className="text-2xl font-bold text-blue-700">{loading ? '--' : `${weatherData?.temperature || '24'}°C`}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 text-sm mb-1">Soil pH</p>
                <p className="text-2xl font-bold text-purple-700">{loading ? '--' : latestSoil.ph}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              title="Weather Forecast" 
              icon={CloudSun} 
              onClick={() => navigate('/weather')}
              bgImage="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1000"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CloudSun className="w-12 h-12 text-blue-500" />
                  <div>
                    <h4 className="text-3xl font-bold text-gray-800">{loading ? '--' : `${weatherData?.temperature || '24'}°C`}</h4>
                    <p className="text-gray-500">{loading ? 'Loading...' : weatherData?.condition_text || 'Partly Cloudy'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Humidity: {loading ? '--' : `${weatherData?.humidity || '65'}%`}</p>
                  <p className="text-sm text-gray-500">Wind: {loading ? '--' : `${weatherData?.wind_speed || '12'} km/h`}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="h-24 w-full mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsLineChart data={loading ? [] : Array.isArray(weatherData) ? weatherData : [weatherData]}>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Temp" />
                    </ReChartsLineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between space-x-1">
                  {(Array.isArray(weatherData) ? weatherData.slice(0, 5) : [{day: 'Today', temperature: weatherData?.temperature || 24}]).map((item, i) => (
                    <div key={i} className="text-center flex-1">
                      <p className="text-[10px] text-gray-400 mb-0.5">{item.day.substring(0, 3)}</p>
                      <CloudSun className="w-4 h-4 mx-auto text-blue-400 mb-0.5" />
                      <p className="text-xs font-semibold">{item.temperature}°</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card 
              title="Irrigation Suggestion" 
              icon={Droplets} 
              className="bg-gradient-to-br from-blue-50 to-white" 
              onClick={() => navigate('/irrigation')}
              bgImage="https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">ACTION NEEDED</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{loading ? 'Loading...' : (irrigationData ? `Next: ${new Date(irrigationData.next_irrigation).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'No schedule')}</h4>
                  <p className="text-gray-600 text-sm">{loading ? '...' : (irrigationData ? `Plot: ${irrigationData.plot_name}. Status: ${irrigationData.status}.` : 'Soil moisture is optimal.')}</p>
                </div>
                <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors">
                  Start Sprinklers
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          <Card 
            title="AI Advice" 
            icon={Cpu} 
            className="border-farm-green-200 shadow-farm-green-100 shadow-md" 
            onClick={() => navigate('/chatbot')}
            bgImage="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000"
          >
            <div className="space-y-4">
              <div className="bg-farm-green-50 p-4 rounded-xl border border-farm-green-100">
                <h5 className="font-semibold text-farm-green-800 mb-1">{aiAdvice.title}</h5>
                <p className="text-sm text-farm-green-700">{aiAdvice.message}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h5 className="font-semibold text-orange-800 mb-1">Harvest Window</h5>
                <p className="text-sm text-orange-700">Optimal harvest time is approaching soon based on current conditions.</p>
              </div>
            </div>
          </Card>

          <Card 
            title="Seed Recommendation" 
            icon={Sprout} 
            onClick={() => navigate('/seed')}
            bgImage="https://images.unsplash.com/photo-1595822527011-06788b770af0?q=80&w=1000"
          >
            <div className="space-y-4">
              {loading ? <p className="text-xs text-gray-500">Loading seeds...</p> : seedsData.slice(0, 3).map((seed, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className={`h-10 w-10 min-w-[40px] rounded-full flex items-center justify-center ${i === 0 ? 'bg-farm-green-100' : i === 1 ? 'bg-yellow-100' : 'bg-orange-100'}`}>
                    <span className={`font-bold ${i === 0 ? 'text-farm-green-700' : i === 1 ? 'text-yellow-700' : 'text-orange-700'}`}>
                      {seed.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800">{seed.name} - {seed.company}</h5>
                    <p className="text-xs text-gray-500">{seed.description.length > 50 ? seed.description.substring(0, 50) + '...' : seed.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card 
            title="Mandi Prices (Live Ratings)" 
            icon={TrendingUp} 
            onClick={() => navigate('/mandi')}
            bgImage="https://images.unsplash.com/photo-1488459739036-79efaa21bab0?q=80&w=1000"
          >
            <div className="h-40 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mandiPrices} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="crop_name" hide />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="price" name="Price/Q">
                    {mandiPrices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#22c55e' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {loading ? <p className="text-xs text-gray-500 text-center">Loading prices...</p> : mandiPrices.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                  <div>
                    <span className="block font-medium text-gray-700">{item.crop_name}</span>
                    <span className="text-xs text-gray-400 font-medium flex items-center mt-0.5 whitespace-nowrap"><MapPin className="w-3 h-3 mr-0.5"/> {item.location}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold text-gray-800">₹{item.price}/Q</span>
                    <div className="flex items-center justify-end space-x-2 mt-0.5">
                      <span className="text-xs text-gray-400">Fixed Rate</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-farm-green-600 font-medium hover:text-farm-green-700">View Full Market →</button>
          </Card>
        </div>
      </div>
    </div>
  );
}
