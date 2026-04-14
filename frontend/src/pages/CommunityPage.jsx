import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Wheat, UserPlus, UserCheck, MessageCircle, Search } from 'lucide-react';

export default function CommunityPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/farmers');
        const data = await res.json();
        setFarmers(data.map(f => ({
          ...f,
          isFollowing: false // Default to false, can be updated if we fetch follow status
        })));
      } catch (err) {
        console.error('Error fetching farmers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  const toggleFollow = async (id) => {
    try {
      const res = await fetch(`/api/farmers/${id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      setFarmers(prev => prev.map(farmer => 
        farmer.id === id ? { ...farmer, isFollowing: data.isFollowing } : farmer
      ));
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const filteredFarmers = (farmers || []).filter(farmer => 
    (farmer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farmer.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (farmer.primary_crop || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Farmer Community</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with other farmers across the country. Share knowledge, track trends, and grow together.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-10 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500 sm:text-sm shadow-sm transition-shadow"
          placeholder="Search farmers by name, location, or crop..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Loading community members...
          </div>
        ) : filteredFarmers.map((farmer) => (
          <div key={farmer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-32 bg-farm-green-100 flex items-center justify-center relative overflow-hidden">
              <img src={farmer.image_url || 'https://images.unsplash.com/photo-1595822527011-06788b770af0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} alt={farmer.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="flex justify-between items-end -mt-10 mb-4">
                <Link to={`/farmer/${farmer.id}`} className="block transform hover:scale-105 transition-transform">
                  <img 
                    src={farmer.image_url || `https://ui-avatars.com/api/?name=${farmer.name.replace(' ', '+')}&background=random&color=fff&size=128`} 
                    alt={farmer.name} 
                    className="w-20 h-20 rounded-full object-cover border-4 border-white relative z-10 shadow-sm bg-white"
                  />
                </Link>
              </div>

              <div className="mb-4">
                <Link to={`/farmer/${farmer.id}`} className="hover:text-farm-green-600 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900">{farmer.name}</h3>
                </Link>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1 text-red-400" />
                  {farmer.location || 'Location Not Shared'}
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6 text-sm">
                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  <Wheat className="w-4 h-4 mr-2 text-yellow-500" />
                  {farmer.primary_crop || 'General'}
                </div>
                <div className="font-medium text-gray-600">
                  {farmer.farm_size} Acres
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => toggleFollow(farmer.id)}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    farmer.isFollowing 
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
                    : 'bg-farm-green-600 text-white hover:bg-farm-green-700'
                  }`}
                >
                  {farmer.isFollowing ? (
                    <><UserCheck className="w-4 h-4 mr-2" /> Following</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                  )}
                </button>
                <Link
                  to={`/chat?user=${farmer.id}`}
                  className="flex items-center justify-center px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors shrink-0"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filteredFarmers.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No farmers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
