import { useState, useEffect } from 'react';
import { MapPin, Maximize, Wheat, Droplets, Plus, Edit2, Trash2, X } from 'lucide-react';
import Card from '../components/Card';

export default function FarmsPage() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    name: '', location: ''
  });

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` };
      const res = await fetch('/api/farms', { headers });
      const data = await res.json();
      setFarms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching farms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFarm ? `/api/farms/${editingFarm.id}` : '/api/farms';
      const method = editingFarm ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      setEditingFarm(null);
      setFormData({ name: '', location: '' });
      fetchFarms();
    } catch (err) {
      console.error('Error saving farm:', err);
    }
  };

  const handleEdit = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name, location: farm.location
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this farm?')) return;
    try {
      await fetch(`/api/farms/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      fetchFarms();
    } catch (err) {
      console.error('Error deleting farm:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
          <p className="text-gray-500 mt-1">Manage your farm plots and track their status</p>
        </div>
        <button
          onClick={() => { setEditingFarm(null); setFormData({ name: '', location: '' }); setShowForm(true); }}
          className="flex items-center gap-2 bg-farm-green-600 hover:bg-farm-green-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Farm
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => { setShowForm(false); setEditingFarm(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{editingFarm ? 'Edit Farm' : 'Add New Farm'}</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in the details of your farm plot</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name *</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Green Valley Farm" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Punjab" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingFarm(null); }}
                  className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-farm-green-600 hover:bg-farm-green-500 text-white rounded-full text-sm font-semibold transition-colors">
                  {editingFarm ? 'Save Changes' : 'Add Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farms Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400"><p className="font-medium">Loading farms...</p></div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Maximize className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No farms added yet</p>
          <p className="text-sm mt-1">Click "Add Farm" to register your first plot</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map(farm => (
            <Card key={farm.id} title={farm.name} icon={Wheat}>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500 pb-2">
                  <MapPin className="w-4 h-4 mr-1.5 text-red-400" /> {farm.location || 'No location'}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Active
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(farm)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(farm.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
