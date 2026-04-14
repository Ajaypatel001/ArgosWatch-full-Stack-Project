import { useState, useEffect } from 'react';
import { TrendingUp, Search, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commodity, setCommodity] = useState('');
  const [market, setMarket] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = '/api/market-history';
      const params = [];
      if (commodity) params.push(`commodity=${encodeURIComponent(commodity)}`);
      if (market) params.push(`market=${encodeURIComponent(market)}`);
      if (params.length > 0) url += '?' + params.join('&');

      const res = await fetch(url);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching market history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  // Group data by commodity for charting

  const chartData = history
    .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
    .map(h => ({
      date: new Date(h.recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price: parseFloat(h.price),
      commodity: h.commodity
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-farm-green-50 rounded-xl border border-farm-green-100">
            <TrendingUp className="w-7 h-7 text-farm-green-600" />
          </div>
          Market Price History
        </h1>
        <p className="text-gray-500 mt-1">Track commodity price trends over time</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by commodity (e.g. Wheat)..." value={commodity}
            onChange={e => setCommodity(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent" />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by market (e.g. Punjab)..." value={market}
            onChange={e => setMarket(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent" />
        </div>
        <button type="submit" className="px-6 py-3 bg-farm-green-600 hover:bg-farm-green-500 text-white rounded-xl font-semibold transition-colors">
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><p className="font-medium">Loading price history...</p></div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No price history found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          {chartData.length > 1 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Price Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={3} dot={{ r: 5, fill: '#22c55e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Commodity</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Market</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.commodity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.market}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-farm-green-600">₹{parseFloat(item.price).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.recorded_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
