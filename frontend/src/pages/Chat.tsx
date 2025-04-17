import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here to chat with you. How are you feeling today?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand how you're feeling. Would you like to tell me more about that?",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-32">
      <div className="max-w-4xl mx-auto px-4">
        <div className="glass-effect rounded-2xl shadow-lg h-[600px] flex flex-col animate-fade-in">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'glass-effect'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">AI Companion</span>
                    </div>
                  )}
                  <p className={message.sender === 'user' ? 'text-white' : 'text-gray-800'}>
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200/50 p-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}