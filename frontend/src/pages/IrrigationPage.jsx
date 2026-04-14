import { Droplets, Settings, Power } from 'lucide-react';
import Card from '../components/Card';
import { useState, useEffect } from 'react';

export default function IrrigationPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` };
    fetch('/api/irrigation', { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setSchedules(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching irrigation schedules:', err);
        setSchedules([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Droplets className="w-8 h-8 mr-3 text-blue-500" />
          Smart Irrigation Control
        </h1>
        <p className="text-gray-500 mt-2">Manage water usage based on AI recommendations and real-time soil moisture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Current Status & Recommendation" icon={Droplets} className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
           <div className="flex flex-col h-full justify-center text-center p-6">
             <div className="mx-auto bg-blue-100 rounded-full p-6 mb-4 relative">
               <Droplets className="w-16 h-16 text-blue-600 animate-pulse" />
               <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Water Needed Soon</h2>
             <p className="text-gray-600 mb-8 max-w-sm mx-auto">Soil moisture is dropping below optimal levels for Wheat. No rain is expected today.</p>
             
             <div className="flex space-x-4 max-w-sm mx-auto w-full">
               <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center">
                 <Power className="w-5 h-5 mr-2" /> Start Pump
               </button>
             </div>
           </div>
        </Card>

        <Card title="Irrigation Schedule" icon={Settings}>
          <div className="space-y-4">
            {loading ? <p className="text-sm text-gray-500">Loading schedules...</p> : schedules.map((schedule, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-gray-800">{schedule.plot_name} ({schedule.crop_name})</h4>
                  <p className="text-sm text-gray-500">
                    {schedule.status === 'completed' ? 'Completed: ' : 'Scheduled: '} 
                    {new Date(schedule.next_irrigation).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    schedule.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {schedule.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between items-center p-4 border border-dashed border-gray-300 rounded-xl text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <span className="w-full text-sm font-medium text-farm-green-600 py-2">+ Add New Schedule</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
