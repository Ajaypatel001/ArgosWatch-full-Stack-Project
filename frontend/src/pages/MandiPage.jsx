import { TrendingUp, MapPin, Search, Filter } from 'lucide-react';
import Card from '../components/Card';
import { useState, useEffect } from 'react';

export default function MandiPage() {
  const [mandiData, setMandiData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMandi = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/mandi?city=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setMandiData(data.map(item => ({
          crop: item.crop_name,
          location: item.location || 'Unknown',
          price: `₹${item.price}/Q`,
          change: '+0.0%', // No change column in new schema
          up: true,
          msg: 'Stable',
          date: new Date(item.date || Date.now()).toLocaleDateString()
        })));
      } catch (err) {
        console.error('Error fetching API:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the search input
    const timer = setTimeout(() => fetchMandi(), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-8 h-8 mr-3 text-farm-green-600" />
            Live Mandi Prices
          </h1>
          <p className="text-gray-500 mt-2">Real-time commodity market rates across major APMCs.</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search location or crop..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" 
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
        </div>
      </div>

      <Card title="Market Rates Repository" icon={TrendingUp}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commodity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Market Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest Price (per Quintal)</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading live prices...</td>
                </tr>
              ) : mandiData.length > 0 ? (
                mandiData.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.crop}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {item.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-800">{item.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${item.up ? 'text-farm-green-600' : 'text-red-500'}`}>
                        {item.change} {item.up ? '▲' : '▼'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${item.up ? 'bg-farm-green-100 text-farm-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.msg}
                      </span>
                      <span className="block text-xs text-gray-400 mt-1">{item.date}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
