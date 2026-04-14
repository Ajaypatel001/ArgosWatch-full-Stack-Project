import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import TestimonialsSection from '../components/TestimonialsSection';
import WeatherWidget from '../components/WeatherWidget';
import InfoCards from '../components/InfoCards';

const heroImages = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000",
  "https://images.unsplash.com/photo-1592982537447-6f23f1b46571?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1500382017468-9049fee74a52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1595841696677-6489ff3b7456?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
];

export default function Home() {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <div className="relative min-h-[55vh] flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Background Image Slider with Overlay */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url("${img}")` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-farm-green-900/80 backdrop-blur-[2px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8 shadow-lg">
            <Leaf className="w-5 h-5 text-farm-green-400" />
            <span className="text-sm font-medium tracking-wide">{t('home.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-xl">
            Agro<span className="text-farm-green-400">Watch</span>
            <span className="block text-3xl md:text-4xl mt-4 font-semibold text-gray-200">{t('home.hero.title')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light drop-shadow-md">
            {t('home.hero.desc')}
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/dashboard" 
              className="group flex items-center justify-center bg-farm-green-500 hover:bg-farm-green-400 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-farm-green-500/30 hover:-translate-y-1"
            >
              {t('home.btn.start')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/profile" 
              className="flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:-translate-y-1"
            >
              {t('home.btn.profile')}
            </Link>
          </div>
        </div>
      </div>

      {/* ===== MIDDLE CONTENT SECTION ===== */}
      <div className="bg-gray-50">

        {/* Feature Highlights */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Data-Driven Yields", desc: "Maximize output with real-time analytics" },
              { icon: Leaf, title: "Smart Irrigation", desc: "Save water with AI recommendations" },
              { icon: ShieldCheck, title: "Crop Protection", desc: "Early warning system for diseases" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="mx-auto bg-farm-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-farm-green-100">
                  <feature.icon className="w-6 h-6 text-farm-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Widget */}
        <WeatherWidget />

        {/* Info Cards: Mandi, Guidance, Seeds */}
        <InfoCards />

        {/* ===== Image Section replacing Video ===== */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <img 
            src="/assets/SmartFarming.jpg" 
            alt="Smart Farming" 
            className="rounded-3xl shadow-lg w-full h-auto object-cover"
          />
        </div>

        {/* Success Stories / Impact Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Happy Farmer" 
                  className="rounded-3xl shadow-lg"
                />
                <div className="absolute -bottom-4 -right-4 bg-farm-green-600 p-5 rounded-2xl shadow-lg max-w-[200px]">
                  <p className="text-white font-bold text-base leading-tight">"Yield increased by 40% using AgroWatch!"</p>
                  <p className="text-farm-green-200 text-xs mt-2">- Rajesh from Haryana</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">Empowering 10,000+ Farmers Across India</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                AgroWatch isn't just a tool; it's a movement. We've helped thousands of farmers transition to smart farming, reducing water waste and picking the best seeds for their specific soil.
              </p>
              <ul className="space-y-3">
                {[
                  "24/7 Expert AI Support",
                  "Personalized Crop Calendars",
                  "Direct Market Access"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-farm-green-500 rounded-full"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Farmer Testimonials */}
        <TestimonialsSection />

        {/* Community Call to Action */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-farm-green-600 rounded-3xl overflow-hidden shadow-lg flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10 flex flex-col justify-center">
              <div className="inline-flex items-center space-x-2 bg-white/20 text-white border border-white/30 rounded-full px-3 py-1 text-sm font-medium w-max mb-6">
                <Users className="w-4 h-4" />
                <span>New Feature</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{t('home.connect')}</h2>
              <p className="text-farm-green-100 mb-8 max-w-lg leading-relaxed">
                Join our growing community! Follow up-to-date posts, message peers in your local network, and share tips directly to help maximize everyone's yield.
              </p>
              <div className="flex">
                <Link 
                  to="/community" 
                  className="bg-white text-farm-green-800 hover:bg-farm-green-50 px-6 py-3 rounded-full text-base font-semibold transition-all shadow-lg hover:-translate-y-1 flex items-center"
                >
                  {t('home.join')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 min-h-[300px] bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1595822527011-06788b770af0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")' }}>
              <div className="w-full h-full bg-gradient-to-l from-transparent to-farm-green-600/40"></div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}