import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Wheat, Maximize, UserCheck, UserPlus, MessageCircle, ArrowLeft, Calendar, ShieldCheck, Award } from 'lucide-react';

export default function FarmerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmer = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/farmers/${id}`);
        if (!res.ok) throw new Error('Farmer not found');
        const data = await res.json();
        setFarmer(data);
        // In a real app, we'd also fetch the following status
        setIsFollowing(false); 
      } catch (err) {
        console.error('Error fetching farmer:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmer();
  }, [id]);

  const toggleFollow = async () => {
    try {
      const res = await fetch(`/api/farmers/${id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 animate-pulse">Loading farmer profile...</h2>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Farmer not found</h2>
        <Link to="/community" className="text-farm-green-600 hover:underline mt-4 inline-block">Back to Community</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center space-x-2 text-gray-500 hover:text-farm-green-600 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back</span>
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        {/* Cover Photo */}
        <div className="h-64 bg-slate-200 relative overflow-hidden">
          <img 
            src={farmer.image_url || 'https://images.unsplash.com/photo-1595822527011-06788b770af0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
            alt="Farm Cover" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <div className="px-8 pb-10">
          {/* Profile Header */}
          <div className="relative flex flex-col md:flex-row justify-between items-end -mt-16 mb-8 md:space-x-8">
            <div className="relative rounded-full p-2 bg-white inline-block shadow-lg">
              <img 
                src={farmer.image_url || `https://ui-avatars.com/api/?name=${farmer.name.replace(' ', '+')}&background=random&color=fff&size=200`} 
                alt={farmer.name} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white"
              />
              <div className="absolute bottom-2 right-2 bg-farm-green-500 p-2 rounded-full border-4 border-white shadow-sm">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-grow text-center md:text-left mt-4 md:mt-0 pt-4 md:pt-16 uppercase tracking-wider">
               <div className="inline-flex items-center space-x-1 text-farm-green-600 bg-farm-green-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  <Award className="w-3 h-3" />
                  <span>Verified Farmer</span>
               </div>
               <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{farmer.name}</h1>
               <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start mt-1">
                  <MapPin className="w-4 h-4 mr-1.5 text-red-400" />
                  {farmer.location || 'Location Not Shared'}
               </p>
            </div>

            <div className="flex space-x-4 mt-6 md:mt-0 md:mb-4">
              <button 
                onClick={toggleFollow}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${
                  isFollowing 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-farm-green-600 text-white hover:bg-farm-green-700'
                }`}
              >
                {isFollowing ? (
                  <><UserCheck className="w-5 h-5" /> <span>Following</span></>
                ) : (
                  <><UserPlus className="w-5 h-5" /> <span>Follow</span></>
                )}
              </button>
              <Link 
                to={`/chat?user=${farmer.id}`}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 shadow-blue-100"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Info */}
            <div className="lg:col-span-2 space-y-8">
               <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    About
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg font-light">
                    {farmer.bio}
                  </p>
               </section>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-farm-green-200 transition-colors">
                    <div className="p-3 bg-white rounded-xl shadow-sm mr-4 text-farm-green-600 border border-gray-100">
                      <Maximize className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Farm Size</p>
                       <p className="text-xl font-bold text-gray-900">{farmer.farm_size} Acres</p>
                    </div>
                  </div>
                  <div className="flex items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-yellow-200 transition-colors">
                    <div className="p-3 bg-white rounded-xl shadow-sm mr-4 text-yellow-600 border border-gray-100">
                      <Wheat className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Primary Crop</p>
                       <p className="text-xl font-bold text-gray-900">{farmer.primary_crop || 'General'}</p>
                    </div>
                  </div>
               </div>

               {/* Mock Achievements */}
               <section className="pt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Farmer Achievements</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Top Contributor', 'Sustainable Farmer', 'Community Leader', 'Expert Yield'].map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-gradient-to-r from-farm-green-50 to-white text-farm-green-800 text-sm font-semibold rounded-full border border-farm-green-100 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
               </section>
            </div>

            {/* Right Column - Sidebar info */}
            <div className="space-y-6">
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    Farmer Stats
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center text-sm">
                       <span className="text-gray-500">Member Since</span>
                       <span className="font-bold text-gray-800">{new Date(farmer.created_at).getFullYear()}</span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Followers</span>
                      <span className="font-bold text-gray-800">1,240</span>
                    </li>
                    <li className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Harvests Shared</span>
                      <span className="font-bold text-gray-800">42</span>
                    </li>
                  </ul>
               </div>

               <div className="bg-farm-green-50 rounded-2xl p-6 border border-farm-green-100">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-farm-green-600" />
                    Connect Safely
                  </h4>
                  <p className="text-xs text-farm-green-700 leading-relaxed">
                    This farmer is a verified member of the AgroWatch community. Remember to be respectful when messaging.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
