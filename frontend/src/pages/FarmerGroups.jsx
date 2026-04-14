import { useState, useEffect } from 'react';
import { Users, Plus, X, MapPin, Search } from 'lucide-react';

export default function FarmerGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [newGroup, setNewGroup] = useState({ name: '', description: '', location: '', crop: '', members: '' });

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/groups');
        const data = await res.json();
        setGroups(data.map(g => ({
          ...g,
          members: typeof g.members === 'string' ? g.members.split(',').map(m => m.trim()) : (g.members || [])
        })));
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim() || !newGroup.description.trim()) return;
    
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup)
      });
      const data = await res.json();
      
      setGroups(prev => [
        ...prev,
        {
          ...data,
          members: typeof data.members === 'string' ? data.members.split(',').map(m => m.trim()) : (data.members || [])
        }
      ]);
      setNewGroup({ name: '', description: '', location: '', crop: '', members: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.location.toLowerCase().includes(search.toLowerCase()) ||
    g.crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-farm-green-50 rounded-xl border border-farm-green-100">
              <Users className="w-7 h-7 text-farm-green-600" />
            </div>
            Farmer Groups
          </h1>
          <p className="text-gray-500 mt-1">Create and join farming communities near you</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-farm-green-600 hover:bg-farm-green-500 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups by name, location, or crop..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent"
        />
      </div>

      {/* Create Group Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create New Group</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in the details to start your farming community</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g. Haryana Rice Farmers"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={newGroup.description}
                  onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What is this group about?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newGroup.location}
                    onChange={e => setNewGroup({ ...newGroup, location: e.target.value })}
                    placeholder="e.g. Punjab"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Focus</label>
                  <input
                    type="text"
                    value={newGroup.crop}
                    onChange={e => setNewGroup({ ...newGroup, crop: e.target.value })}
                    placeholder="e.g. Wheat"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Members (comma-separated)</label>
                <input
                  type="text"
                  value={newGroup.members}
                  onChange={e => setNewGroup({ ...newGroup, members: e.target.value })}
                  placeholder="e.g. Raju, Meena, Anil"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-farm-green-600 hover:bg-farm-green-500 text-white rounded-full text-sm font-semibold transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
           <p className="font-medium">Loading groups...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No groups found</p>
          <p className="text-sm mt-1">Try a different search or create a new group</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(group => (
            <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-farm-green-50 rounded-xl border border-farm-green-100">
                  <Users className="w-5 h-5 text-farm-green-600" />
                </div>
                <span className="text-xs font-medium bg-farm-green-50 text-farm-green-700 px-2.5 py-1 rounded-full border border-farm-green-100">
                  {group.crop}
                </span>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{group.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-grow">{group.description}</p>
              <div className="flex items-center text-xs text-gray-400 mb-3">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {group.location}
              </div>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-farm-green-100 border-2 border-white flex items-center justify-center text-xs font-bold text-farm-green-700"
                      title={member}
                    >
                      {member.charAt(0)}
                    </div>
                  ))}
                  {group.members.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                      +{group.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">{group.members.length} members</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
