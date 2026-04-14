import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Leaf, 
  IndianRupee, 
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle
} from 'lucide-react';
import Card from '../components/Card';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [crops, setCrops] = useState([]);
  const [mandiData, setMandiData] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCropForm, setShowCropForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropForm, setCropForm] = useState({ name: '', season: '', ideal_ph: '' });

  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceForm, setPriceForm] = useState({ crop_name: '', price: '', location: '' });

  const getToken = () => localStorage.getItem('token') || '';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${getToken()}` };
      const [statsRes, cropsRes, mandiRes, usersRes, feedbackRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/crops'),
        fetch('/api/mandi'),
        fetch('/api/admin/users', { headers }),
        fetch('/api/feedback', { headers })
      ]);

      const [statsData, cropsData, mandiData, usersData, feedbackData] = await Promise.all([
        statsRes.ok ? statsRes.json() : {},
        cropsRes.ok ? cropsRes.json() : [],
        mandiRes.ok ? mandiRes.json() : [],
        usersRes.ok ? usersRes.json() : [],
        feedbackRes.ok ? feedbackRes.json() : []
      ]);

      setStats(statsData.totalUsers !== undefined ? statsData : null);
      setCrops(Array.isArray(cropsData) ? cropsData : []);
      setMandiData(Array.isArray(mandiData) ? mandiData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCropSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCrop ? `/api/crops/${editingCrop.id}` : '/api/crops';
      const method = editingCrop ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ name: cropForm.name, season: cropForm.season, description: cropForm.ideal_ph })
      });
      setShowCropForm(false);
      setEditingCrop(null);
      fetchAdminData();
    } catch (err) {
      console.error('Error saving crop:', err);
    }
  };

  const handleCropDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    try {
      await fetch(`/api/crops/${id}`, { method: 'DELETE', headers: getHeaders() });
      fetchAdminData();
    } catch (err) {
      console.error('Error deleting crop:', err);
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPrice ? `/api/mandi/${editingPrice.id}` : '/api/mandi';
      const method = editingPrice ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ crop_name: priceForm.crop_name, price: priceForm.price, location: priceForm.location })
      });
      setShowPriceForm(false);
      setEditingPrice(null);
      fetchAdminData();
    } catch (err) {
      console.error('Error saving price:', err);
    }
  };

  const handlePriceDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this price?')) return;
    try {
      await fetch(`/api/mandi/${id}`, { method: 'DELETE', headers: getHeaders() });
      fetchAdminData();
    } catch (err) {
      console.error('Error deleting price:', err);
    }
  };

  const handleUserStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      fetchAdminData();
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const handleFeedbackResolve = async (id) => {
    try {
      await fetch(`/api/feedback/${id}/resolve`, {
        method: 'PUT',
        headers: getHeaders()
      });
      fetchAdminData();
    } catch (err) {
      console.error('Error resolving feedback:', err);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard Stats', icon: BarChart3 },
    { id: 'crops', name: 'Manage Crops', icon: Leaf },
    { id: 'prices', name: 'Manage Prices', icon: IndianRupee },
    { id: 'users', name: 'Manage Users', icon: Users },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare },
  ];

  const renderDashboardStats = () => (
    <div className="space-y-6">
      {!stats ? (
        <div className="p-4 bg-orange-50 text-orange-800 rounded-lg">Admin access token required. Ensure you are logged in as admin.</div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Farmers" icon={Users} className="border-l-4 border-blue-500">
          <div className="flex justify-between items-end">
             <span className="text-4xl font-bold text-gray-900">{loading ? '--' : stats?.totalUsers || '0'}</span>
             <span className="text-sm font-medium text-farm-green-600 flex items-center bg-farm-green-50 px-2 py-1 rounded">
               {loading ? '...' : (stats?.activeUsers || '0')} Active
             </span>
          </div>
        </Card>
        <Card title="Total Crops Monitored" icon={Leaf} className="border-l-4 border-farm-green-500">
          <div className="flex justify-between items-end">
             <span className="text-4xl font-bold text-gray-900">{loading ? '--' : stats?.totalCrops || '0'}</span>
             <span className="text-sm font-medium text-farm-green-600 flex items-center bg-farm-green-50 px-2 py-1 rounded">
               <TrendingUp className="w-3 h-3 mr-1" /> Monitoring
             </span>
          </div>
        </Card>
        <Card title="Open Alerts" icon={AlertCircle} className="border-l-4 border-orange-500">
          <div className="flex justify-between items-end">
             <span className="text-4xl font-bold text-gray-900">{loading ? '--' : stats?.openFeedback || '0'}</span>
             <span className="text-sm font-medium text-orange-600 flex items-center bg-orange-50 px-2 py-1 rounded">
               Reported Issues
             </span>
          </div>
        </Card>
      </div>

      <Card title="Recent Activity" icon={BarChart3}>
        <div className="space-y-4">
          {loading ? <p className="text-sm text-gray-500">Loading activity...</p> : (stats?.recentUsers || []).map((user, i) => (
             <div key={user.id || i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
               <div className="w-2 h-2 mt-2 bg-farm-green-500 rounded-full"></div>
               <p className="text-gray-700">{user.name} from {user.location} joined on {new Date(user.created_at).toLocaleDateString()}. State: {user.status}.</p>
             </div>
          ))}
        </div>
      </Card>
      </>)}
    </div>
  );

  const renderManageCrops = () => (
    <Card title="Manage Crops Repository" icon={Leaf}>
      <div className="mb-4 flex justify-end">
        <button 
          onClick={() => {
            setEditingCrop(null);
            setCropForm({ name: '', season: '', ideal_ph: '' });
            setShowCropForm(true);
          }}
          className="bg-farm-green-600 hover:bg-farm-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <Plus className="w-4 h-4 mr-1" /> Add New Crop
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Season</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading crops...</td></tr>
            ) : crops.map((crop, i) => (
              <tr key={crop.id || i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.season}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.description?.substring(0, 30)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => {
                      setEditingCrop(crop);
                      setCropForm({ name: crop.name, season: crop.season, ideal_ph: crop.description });
                      setShowCropForm(true);
                    }} 
                    className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg mr-2 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleCropDelete(crop.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
{showCropForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowCropForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editingCrop ? 'Edit Crop' : 'Add New Crop'}</h2>
            <form onSubmit={handleCropSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
                <input type="text" required value={cropForm.name} onChange={e => setCropForm({...cropForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-farm-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                  <input type="text" value={cropForm.season} onChange={e => setCropForm({...cropForm, season: e.target.value})}
                    placeholder="e.g. Kharif" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-farm-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input type="text" value={cropForm.ideal_ph} onChange={e => setCropForm({...cropForm, ideal_ph: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-farm-green-500" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-5 py-2.5 bg-farm-green-600 hover:bg-farm-green-700 text-white rounded-lg text-sm font-semibold">
                  {editingCrop ? 'Save Changes' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );

  const renderManagePrices = () => (
    <Card title="Live Mandi Prices" icon={IndianRupee}>
      <div className="mb-4 flex justify-between items-center bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <div>
           <h4 className="font-semibold text-yellow-800">Add Prices Manually</h4>
           <p className="text-sm text-yellow-700">Database synchronization</p>
        </div>
        <button onClick={() => {
            setEditingPrice(null);
            setPriceForm({ crop_name: '', price: '', location: '' });
            setShowPriceForm(true);
          }}
          className="bg-white text-yellow-800 border border-yellow-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-100 flex items-center">
          <Plus className="w-4 h-4 mr-1" /> Add Price
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commodity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Q</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
               <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading prices...</td></tr>
            ) : mandiData.map((price, i) => (
              <tr key={price.id || i} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{price.crop_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{price.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-farm-green-600">₹{price.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(price.date || Date.now()).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => {
                      setEditingPrice(price);
                      setPriceForm({ crop_name: price.crop_name, price: price.price, location: price.location });
                      setShowPriceForm(true);
                    }} 
                    className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg mr-2 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handlePriceDelete(price.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

{showPriceForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowPriceForm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editingPrice ? 'Edit Price' : 'Add Price'}</h2>
            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name *</label>
                <input type="text" required value={priceForm.crop_name} onChange={e => setPriceForm({...priceForm, crop_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-farm-green-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (per Q) *</label>
                  <input type="number" required value={priceForm.price} onChange={e => setPriceForm({...priceForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-farm-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={priceForm.location} onChange={e => setPriceForm({...priceForm, location: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-farm-green-500" />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="px-5 py-2.5 bg-farm-green-600 hover:bg-farm-green-700 text-white rounded-lg text-sm font-semibold">
                  {editingPrice ? 'Save Changes' : 'Add Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Card>
  );

  const renderManageUsers = () => (
    <Card title="Registered Farmers" icon={Users}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">Loading users...</td></tr>
            ) : users.map((user, i) => (
              <tr key={user.id || i} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.status === 'active' ? (
                     <button onClick={() => handleUserStatus(user.id, 'suspended')} className="text-red-600 hover:text-red-900 text-xs font-semibold">Suspend</button>
                  ) : (
                     <button onClick={() => handleUserStatus(user.id, 'active')} className="text-green-600 hover:text-green-900 text-xs font-semibold">Activate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderFeedback = () => (
    <Card title="Farmer Feedback & Complaints" icon={MessageSquare}>
      <div className="space-y-4">
        {loading ? <p className="text-sm text-gray-500">Loading feedback...</p> : feedback.map((item, i) => (
          <div key={item.id || i} className={`p-4 rounded-lg border flex items-start space-x-4 ${item.is_resolved ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex-shrink-0 mt-1">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${item.is_resolved ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
                 {item.name ? item.name.substring(0, 2).toUpperCase() : '??'}
               </div>
            </div>
            <div className="flex-1">
              <h5 className={`${item.is_resolved ? 'text-green-900' : 'text-red-900'} font-semibold mb-1`}>{item.name}</h5>
              <p className={`${item.is_resolved ? 'text-green-800' : 'text-red-800'} text-sm`}>"{item.message}"</p>
              <div className={`mt-2 text-xs ${item.is_resolved ? 'text-green-600' : 'text-red-600'} flex justify-between items-center`}>
                <span>Received {new Date(item.created_at).toLocaleDateString()}</span>
                {!item.is_resolved && (
                  <button onClick={() => handleFeedbackResolve(item.id)} className="flex items-center hover:text-green-700 text-green-600 font-medium px-3 py-1 bg-green-50 rounded-lg transition-colors border border-green-200">
                     <CheckCircle className="w-4 h-4 mr-1" /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {feedback.length === 0 && !loading && <div className="text-center p-8 text-gray-500">No feedback submitted yet.</div>}
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboardStats();
      case 'crops': return renderManageCrops();
      case 'prices': return renderManagePrices();
      case 'users': return renderManageUsers();
      case 'feedback': return renderFeedback();
      default: return renderDashboardStats();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Admin Menu</h2>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-farm-green-50 text-farm-green-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-farm-green-600' : 'text-gray-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {renderContent()}
      </div>

    </div>
  );
}
