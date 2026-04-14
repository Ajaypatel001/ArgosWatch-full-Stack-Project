import { Link } from 'react-router-dom';
import { CloudSun, Wind, Droplets, ArrowRight, MapPin } from 'lucide-react';

export default function WeatherWidget() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/weather" className="block group">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow px-5 py-4 flex items-center justify-between gap-4">
          {/* Left: Today's weather */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <CloudSun className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">24°C</span>
                <span className="text-sm text-gray-500">Partly Cloudy</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />New Delhi</span>
                <span className="flex items-center gap-1"><Wind className="w-3 h-3" />12 km/h</span>
                <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />65%</span>
              </div>
            </div>
          </div>

          {/* Right: Link hint */}
          <div className="text-xs font-semibold text-farm-green-600 group-hover:underline flex items-center gap-1 shrink-0">
            7-Day Forecast <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </div>
  );
}
