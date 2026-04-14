import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, LayoutDashboard, UserCircle, Settings, Users, Globe, ChevronDown, Menu, X, Tractor, Bell, TrendingUp, Bug } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close everything on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const mainLinks = [
    { name: 'Home', path: '/', icon: Leaf },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Farms', path: '/farms', icon: Tractor },
    { name: 'Alerts', path: '/alerts', icon: Bell },
    { name: 'Admin', path: '/admin', icon: Settings },
  ];

  const dropdownLinks = [
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Groups', path: '/groups', icon: Users },
    { name: 'Profile', path: '/profile', icon: UserCircle },
    { name: 'Market History', path: '/market-history', icon: TrendingUp },
    { name: 'Crop Diseases', path: '/crop-diseases', icon: Bug },
  ];

  const allLinks = [...mainLinks, ...dropdownLinks];
  const isDropdownActive = dropdownLinks.some(l => location.pathname === l.path);

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-100 shadow-sm z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-farm-green-100 rounded-lg group-hover:bg-farm-green-500 transition-colors">
              <Leaf className="w-6 h-6 text-farm-green-600 group-hover:text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">AgroWatch</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-farm-green-50 text-farm-green-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-farm-green-600' : 'text-gray-400'}`} />
                  {t('nav.' + link.name.toLowerCase())}
                </Link>
              );
            })}

            {/* Dropdown: Community / Groups / Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDropdownActive
                    ? 'bg-farm-green-50 text-farm-green-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Users className={`w-4 h-4 mr-2 ${isDropdownActive ? 'text-farm-green-600' : 'text-gray-400'}`} />
                My Space
                <ChevronDown className={`w-3.5 h-3.5 ml-1.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 z-50">
                  {dropdownLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-farm-green-50 text-farm-green-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-farm-green-600' : 'text-gray-400'}`} />
                        {t('nav.' + link.name.toLowerCase())}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center ml-4 pl-4 border-l border-gray-200 group">
              <Globe className="w-4 h-4 text-gray-400 group-hover:text-farm-green-600 transition-colors mr-1.5" />
              <select 
                className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer hover:text-farm-green-600 transition-colors py-1"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {allLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-farm-green-50 text-farm-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-farm-green-600' : 'text-gray-400'}`} />
                  {t('nav.' + link.name.toLowerCase())}
                </Link>
              );
            })}
            {/* Mobile Language Selector */}
            <div className="flex items-center px-4 py-3 border-t border-gray-100 mt-2 pt-3">
              <Globe className="w-4 h-4 text-gray-400 mr-2" />
              <select 
                className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer py-1 flex-1"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
