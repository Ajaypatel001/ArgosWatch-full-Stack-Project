/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.community': 'Community',
    'nav.groups': 'Groups',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'nav.farms': 'Farms',
    'nav.alerts': 'Alerts',
    'nav.market history': 'Market History',
    'nav.crop diseases': 'Crop Diseases',
    'home.badge': 'The Future of Agriculture is Here',
    'home.hero.title': 'Smart Farming System',
    'home.hero.desc': 'AI-based agriculture solution for farmers. Optimize your yield, monitor your soil, and get real-time market prices in one unified dashboard.',
    'home.btn.start': 'Get Started',
    'home.btn.profile': 'Create Profile',
    'home.connect': 'Connect with Farmers',
    'home.join': 'Join Community'
  },
  hi: {
    'nav.home': 'मुख्य पृष्ठ',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.community': 'समुदाय',
    'nav.groups': 'समूह',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.admin': 'एडमिन',
    'nav.farms': 'खेत',
    'nav.alerts': 'अलर्ट',
    'nav.market history': 'बाज़ार इतिहास',
    'nav.crop diseases': 'फसल रोग',
    'home.badge': 'कृषि का भविष्य यहाँ है',
    'home.hero.title': 'स्मार्ट फार्मिंग सिस्टम',
    'home.hero.desc': 'किसानों के लिए एआई-आधारित कृषि समाधान। अपनी उपज बढ़ाएं, मिट्टी की निगरानी करें और एक डैशबोर्ड में रीयल-टाइम बाजार मूल्य पाएं।',
    'home.btn.start': 'शुरू करें',
    'home.btn.profile': 'प्रोफ़ाइल बनाएं',
    'home.connect': 'किसानों से जुड़ें',
    'home.join': 'समुदाय से जुड़ें'
  },
  pa: {
    'nav.home': 'ਮੁੱਖ ਪੰਨਾ',
    'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'nav.community': 'ਭਾਈਚਾਰਾ',
    'nav.groups': 'ਸਮੂਹ',
    'nav.profile': 'ਪ੍ਰੋਫਾਈਲ',
    'nav.admin': 'ਐਡਮਿਨ',
    'nav.farms': 'ਖੇਤ',
    'nav.alerts': 'ਅਲਰਟ',
    'nav.market history': 'ਮਾਰਕੀਟ ਇਤਿਹਾਸ',
    'nav.crop diseases': 'ਫਸਲ ਰੋਗ',
    'home.badge': 'ਖੇਤੀਬਾੜੀ ਦਾ ਭਵਿੱਖ ਇੱਥੇ ਹੈ',
    'home.hero.title': 'ਸਮਾਰਟ ਖੇਤੀਬਾੜੀ ਪ੍ਰਣਾਲੀ',
    'home.hero.desc': 'ਕਿਸਾਨਾਂ ਲਈ ਏਆਈ-ਅਧਾਰਤ ਖੇਤੀ ਹੱਲ। ਆਪਣੀ ਫਸਲ ਨੂੰ ਵਧਾਓ ਅਤੇ ਮਾਰਕੀਟ ਦੀਆਂ ਕੀਮਤਾਂ ਜਾਣੋ।',
    'home.btn.start': 'ਸ਼ੁਰੂ ਕਰੋ',
    'home.btn.profile': 'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ',
    'home.connect': 'ਕਿਸਾਨਾਂ ਨਾਲ ਜੁੜੋ',
    'home.join': 'ਭਾਈਚਾਰੇ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ'
  },
  mr: {
    'nav.home': 'मुख्यपृष्ठ',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.community': 'समुदाय',
    'nav.groups': 'गट',
    'nav.profile': 'प्रोफाइल',
    'nav.admin': 'प्रशासक',
    'nav.farms': 'शेत',
    'nav.alerts': 'सूचना',
    'nav.market history': 'बाजारभाव इतिहास',
    'nav.crop diseases': 'पीक रोग',
    'home.badge': 'शेतीचे भविष्य येथे आहे',
    'home.hero.title': 'स्मार्ट शेती प्रणाली',
    'home.hero.desc': 'शेतकऱ्यांसाठी एआय-आधारित कृषी उपाय. एका डॅशबोर्डमध्ये पिकाचे उत्पन्न वाढवा आणि बाजारभाव मिळवा.',
    'home.btn.start': 'सुरू करा',
    'home.btn.profile': 'प्रोफाइल तयार करा',
    'home.connect': 'शेतकऱ्यांशी संपर्कात राहा',
    'home.join': 'समुदायात सामील व्हा'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
