import { useState, useEffect } from 'react';
import { Bug, Search, AlertTriangle, ShieldCheck, Leaf } from 'lucide-react';

export default function CropDiseasesPage() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crop-diseases');
      const data = await res.json();
      setDiseases(data);
    } catch (err) {
      console.error('Error fetching diseases:', err);
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    low: { bg: 'bg-blue-50 border-blue-100', badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-500' },
    medium: { bg: 'bg-yellow-50 border-yellow-100', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-500' },
    high: { bg: 'bg-red-50 border-red-100', badge: 'bg-red-100 text-red-700', icon: 'text-red-500' }
  };

  const filtered = diseases.filter(d =>
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.crop_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.symptoms || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-farm-green-50 rounded-xl border border-farm-green-100">
            <Bug className="w-7 h-7 text-farm-green-600" />
          </div>
          Crop Disease Database
        </h1>
        <p className="text-gray-500 mt-1">Identify diseases, learn symptoms, and find treatments</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by disease name, crop, or symptoms..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent" />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><p className="font-medium">Loading diseases...</p></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bug className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No diseases found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map(disease => {
            const colors = severityColors[disease.severity] || severityColors.medium;
            return (
              <div key={disease.id} className={`p-6 rounded-2xl border-2 ${colors.bg} transition-all hover:shadow-md`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{disease.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${colors.badge}`}>
                        {disease.severity}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Leaf className="w-4 h-4 mr-1.5 text-farm-green-500" />
                      Affects: <span className="font-semibold ml-1">{disease.crop_name || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${colors.icon}`} />
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Symptoms</h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{disease.symptoms || 'Not available'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Bug className="w-4 h-4 text-orange-500" />
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Treatment</h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{disease.treatment || 'Not available'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-farm-green-500" />
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Prevention</h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{disease.prevention || 'Not available'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
