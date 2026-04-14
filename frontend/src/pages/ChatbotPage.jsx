import { Cpu, Send, MessageSquare } from 'lucide-react';
import Card from '../components/Card';
import { useState } from 'react';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AgroWatch AI assistant. How can I help you with your crop management today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: data.botReply || data.text || "Sorry, I couldn't process that.", 
        sender: 'bot' 
      }]);
    } catch (error) {
      console.error('Chatbot API error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Error connecting to AgroBot.", 
        sender: 'bot' 
      }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Cpu className="w-6 h-6 mr-2 text-farm-green-600" />
          AI Chatbot Assistant
        </h1>
        <p className="text-gray-500 mt-1">Get instant advice on farming best practices and data analysis.</p>
      </div>
      
      <Card title="AgroBot Conversation" icon={MessageSquare} className="h-[70%] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-farm-green-600 text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <form onSubmit={handleSend} className="flex space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, weather, or soil..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent transition-all"
            />
            <button 
              type="submit"
              className="bg-farm-green-600 text-white p-2 px-4 rounded-lg hover:bg-farm-green-700 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-farm-green-500"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
