import { Link } from 'react-router-dom';
import { Leaf, Globe, MessageCircle, Camera, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-2 group inline-flex">
              <div className="p-2 bg-farm-green-100 rounded-lg group-hover:bg-farm-green-500 transition-colors">
                <Leaf className="w-6 h-6 text-farm-green-600 group-hover:text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">AgroWatch</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              Empowering farmers with smart AI solutions. Get real-time weather, soil analysis, crop advice, and connect with a growing community of modern farmers.
            </p>
            <div className="flex space-x-4 mt-3">
              <a href="#" className="text-gray-400 hover:text-farm-green-600 transition-colors">
                <span className="sr-only">Facebook</span>
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-farm-green-600 transition-colors">
                <span className="sr-only">Instagram</span>
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-farm-green-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-farm-green-600 transition-colors">
                <span className="sr-only">Email</span>
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-2">Features</h3>
            <ul className="space-y-1.5 text-sm text-gray-500">
              <li><Link to="/dashboard" className="hover:text-farm-green-600 transition-colors">Dashboard</Link></li>
              <li><Link to="/soil" className="hover:text-farm-green-600 transition-colors">Soil Analysis</Link></li>
              <li><Link to="/weather" className="hover:text-farm-green-600 transition-colors">Weather Forecast</Link></li>
              <li><Link to="/mandi" className="hover:text-farm-green-600 transition-colors">Mandi Prices</Link></li>
              <li><Link to="/community" className="hover:text-farm-green-600 transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-2">Contact</h3>
            <ul className="space-y-1.5 text-sm text-gray-500">
              <li>1800-AGRO-WATCH (Toll Free)</li>
              <li>support@agrowatch.in</li>
              <li>New Delhi, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} AgroWatch. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
