import { CloudSun, CloudRain, Wind, Thermometer, Sunrise, Sunset, Search } from 'lucide-react';
import Card from '../components/Card';
import { useState, useEffect } from 'react';

export default function WeatherPage() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.location) setSearchQuery(data.location);
        else setSearchQuery('New Delhi');
      })
      .catch(() => setSearchQuery('New Delhi'))
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/weather?location=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Location not found');
        const data = await res.json();
        setForecasts(data);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setForecasts([]);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => fetchWeather(), 600);
    return () => clearTimeout(timer);
  }, [searchQuery, isReady]);
  const current = forecasts.length > 0 ? forecasts[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CloudSun className="w-8 h-8 mr-3 text-blue-500" />
            Weather Forecast
          </h1>
          <p className="text-gray-500 mt-2">Get hyper-local conditions tailored for your farm.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search your city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Current Conditions" icon={CloudSun}>
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <CloudSun className="w-24 h-24 text-blue-500" />
                <div>
                  <h4 className="text-6xl font-black text-gray-800 tracking-tighter">{loading ? '--' : current?.temperature || '--'}°C</h4>
                  <p className="text-xl font-medium text-gray-600 mt-2">{loading ? 'Loading...' : current?.location ? `Weather in ${current.location}` : 'Location Not Found'}</p>
                  <p className="text-gray-500 text-sm mt-1">{loading ? '--' : current?.condition_text || 'Please search another city'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex flex-col">
                  <span className="text-sm flex items-center text-gray-500 mb-1"><Thermometer className="w-4 h-4 mr-1"/> Humidity</span>
                  <span className="font-semibold text-lg">{loading ? '--' : current?.humidity}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm flex items-center text-gray-500 mb-1"><Wind className="w-4 h-4 mr-1"/> Wind</span>
                  <span className="font-semibold text-lg">{loading ? '--' : current?.wind_speed} km/h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm flex items-center text-gray-500 mb-1"><Sunrise className="w-4 h-4 mr-1"/> Sunrise</span>
                  <span className="font-semibold text-lg">06:24 AM</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm flex items-center text-gray-500 mb-1"><Sunset className="w-4 h-4 mr-1"/> Sunset</span>
                  <span className="font-semibold text-lg">06:45 PM</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title="Precipitation Probability" icon={CloudRain}>
             <div className="space-y-4">
               {loading ? <p className="text-sm text-gray-500">Loading forecast...</p> : forecasts.map((item, i) => (
                 <div key={i} className="flex justify-between items-center">
                   <span className="font-medium text-gray-700 w-24">{item.day}</span>
                   <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className={`h-full ${item.precip_prob > 50 ? 'bg-blue-500' : 'bg-blue-300'}`} style={{ width: `${item.precip_prob}%` }}></div>
                   </div>
                   <span className="text-sm font-bold text-gray-600 w-8 text-right">{item.precip_prob}%</span>
                 </div>
               ))}
               {forecasts.some(f => f.precip_prob > 50) ? (
                 <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                   <p className="text-sm text-yellow-800">
                     <strong>Note:</strong> High chance of rain expected on {forecasts.find(f => f.precip_prob > 50)?.day}. Consider delaying major field activities.
                   </p>
                 </div>
               ) : (
                 <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                   <p className="text-sm text-green-800">
                     <strong>Note:</strong> Weather looks clear for the next few days. Ideal for spraying and harvesting.
                   </p>
                 </div>
               )}

             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
