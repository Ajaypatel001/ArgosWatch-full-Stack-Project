import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import SoilPage from './pages/SoilPage';
import WeatherPage from './pages/WeatherPage';
import IrrigationPage from './pages/IrrigationPage';
import MandiPage from './pages/MandiPage';
import SeedPage from './pages/SeedPage';
import ChatbotPage from './pages/ChatbotPage';
import CommunityPage from './pages/CommunityPage';
import ChatPage from './pages/ChatPage';
import FarmerProfile from './pages/FarmerProfile';
import FarmerGroups from './pages/FarmerGroups';
import FarmsPage from './pages/FarmsPage';
import AlertsPage from './pages/AlertsPage';
import MarketHistoryPage from './pages/MarketHistoryPage';
import CropDiseasesPage from './pages/CropDiseasesPage';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans selection:bg-farm-green-500 selection:text-white">
        <Navbar />
        <main className="pt-16 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Protected Routes - require completed profile */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/soil" element={<ProtectedRoute><SoilPage /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/irrigation" element={<ProtectedRoute><IrrigationPage /></ProtectedRoute>} />
            <Route path="/mandi" element={<ProtectedRoute><MandiPage /></ProtectedRoute>} />
            <Route path="/seed" element={<ProtectedRoute><SeedPage /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/farmer/:id" element={<ProtectedRoute><FarmerProfile /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute><FarmerGroups /></ProtectedRoute>} />
            <Route path="/farms" element={<ProtectedRoute><FarmsPage /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="/market-history" element={<ProtectedRoute><MarketHistoryPage /></ProtectedRoute>} />
            <Route path="/crop-diseases" element={<ProtectedRoute><CropDiseasesPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </LanguageProvider>
  );
}

export default App;
