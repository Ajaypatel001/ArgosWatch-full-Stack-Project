import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading'); // 'loading', 'authorized', 'incomplete'
  const location = useLocation();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          // If there is no token at all, they cannot view protected pages
          setStatus('incomplete');
          return;
        }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
           setStatus('incomplete');
           return;
        }

        const data = await res.json();
        
        // A robust check: if the profile has a 'crop' or 'farm_size', it's considered complete
        const saved = localStorage.getItem('profileData');
        if (saved) {
           const parsed = JSON.parse(saved);
           if (parsed.crop && parsed.crop.trim() !== '') {
             setStatus('authorized');
             return;
           }
        }

        if (data && data.name) {
           const fRes = await fetch(`/api/farmers/${data.id}`);
           if (fRes.ok) {
              const fData = await fRes.json();
              if (fData.primary_crop && fData.primary_crop.trim() !== '') {
                 setStatus('authorized');
                 return;
              }
           }
        }
        
        // Either they don't have a crop mapped, or fRes failed
        setStatus('incomplete');
      } catch (err) {
        console.error('Profile check error:', err);
        setStatus('incomplete');
      }
    };

    checkProfile();
  }, [location.pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
           <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-farm-green-100 border-t-farm-green-600 mb-2"></div>
           <p className="text-gray-500 font-medium">Verifying profile...</p>
        </div>
      </div>
    );
  }

  if (status === 'incomplete') {
    // Redirect uncompleted profiles to the profile page so they can fill it out.
    // They are only allowed to see Home or Profile until completion.
    return <Navigate to="/profile" state={{ from: location, message: 'Please complete your profile to access all features.' }} replace />;
  }

  return children;
}
