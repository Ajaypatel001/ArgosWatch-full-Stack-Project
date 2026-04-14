import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CloudRain, Bug, TrendingUp, Droplets, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` };
      const res = await fetch('/api/alerts', { headers });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/alerts/${id}/read`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const typeIcons = {
    weather: CloudRain,
    pest: Bug,
    market: TrendingUp,
    irrigation: Droplets,
    general: Bell
  };

  const severityColors = {
    low: 'border-blue-200 bg-blue-50',
    medium: 'border-yellow-200 bg-yellow-50',
    high: 'border-orange-200 bg-orange-50',
    critical: 'border-red-200 bg-red-50'
  };

  const severityBadge = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-farm-green-50 rounded-xl border border-farm-green-100">
              <Bell className="w-7 h-7 text-farm-green-600" />
            </div>
            Alerts & Notifications
          </h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400"><p className="font-medium">Loading alerts...</p></div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No alerts right now</p>
          <p className="text-sm mt-1">We'll notify you when something needs your attention</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => {
            const Icon = typeIcons[alert.type] || Bell;
            return (
              <div key={alert.id}
                className={`p-5 rounded-2xl border-2 transition-all ${alert.is_read ? 'bg-white border-gray-100 opacity-70' : severityColors[alert.severity] || 'bg-white border-gray-100'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${alert.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                    <Icon className={`w-5 h-5 ${alert.is_read ? 'text-gray-400' : 'text-farm-green-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold ${alert.is_read ? 'text-gray-500' : 'text-gray-900'}`}>{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${severityBadge[alert.severity] || 'bg-gray-100 text-gray-600'}`}>
                        {alert.severity}
                      </span>
                      {!alert.is_read && <span className="w-2 h-2 bg-farm-green-500 rounded-full"></span>}
                    </div>
                    <p className={`text-sm ${alert.is_read ? 'text-gray-400' : 'text-gray-600'}`}>{alert.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleString()}</span>
                      {!alert.is_read && (
                        <button onClick={() => markAsRead(alert.id)}
                          className="flex items-center gap-1 text-xs font-medium text-farm-green-600 hover:text-farm-green-700 transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
