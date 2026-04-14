import { useState, useEffect } from 'react';
import { User, MapPin, Maximize, Wheat, Edit2, Trash2, Camera, ShieldCheck, Mail, Lock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', location: '',
    farmSize: '', crop: '', image_url: '', isPublic: true, hideLocation: false
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    // First try local storage cache to quickly load complete profiles
    const saved = localStorage.getItem('profileData');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.crop) {
        setProfile(parsed);
        setFormData(prev => ({...prev, ...parsed}));
        setIsLoading(false);
        return;
      }
    }

    // Otherwise fetch fresh data to see if profile is complete
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const me = await res.json();
      
      const res2 = await fetch(`/api/farmers/${me.id}`);
      let crop = '';
      if (res2.ok) {
        const farmer = await res2.json();
        crop = farmer.primary_crop || '';
      }
      
      const fetchedProfile = {
        name: me.name,
        email: me.email,
        mobile: me.mobile || '',
        location: me.location || '',
        farmSize: '', // DB doesn't return on GET, fallback to user entry
        crop: crop,
        image_url: '',
        isPublic: true,
        hideLocation: false
      };
      
      if (crop) {
        setProfile(fetchedProfile);
        setFormData(fetchedProfile);
        localStorage.setItem('profileData', JSON.stringify(fetchedProfile));
      } else {
        // Force edit for incomplete profile
        setProfile(null);
        setIsEditing(true);
        setFormData(fetchedProfile);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('profileData');
    }
    setIsLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Login failed');
        return;
      }
      localStorage.setItem('token', data.token);
      
      // Check if they have a primary_crop (completed profile)
      const fRes = await fetch(`/api/farmers/${data.user.id}`);
      const fData = fRes.ok ? await fRes.json() : {};
      
      if (fData.primary_crop) {
        navigate('/dashboard'); // Profile is fully created! Proceed to app.
      } else {
        // Logged in, but profile incomplete. Switch to complete profile mode.
        setProfile(null);
        setIsEditing(true);
        setFormData(prev => ({...prev, name: data.user.name, email: data.user.email}));
      }
    } catch (err) {
      console.error(err);
      alert('Login error');
    }
  };

  const handleRegisterOrUpdate = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem('token');
    
    try {
      // 1. If no token, we must register the user first
      if (!token) {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name, email: formData.email, password: formData.password,
            mobile: formData.mobile, location: formData.location
          })
        });
        const regData = await regRes.json();
        if (!regRes.ok) {
          alert(regData.message || 'Registration failed');
          return;
        }
        token = regData.token;
        localStorage.setItem('token', token);
      }

      // 2. Now perform the PUT /profile to attach crop, farmSize, etc.
      // Even if they just logged in and had missing fields, they hit this step to save them.
      await fetch('/api/farmers/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          farm_size: formData.farmSize,
          primary_crop: formData.crop,
          is_public: formData.isPublic ? 1 : 0,
          hide_location: formData.hideLocation ? 1 : 0
        })
      });
      
      // 3. Keep local copy to bypass auth checking lags
      const fullProfile = {
         name: formData.name,
         email: formData.email,
         mobile: formData.mobile,
         location: formData.location,
         image_url: formData.image_url,
         farmSize: formData.farmSize,
         crop: formData.crop,
         isPublic: formData.isPublic,
         hideLocation: formData.hideLocation
      };
      localStorage.setItem('profileData', JSON.stringify(fullProfile));
      
      setProfile(fullProfile);
      setIsEditing(false);
      
      // If they just signed up, route them to dashboard immediately!
      navigate('/dashboard');

    } catch(err) {
      console.error(err);
      alert('Error saving profile');
    }
  };

  const handleDelete = async () => {
    if(confirm('Are you sure you want to delete your profile?')) {
      try {
        await fetch('/api/farmers/profile', { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
        });
        localStorage.removeItem('token');
        localStorage.removeItem('profileData');
        setProfile(null);
        setAuthMode('login');
        setFormData({ name: '', email: '', password: '', mobile: '', location: '', farmSize: '', crop: '', image_url: '', isPublic: true, hideLocation: false });
        alert('Profile deleted successfully');
        navigate('/');
      } catch (err) {
        console.error('Error deleting profile:', err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileData');
    setProfile(null);
    setAuthMode('login');
    navigate('/');
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading your profile...</div>;
  }

  const renderAuthForms = () => {
    if (authMode === 'login') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md mx-auto mt-8 animate-fade-in text-left">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Login to your AgroWatch account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent outline-none transition-shadow" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 focus:border-transparent outline-none transition-shadow" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="w-full bg-farm-green-600 hover:bg-farm-green-700 text-white py-3 rounded-lg font-medium transition-colors shadow-sm mt-4">
              Login to AgroWatch
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button onClick={() => setAuthMode('register')} className="text-farm-green-600 font-bold hover:underline">
              Create Profile Now
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-2xl mx-auto mt-8 animate-fade-in text-left">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Farmer Profile</h2>
          <p className="text-gray-500 mt-2">Set up your farming parameters to unlock personalized AI features</p>
        </div>
        <form onSubmit={handleRegisterOrUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="e.g. Ramesh Kumar" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="farm@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="+91 9876543210" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
            </div>
          </div>
          
          <hr className="border-gray-100" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Village <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="e.g. Punjab, India" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (Acres) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="number" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="e.g. 5" value={formData.farmSize} onChange={e => setFormData({...formData, farmSize: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Crop <span className="text-red-500">*</span></label>
              <div className="relative">
                <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" required className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="e.g. Wheat" value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500 outline-none" placeholder="https://example.com/avatar.jpg" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-farm-green-600 hover:bg-farm-green-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-farm-green-500/30 mt-4 text-lg">
            Create Profile & Enter App
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button onClick={() => setAuthMode('login')} className="text-farm-green-600 font-bold hover:underline">
            Login Here
          </button>
        </div>
      </div>
    );
  };

  const renderEditForm = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto mt-8 text-left">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Complete / Edit Profile</h2>
        <p className="text-gray-500 mt-2">Finish setting up your farming parameters</p>
      </div>

      <form onSubmit={handleRegisterOrUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500" placeholder="e.g. Ramesh Kumar" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Village *</label>
            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500" placeholder="e.g. Punjab, India" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (Acres) *</label>
            <input type="number" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500" placeholder="e.g. 5" value={formData.farmSize} onChange={e => setFormData({...formData, farmSize: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Crop *</label>
            <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500" placeholder="e.g. Wheat" value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} />
          </div>
          <div className="md:col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
             <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farm-green-500" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
             <ShieldCheck className="w-5 h-5 mr-2 text-farm-green-600" />
             Privacy Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Public Profile</p>
                <p className="text-xs text-gray-500">Allow other farmers to see your profile in the community</p>
              </div>
              <button type="button" onClick={() => setFormData({...formData, isPublic: !formData.isPublic})} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${formData.isPublic ? 'bg-farm-green-600' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Show My Location</p>
                <p className="text-xs text-gray-500">Display your village/location on your public profile</p>
              </div>
              <button type="button" onClick={() => setFormData({...formData, hideLocation: !formData.hideLocation})} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${!formData.hideLocation ? 'bg-farm-green-600' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${!formData.hideLocation ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <button type="submit" className="flex-1 bg-farm-green-600 hover:bg-farm-green-700 text-white py-3 rounded-lg font-medium transition-colors">
            Save Profile Details
          </button>
          {profile && (
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-3xl mx-auto mt-8 animate-fade-in text-left">
      <div className="flex justify-end mb-4">
        <button onClick={handleLogout} className="text-gray-500 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg bg-white shadow-sm font-medium transition-all">
          Log Out
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden relative">
        <div className="h-32 bg-farm-green-600 w-full relative">
           <img src="https://images.unsplash.com/photo-1592982537447-6f23f1b46571?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Farm Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative rounded-full p-1 bg-white inline-block">
              <img 
                src={profile.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=16a34a&color=fff&size=128`} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover shadow-sm bg-white"
              />
            </div>
            
            <div className="flex space-x-3 mb-2">
              <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors">
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button onClick={handleDelete} className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1 pb-[1px]" />
              {profile.hideLocation ? 'Location Hidden' : profile.location}
            </p>
            {!profile.isPublic && (
               <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Private Profile
               </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="p-3 bg-farm-green-100 text-farm-green-600 rounded-lg mr-4">
                <Maximize className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Farm Size</p>
                <p className="text-lg font-semibold text-gray-900">{profile.farmSize || '--'} Acres</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg mr-4">
                <Wheat className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Primary Crop</p>
                <p className="text-lg font-semibold text-gray-900">{profile.crop || '--'}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      {(!profile && !isEditing) && renderAuthForms()}
      {isEditing && renderEditForm()}
      {(profile && !isEditing) && renderProfile()}
    </div>
  );
}
