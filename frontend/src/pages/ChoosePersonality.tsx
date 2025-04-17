import { MessageSquare, Headphones, Smile, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ChatbotPersonality } from '../types';

export default function ChoosePersonality() {
  const navigate = useNavigate();

  const handleChoice = (personality: ChatbotPersonality) => {
    localStorage.setItem('chatbotPersonality', personality);
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-32">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your AI Companion</h1>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Select the type of companion that best matches your needs. Each personality is designed to provide unique support and guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => handleChoice('humour-friend')}
            className="glass-effect p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group"
          >
            <div className="relative inline-block mb-4">
              <Smile className="h-16 w-16 text-green-600" />
              <Sparkles className="h-6 w-6 text-green-400 absolute -top-2 -right-2 animate-float" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-green-600 transition-colors">
              Humour Friend
            </h3>
            <p className="text-gray-600">
              A cheerful companion who brings light-hearted conversation and humor to brighten your day
            </p>
          </button>

          <button
            onClick={() => handleChoice('listener')}
            className="glass-effect p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group"
          >
            <div className="relative inline-block mb-4">
              <Headphones className="h-16 w-16 text-green-600" />
              <Sparkles className="h-6 w-6 text-green-400 absolute -top-2 -right-2 animate-float" style={{ animationDelay: '0.5s' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-green-600 transition-colors">
              Listener
            </h3>
            <p className="text-gray-600">
              An empathetic companion focused on understanding and validating your feelings
            </p>
          </button>

          <button
            onClick={() => handleChoice('motivator')}
            className="glass-effect p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group"
          >
            <div className="relative inline-block mb-4">
              <MessageSquare className="h-16 w-16 text-green-600" />
              <Sparkles className="h-6 w-6 text-green-400 absolute -top-2 -right-2 animate-float" style={{ animationDelay: '1s' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-green-600 transition-colors">
              Motivator
            </h3>
            <p className="text-gray-600">
              An encouraging companion who helps you stay focused on your goals and personal growth
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}