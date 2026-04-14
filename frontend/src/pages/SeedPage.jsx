import { MapPin, Sprout } from 'lucide-react';
import Card from '../components/Card';
import { useState, useEffect } from 'react';

export default function SeedPage() {
  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seeds')
      .then(res => res.json())
      .then(data => {
        setSeeds(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching seeds data:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seed Recommendations</h1>
        <p className="text-gray-500 flex items-center mt-1">
          <MapPin className="w-4 h-4 mr-1 pb-[1px]" />
          Green Valley Farm, Plot A
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Seasonal Suggestions" icon={Sprout}>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 border-b pb-2">Top Recommendations for Your Soil</h3>
            
            {loading ? <p className="text-sm text-gray-500">Loading recommendations...</p> : seeds.map((seed, index) => (
              <div key={index} className={`flex items-start space-x-4 p-4 rounded-lg ${index % 2 === 0 ? 'bg-farm-green-50' : 'bg-yellow-50 border border-yellow-100'}`}>
                <div className={`p-3 rounded-full ${index % 2 === 0 ? 'bg-farm-green-100' : 'bg-yellow-100'}`}>
                  <span className={`font-bold ${index % 2 === 0 ? 'text-farm-green-700' : 'text-yellow-700'}`}>
                    {seed.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{seed.name} - {seed.company}</h4>
                  <p className="text-sm text-gray-600 mt-1">{seed.description}</p>
                  <div className={`mt-2 text-xs font-semibold ${index % 2 === 0 ? 'text-farm-green-600' : 'text-yellow-700'}`}>
                    Yield: {seed.yield_per_acre} Q/Acre | Season: {seed.season}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Sowing Guidelines" icon={Sprout}>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Best Practices</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-farm-green-500"></span>
                <span>Depth: Sow seeds 4-5 cm deep for optimal germination.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-farm-green-500"></span>
                <span>Spacing: Maintain row-to-row spacing of 20-22 cm.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-farm-green-500"></span>
                <span>Treatment: Treat seeds with Trichoderma before sowing.</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
