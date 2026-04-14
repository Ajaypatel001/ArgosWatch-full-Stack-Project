import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Image as ImageIcon, Search, ArrowLeft } from 'lucide-react';

const mockFarmers = [
  { id: 1, name: 'Suresh Patil', location: 'Maharashtra', image: 'https://ui-avatars.com/api/?name=Suresh+Patil&background=random' },
  { id: 2, name: 'Gurpreet Singh', location: 'Punjab', image: 'https://ui-avatars.com/api/?name=Gurpreet+Singh&background=random' },
  { id: 3, name: 'Ramlal Chaudhary', location: 'Haryana', image: 'https://ui-avatars.com/api/?name=Ramlal+Chaudhary&background=random' },
  { id: 4, name: 'Jitendra Patel', location: 'Gujarat', image: 'https://ui-avatars.com/api/?name=Jitendra+Patel&background=random' },
  { id: 5, name: 'Mohan Reddy', location: 'Andhra Pradesh', image: 'https://ui-avatars.com/api/?name=Mohan+Reddy&background=random' },
];

const mockMessages = {
  1: [
    { text: "Ram Ram bhau! How is the sugarcane yield this season?", sender: 'me', time: '10:00 AM' },
    { text: "Ram Ram! It is going good. We got some rain last week so the crop is healthy.", sender: 'them', time: '10:05 AM' },
  ],
  2: [
    { text: "Hello Gurpreet ji, are you using any new fertilizer for Wheat?", sender: 'them', time: 'Yesterday' },
    { text: "Yes, I shifted to an organic mix. It's working wonders for the soil.", sender: 'me', time: '9:30 AM' },
  ],
};

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const initialUserId = parseInt(searchParams.get('user')) || mockFarmers[0].id;

  const [activeUser, setActiveUser] = useState(mockFarmers.find(f => f.id === initialUserId) || mockFarmers[0]);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage = {
      text: messageText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => ({
      ...prev,
      [activeUser.id]: [...(prev[activeUser.id] || []), newMessage]
    }));

    setMessageText('');
  };

  const filteredFarmers = mockFarmers.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const activeChat = messages[activeUser.id] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col items-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex h-[calc(100vh-10rem)]">
        
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50 flex-shrink-0">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search farmers..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent transition-shadow"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredFarmers.map(farmer => (
              <button
                key={farmer.id}
                onClick={() => setActiveUser(farmer)}
                className={`w-full flex items-center p-4 border-b border-gray-100 transition-colors ${
                  activeUser.id === farmer.id ? 'bg-farm-green-50' : 'hover:bg-gray-100'
                }`}
              >
                <img src={farmer.image} alt={farmer.name} className="w-12 h-12 rounded-full mr-3 border border-gray-200" />
                <div className="text-left overflow-hidden">
                  <h3 className="font-semibold text-gray-900 truncate">{farmer.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{farmer.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 relative">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center">
              <Link to="/community" className="md:hidden mr-3 p-2 text-gray-500 hover:bg-gray-100 rounded-full cursor-pointer">
                 <ArrowLeft w-5 h-5 />
              </Link>
              <img src={activeUser.image} alt={activeUser.name} className="w-10 h-10 rounded-full mr-3 border border-gray-200" />
              <div>
                <h3 className="font-bold text-gray-900">{activeUser.name}</h3>
                <p className="text-xs text-farm-green-600 font-medium">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChat.length === 0 ? (
              <div className="h-full flex items-center justify-center flex-col text-gray-400 space-y-3">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-300"/>
                </div>
                <p>Start a conversation with {activeUser.name}</p>
              </div>
            ) : (
              activeChat.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                    msg.sender === 'me' 
                    ? 'bg-farm-green-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-farm-green-200' : 'text-gray-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder={`Message ${activeUser.name}...`}
                className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-farm-green-500 focus:ring-2 focus:ring-farm-green-200 rounded-full px-4 py-2 text-sm transition-all"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!messageText.trim()}
                className={`p-2.5 rounded-full transition-colors ${
                  messageText.trim() 
                  ? 'bg-farm-green-600 text-white hover:bg-farm-green-700 shadow-md' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
