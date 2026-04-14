import { Link } from 'react-router-dom';
import { IndianRupee, Sprout, Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const soilGuide = [
  { soil: 'Alluvial', crops: 'Wheat, Rice, Sugarcane', region: 'Indo-Gangetic Plains' },
  { soil: 'Black (Regur)', crops: 'Cotton, Soybean, Jowar', region: 'Deccan Plateau' },
  { soil: 'Red & Laterite', crops: 'Groundnut, Millet, Potato', region: 'Southern & Eastern India' },
];

const seedUpdates = [
  { title: 'HD-3226 Wheat Variety', desc: 'Rust-resistant, 20% higher yield. Recommended for Rabi season.', tag: 'New Seed' },
  { title: 'Mandi Price Alert', desc: 'Cotton prices up 5% in Rajkot & Ahmedabad mandis this week.', tag: 'Market Update' },
  { title: 'BG-II Bt Cotton', desc: 'Bollworm-resistant hybrid now available at subsidized rates.', tag: 'New Seed' },
];

export default function InfoCards() {
  const [mandiPrices, setMandiPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mandi')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) { setLoading(false); return; }
        setMandiPrices(data.slice(0, 4).map(item => ({
          crop: item.crop_name,
          price: `₹${item.price}/qtl`,
          trend: '→ 0.0%',
          up: true
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching mandi prices for cards:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Mandi Prices Card */}
        <Link to="/mandi" className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-50 rounded-lg">
                <IndianRupee className="w-4 h-4 text-orange-500" />
              </div>
              <span className="font-bold text-sm text-gray-900">Mandi Prices</span>
            </div>
            <span className="text-[10px] text-farm-green-600 font-medium group-hover:underline flex items-center gap-0.5">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="px-5 py-3 space-y-2.5">
            {loading ? <p className="text-sm text-gray-500">Loading...</p> : mandiPrices.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">{item.crop}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.price}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Link>

        {/* Farming Guidance Card */}
        <Link to="/soil" className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-farm-green-50 rounded-lg">
                <Sprout className="w-4 h-4 text-farm-green-600" />
              </div>
              <span className="font-bold text-sm text-gray-900">Farming Guidance</span>
            </div>
            <span className="text-[10px] text-farm-green-600 font-medium group-hover:underline flex items-center gap-0.5">
              Learn More <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="px-5 py-3 space-y-3">
            {soilGuide.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{item.soil}</span>
                  <span className="text-[10px] text-gray-400">{item.region}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Best for: {item.crops}</p>
              </div>
            ))}
          </div>
        </Link>

        {/* New Seeds & Updates Card */}
        <Link to="/seed" className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <span className="font-bold text-sm text-gray-900">Seeds & Updates</span>
            </div>
            <span className="text-[10px] text-farm-green-600 font-medium group-hover:underline flex items-center gap-0.5">
              More <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="px-5 py-3 space-y-3">
            {seedUpdates.map((item, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.tag === 'New Seed' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {item.tag}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </Link>

      </div>
    </div>
  );
}
